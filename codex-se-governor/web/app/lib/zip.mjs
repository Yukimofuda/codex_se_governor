const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const MAX_FILES = 2000;
const MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const MAX_RATIO = 100;

let crcTable;

function table() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[n] = value >>> 0;
  }
  return crcTable;
}

export function crc32(bytes) {
  let crc = 0xffffffff;
  const values = table();
  for (const byte of bytes) crc = values[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function concat(chunks) {
  const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function header(size) {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

export function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  const { time, day } = dosTimestamp();
  const entries = Object.entries(files).sort(([left], [right]) => left.localeCompare(right));

  for (const [path, value] of entries) {
    const name = textEncoder.encode(path.replace(/^\/+/, ""));
    const data = typeof value === "string" ? textEncoder.encode(value) : value;
    const crc = crc32(data);
    const local = header(30);
    local.view.setUint32(0, 0x04034b50, true);
    local.view.setUint16(4, 20, true);
    local.view.setUint16(6, 0x0800, true);
    local.view.setUint16(8, 0, true);
    local.view.setUint16(10, time, true);
    local.view.setUint16(12, day, true);
    local.view.setUint32(14, crc, true);
    local.view.setUint32(18, data.length, true);
    local.view.setUint32(22, data.length, true);
    local.view.setUint16(26, name.length, true);
    local.view.setUint16(28, 0, true);
    localParts.push(local.bytes, name, data);

    const central = header(46);
    central.view.setUint32(0, 0x02014b50, true);
    central.view.setUint16(4, 20, true);
    central.view.setUint16(6, 20, true);
    central.view.setUint16(8, 0x0800, true);
    central.view.setUint16(10, 0, true);
    central.view.setUint16(12, time, true);
    central.view.setUint16(14, day, true);
    central.view.setUint32(16, crc, true);
    central.view.setUint32(20, data.length, true);
    central.view.setUint32(24, data.length, true);
    central.view.setUint16(28, name.length, true);
    central.view.setUint16(30, 0, true);
    central.view.setUint16(32, 0, true);
    central.view.setUint16(34, 0, true);
    central.view.setUint16(36, 0, true);
    central.view.setUint32(38, 0, true);
    central.view.setUint32(42, localOffset, true);
    centralParts.push(central.bytes, name);
    localOffset += local.bytes.length + name.length + data.length;
  }

  const centralDirectory = concat(centralParts);
  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(4, 0, true);
  end.view.setUint16(6, 0, true);
  end.view.setUint16(8, entries.length, true);
  end.view.setUint16(10, entries.length, true);
  end.view.setUint32(12, centralDirectory.length, true);
  end.view.setUint32(16, localOffset, true);
  end.view.setUint16(20, 0, true);
  return concat([...localParts, centralDirectory, end.bytes]);
}

function findEnd(view) {
  const minimum = Math.max(0, view.byteLength - 65557);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  return -1;
}

function pathProblems(path) {
  const normalized = path.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const issues = [];
  if (!path || path.includes("\0")) issues.push("invalid filename");
  if (normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized)) issues.push("absolute path");
  if (parts.includes("..")) issues.push("path traversal");
  if (parts.some((part) => part === "__MACOSX" || part === ".pytest_cache" || part === "__pycache__")) issues.push("generated directory");
  if (parts.at(-1) === ".DS_Store" || normalized.endsWith(".pyc")) issues.push("generated file");
  return issues;
}

export function inspectZip(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const issues = [];
  if (bytes.length > MAX_ARCHIVE_BYTES) issues.push(`archive exceeds ${MAX_ARCHIVE_BYTES} bytes`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const endOffset = findEnd(view);
  if (endOffset < 0) return { entries: [], issues: ["invalid ZIP: end record not found"] };
  const count = view.getUint16(endOffset + 10, true);
  const centralOffset = view.getUint32(endOffset + 16, true);
  if (count > MAX_FILES) issues.push(`archive has ${count} files; limit is ${MAX_FILES}`);
  const entries = [];
  let offset = centralOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      issues.push("invalid ZIP central directory");
      break;
    }
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const externalAttributes = view.getUint32(offset + 38, true);
    const nameStart = offset + 46;
    let path;
    try {
      path = textDecoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    } catch {
      path = `[invalid-utf8-${index}]`;
      issues.push(`entry ${index + 1} has invalid UTF-8 path`);
    }
    const unixType = (externalAttributes >>> 16) & 0xf000;
    const symlink = unixType === 0xa000;
    totalUncompressed += uncompressedSize;
    if (!(flags & 0x0800)) issues.push(`${path}: UTF-8 filename flag is missing`);
    for (const problem of pathProblems(path)) issues.push(`${path}: ${problem}`);
    if (symlink) issues.push(`${path}: symbolic link is not allowed`);
    if (![0, 8].includes(method)) issues.push(`${path}: unsupported compression method ${method}`);
    if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_RATIO) issues.push(`${path}: suspicious compression ratio`);
    entries.push({ path, compressedSize, uncompressedSize, method, symlink });
    offset = nameStart + nameLength + extraLength + commentLength;
  }
  if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) issues.push(`expanded archive exceeds ${MAX_UNCOMPRESSED_BYTES} bytes`);
  return { entries, issues: [...new Set(issues)] };
}

export const zipLimits = {
  maxFiles: MAX_FILES,
  maxArchiveBytes: MAX_ARCHIVE_BYTES,
  maxUncompressedBytes: MAX_UNCOMPRESSED_BYTES,
  maxRatio: MAX_RATIO,
};
