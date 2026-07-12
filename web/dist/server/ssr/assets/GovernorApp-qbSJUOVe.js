import { C as __toESM, t as require_jsx_runtime, y as require_react } from "../index.js";
import Link from "./link-CrtfTvqC.js";
//#region app/lib/governance.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var artifactOrder = [
	"REQUIREMENTS.md",
	"USER_STORY.md",
	"ANALYSIS.md",
	"DESIGN.md",
	"ADR.md",
	"TEST_PLAN.md",
	"TEST_CASE_MATRIX.md",
	"RISK_REGISTER.md",
	"SECURITY_REVIEW.md",
	"AI_USAGE_REVIEW.md",
	"PROCESS_COMPLIANCE_REPORT.md",
	"DEPLOYMENT_PLAN.md",
	"MAINTENANCE_TASK.md",
	"FINAL_REPORT.md"
];
var adoptionFiles = [
	"AGENTS.md",
	"docs/software-engineering/17_REVISION_MASTER_CHECKLIST.md",
	"docs/software-engineering/18_TRACEABILITY_MATRIX.md",
	"templates/REQUIREMENTS_TEMPLATE.md",
	".agents/skills/software-engineering-governor/SKILL.md",
	"scripts/se_gate.py",
	".github/pull_request_template.md",
	".github/workflows/se-quality-gate.yml"
];
var safe = (value, fallback) => String(value || fallback).replace(/[<>]/g, "").trim();
var stamp = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function createTaskArtifacts(project = {}, task = {}) {
	const name = safe(project.name, "Untitled Project");
	const title = safe(task.title, "Engineering Task");
	const type = safe(task.type, "Feature");
	const goal = safe(task.goal, "Deliver the requested behavior with traceable engineering evidence.");
	const problem = safe(task.problem, task.background || "The current workflow does not satisfy the stated user need.");
	const constraints = safe(task.constraints, "Minimal reversible change; no undocumented behavior change.");
	const acceptance = safe(task.acceptance, "The primary behavior is demonstrably correct and regression evidence passes.");
	const risk = safe(task.risk, "Incorrect assumptions may create behavior or security regressions.");
	const rollback = safe(task.rollback, "Disable or revert the isolated change and restore the previous artifact set.");
	const security = safe(project.security, "Medium");
	const stack = safe(project.stack, "To be confirmed");
	return {
		"REQUIREMENTS.md": `# Requirements: ${title}\n\n## Traceability ID\n- Requirement set ID: ${safe(task.id, "TASK-001")}\n- Project: ${name}\n- Owner: To be assigned\n\n## Stakeholders\n| Stakeholder | Interest | Priority | Source |\n|---|---|---|---|\n| End user | ${goal} | High | Product request |\n| Maintainer | Safe, maintainable delivery | High | Engineering review |\n\n## Problem Statement\n${problem}\n\n## Functional Requirements\n| ID | Requirement | Source | Acceptance Link | Status |\n|---|---|---|---|---|\n| FR-001 | ${goal} | User request | AC-001 | Draft |\n\n## Non-functional Requirements\n| ID | Attribute | Requirement | Measure | Verification |\n|---|---|---|---|---|\n| NFR-001 | Security | Preserve the ${security} security boundary. | Security review has no unaccepted critical finding. | Review |\n| NFR-002 | Maintainability | Keep the change isolated and documented. | Named owner, rollback, and regression evidence exist. | Review |\n\n## Constraints\n- ${constraints}\n- Technology stack: ${stack}\n\n## Assumptions\n- A-001: Stakeholders will review unresolved questions before implementation.\n\n## Requirement Conflicts\n| ID | Conflict | Stakeholders | Resolution | Owner |\n|---|---|---|---|---|\n| RC-001 | Delivery speed versus assurance depth | Product / Engineering | Risk-based review depth | Product owner |\n\n## Acceptance Criteria\n- AC-001: ${acceptance}\n`,
		"USER_STORY.md": `# User Story: ${title}\n\n## Epic\n- Epic ID: ${safe(task.epic, "GOVERNED-DELIVERY")}\n- Epic goal: ${goal}\n\n## Story\nAs a project stakeholder, I want ${goal.toLowerCase()}, so that the project delivers measurable value without losing engineering evidence.\n\n## Role\nProject stakeholder\n\n## Goal\n${goal}\n\n## Benefit\nA reviewable and reversible ${type.toLowerCase()} outcome.\n\n## Priority\n- Business value: High\n- Risk reduction: High\n- Dependency: Stakeholder acceptance\n\n## MoSCoW\n- Must\n\n## Story Points\n- Fibonacci estimate: 5\n- Uncertainty: Requirements and integration context\n\n## INVEST Checklist\n- [x] Independent\n- [x] Negotiable\n- [x] Valuable\n- [x] Estimable\n- [x] Small\n- [x] Testable\n\n## Acceptance Criteria\n- AC-001: ${acceptance}\n- AC-002: Invalid and boundary inputs fail safely.\n- AC-003: Existing behavior remains covered by regression evidence.\n\n## Tasks\n| Task ID | Task | Owner | Status |\n|---|---|---|---|\n| T-001 | Confirm requirements and acceptance evidence | Maintainer | Planned |\n| T-002 | Implement the smallest reversible change | Maintainer | Planned |\n| T-003 | Run tests, security review, and documentation update | Reviewer | Planned |\n`,
		"ANALYSIS.md": `# Analysis: ${title}\n\n## Domain Concepts\n| Concept | Meaning | Business Rule |\n|---|---|---|\n| Project | Governed software context | Owns task evidence |\n| Task package | Traceable lifecycle evidence | Must link requirements to tests |\n\n## Entities\n| Entity | Responsibility | Persistent Data | Invariants |\n|---|---|---|---|\n| Task | Coordinates ${type} work | IDs, status, evidence | Requirement IDs remain stable |\n\n## Boundary Objects\n| Boundary | External Actor/System | Input | Output |\n|---|---|---|---|\n| User interface | Stakeholder | Task context | Validated artifacts |\n\n## Control Objects\n| Control | Workflow | Coordinates | Failure Handling |\n|---|---|---|---|\n| TaskController | Evidence lifecycle | Requirements, tests, reviews | Preserves drafts and reports gaps |\n\n## Relationships\n| Source | Relationship | Target | Reason |\n|---|---|---|---|\n| Requirement | Verified by | Test case | Traceability |\n\n## Multiplicity\n| Relationship | Multiplicity | Constraint |\n|---|---|---|\n| Task to requirement | 1 to 1..* | Every task has an observable requirement |\n\n## Data Flow\n1. Capture context and constraints.\n2. Validate required evidence.\n3. Produce linked artifacts.\n4. Review failures and residual risk.\n5. Export a reversible package.\n\n## Failure Modes\n| Failure | Cause | Detection | Handling | Test Link |\n|---|---|---|---|---|\n| Missing trace | Incomplete artifact | Static validation | Mark FAIL and generate repair prompt | TC-003 |\n| Unsafe input | Malformed archive or content | Boundary checks | Reject without execution | TC-004 |\n`,
		"DESIGN.md": `# Design Document: ${title}\n\n## Design Goal\n${goal}\n\n## Current Architecture\nProject-specific architecture requires repository review before implementation.\n\n## Proposed Architecture\nAdd the smallest bounded component or change that satisfies FR-001.\n\n## Alternatives Considered\n| Alternative | Pros | Cons | Decision |\n|---|---|---|---|\n| Local bounded change | Reversible and testable | May defer broad cleanup | Selected |\n| Broad rewrite | Uniform result | High regression risk | Rejected |\n\n## Module Boundaries\n| Module | Responsibility | Owns | Does Not Own |\n|---|---|---|---|\n| Task boundary | ${goal} | Task policy | Unrelated project behavior |\n\n## Interfaces\n| Interface | Consumer | Provider | Contract | Error Behavior |\n|---|---|---|---|---|\n| Task operation | Existing workflow | New bounded component | FR-001 / AC-001 | Explicit safe failure |\n\n## Data Model\nNo data model change without an explicit migration decision.\n\n## SOLID Review\n- SRP: Keep task policy separate from unrelated behavior.\n- OCP: Add extension points only for demonstrated variation.\n- LSP: Preserve existing consumer expectations.\n- ISP: Expose only required operations.\n- DIP: Isolate volatile infrastructure behind a narrow boundary when justified.\n\n## Pattern Justification\n| Pattern | Design Pressure | Simpler Alternative | Consequences |\n|---|---|---|---|\n| None initially | No proven recurring pressure | Direct bounded module | Avoids premature abstraction |\n\n## Quality Attribute Impact\n| Attribute | Positive Impact | Negative Impact | Evidence |\n|---|---|---|---|\n| Maintainability | Local responsibility | Additional module | Review and regression tests |\n| Security | Explicit boundary | Review cost | Security review |\n`,
		"ADR.md": `# Architecture Decision Record: ${title}\n\n## Status\nProposed\n\n## Context\n${problem}\n\n## Decision\nUse a minimal, reversible boundary for ${goal.toLowerCase()}.\n\n## Alternatives\n| Alternative | Why Considered | Why Rejected/Accepted |\n|---|---|---|\n| Local change | Lowest blast radius | Accepted |\n| Broad rewrite | Potential uniformity | Rejected: unjustified risk |\n\n## Consequences\n- Positive: Clear ownership and rollback.\n- Negative: Some existing debt may remain.\n- Neutral: Existing interfaces remain authoritative.\n\n## Quality Attributes Affected\n| Attribute | Effect | Response Measure |\n|---|---|---|\n| Reliability | Lower regression surface | Required tests pass |\n| Maintainability | Clearer boundary | Review finds no mixed responsibility |\n\n## Risk\n| Risk | Probability | Impact | Mitigation |\n|---|---|---|---|\n| ${risk} | Medium | High | Tests, review, staged release |\n\n## Rollback\n${rollback}\n`,
		"TEST_PLAN.md": `# Test Plan: ${title}\n\n## Scope\nFR-001, NFR-001, NFR-002, and AC-001 through AC-003.\n\n## Test Levels\n- Unit: Policy and validation behavior.\n- Integration: Boundary contracts.\n- System: End-to-end user outcome.\n- Acceptance: Stakeholder-observable behavior.\n\n## Test Strategy\n- Black-box: Normal, boundary, invalid, and security inputs.\n- White-box: Branches and failure handling.\n- Regression: Existing behavior around affected modules.\n- Security: Trust-boundary and unsafe-input cases.\n\n## Tools\nUse the project's existing test tools; do not add a dependency without review.\n\n## Test Data\nSynthetic normal, boundary, malformed, and adversarial data only.\n\n## Traceability\n| Requirement ID | Acceptance Criteria | Test ID |\n|---|---|---|\n| FR-001 | AC-001 | TC-001, TC-002 |\n| NFR-001 | AC-002 | TC-004 |\n| NFR-002 | AC-003 | TC-005 |\n\n## Pass/Fail Criteria\nAll critical and regression tests pass; no unaccepted security finding remains.\n\n## Regression Plan\nRun the affected suite before merge and again before release.\n`,
		"TEST_CASE_MATRIX.md": `# Test Case Matrix: ${title}\n\n| Test ID | Requirement ID | Test Type | Input | Expected Output | Reason | Coverage | Status |\n|---|---|---|---|---|---|---|---|---|\n| TC-001 | FR-001 / AC-001 | Normal | Valid task input | ${acceptance} | Main behavior | Acceptance | Planned |\n| TC-002 | FR-001 / AC-001 | Boundary | Minimum supported input | Stable bounded result | Boundary behavior | Boundary | Planned |\n| TC-003 | FR-001 / AC-002 | Invalid | Missing or malformed input | Clear safe error | Failure handling | Negative path | Planned |\n| TC-004 | NFR-001 / AC-002 | Security | Adversarial input | Rejected without unsafe execution | Trust boundary | Security | Planned |\n| TC-005 | NFR-002 / AC-003 | Regression | Existing supported flow | Behavior preserved | Prevent regression | Regression | Planned |\n`,
		"RISK_REGISTER.md": `# Risk Register: ${title}\n\n| Risk ID | Description | Category | Probability | Impact | Exposure | Mitigation | Contingency | Residual risk | Trigger | Detection method | Review cadence | Owner | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| R-001 | ${risk} | Technical | Medium | High | High | Requirements, tests, staged review | ${rollback} | Medium | Validation failure | Test and review evidence | PR and release | Maintainer | Open |\n| R-002 | Unsafe input crosses a trust boundary | Security | Low | High | Medium | Validate and never execute uploads | Reject input | Low | Malformed archive | Static archive inspection | Every upload | Security owner | Open |\n`,
		"SECURITY_REVIEW.md": `# Security Review: ${title}\n\n## Threat Model\nUntrusted input may attempt traversal, injection, secret exposure, or unintended execution.\n\n## Trust Boundaries\nUser input, repository files, CI, deployment configuration, and external services.\n\n## Input Validation\nValidate type, size, count, path, encoding, and required fields before processing.\n\n## Authentication\nNo authentication change unless separately approved.\n\n## Authorization\nEnforce authorization server-side for protected operations.\n\n## Secrets\nNo credentials in source, artifacts, logs, or generated prompts.\n\n## Error Handling\nReturn bounded errors without sensitive internals.\n\n## Logging\nLog status metadata only; never log uploaded content or secrets.\n\n## Dependency Risk\nReview any new dependency, license, integrity, and maintenance status.\n\n## AI-generated Code Risk\nTreat generated output as untrusted until human review and tests complete.\n\n## Deployment Risk\nUse staged release, monitoring, and explicit rollback criteria.\n\n## Security Test Plan\nTC-004 covers adversarial input; project-specific auth and injection cases remain required.\n\n## Residual Risk\n${risk}\n`,
		"AI_USAGE_REVIEW.md": `# AI Usage Review: ${title}\n\n## AI Tool Used\nCodex or project-approved assistant\n\n## Task Scope\nDrafting lifecycle evidence for ${type}: ${title}.\n\n## AI-generated Code Yes/No\nNo code generated by this artifact package.\n\n## Generated Code Reviewed By Human\n- Reviewer: Required before implementation\n- Evidence: PR review and test results\n\n## Human Review Yes/No\nPending\n\n## Security-sensitive Areas\n${security} security boundary and uploaded content.\n\n## Privacy-sensitive Areas\nProject files, user identifiers, logs, and secrets.\n\n## IP/License Risk\nReview generated or copied material before distribution.\n\n## Bias/Fairness Risk\nReview if the task affects consequential user decisions.\n\n## Hallucination Risk\nVerify APIs, requirements, and project structure against authoritative source.\n\n## Tests Added\nTC-001 through TC-005 planned.\n\n## Final Human Decision\nRequest changes until implementation evidence exists.\n`,
		"PROCESS_COMPLIANCE_REPORT.md": `# Process Compliance Report: ${title}\n\n## Traceability\n- Report ID: PCR-${stamp()}\n- Task or PR: ${title}\n- Owner: To be assigned\n- Date: ${stamp()}\n\n## Selected Process Model\n- Selected process model: ${safe(project.process, "Agile")}\n- Alternatives considered: Waterfall, Spiral, V Model\n- Why this model fits requirement stability and risk: Short feedback and reversible increments suit current uncertainty.\n\n## Agile Iteration Evidence\n- Iteration or increment: One bounded task package\n- Working software evidence: Required before completion\n- Feedback received: Pending stakeholder review\n- Change incorporated: Pending\n\n## Required Documentation Level\n- Required documentation: Full task package for ${security} risk\n- Reason documentation level is sufficient: Covers lifecycle and rollback evidence\n- Deferred documentation: Product-specific operations details\n\n## Test Timing\n- Tests before implementation: Acceptance and regression cases defined\n- Tests during implementation: Unit and integration tests\n- Tests before release: System, security, and regression tests\n\n## Stakeholder Feedback Loop\n- Stakeholders consulted: Product owner, maintainer, security reviewer\n- Feedback cadence: Every reviewable increment\n- Open feedback: Confirm AC-001\n\n## Release Cadence\n- Planned release cadence: Small staged release\n- Release readiness criteria: Tests and reviews pass\n- Rollback condition: Critical regression or security finding\n\n## Retrospective Evidence\n- What changed: Pending\n- What worked: Pending\n- What failed: Pending\n- Rule or memory update suggestion: Pending after validation\n`,
		"DEPLOYMENT_PLAN.md": `# Deployment Plan: ${title}\n\n## Deployment Scope\n- Feature or change: ${goal}\n- Environment: Staging then production\n- Affected users: Project stakeholders\n\n## Preconditions\n- Build artifact: Reproducible versioned artifact\n- Configuration: Reviewed and secret-free\n- Dependencies: Healthy and approved\n- Data migration: None unless separately documented\n\n## Release Steps\n| Step | Command or Action | Owner | Verification |\n|---|---|---|---|\n| DEP-001 | Deploy to staging | Release owner | Acceptance and security evidence |\n| DEP-002 | Promote gradually | Release owner | Monitoring remains within thresholds |\n\n## Monitoring\n- Metrics: Error rate, latency, user outcome\n- Logs: Redacted structured events\n- Alert: Regression or security threshold\n- Review window: First 24 hours\n\n## Rollback Criteria\n- Trigger: Critical failure, data risk, or security regression\n- Threshold: Any uncontained critical impact\n- Decision owner: Release owner\n\n## Rollback Steps\n| Step | Command or Action | Owner | Verification |\n|---|---|---|---|\n| RB-001 | ${rollback} | Release owner | Previous behavior restored |\n\n## Known Risks\n- Risk ID: R-001, R-002\n- Mitigation: Staged rollout and monitoring\n- Residual risk: Project-specific runtime behavior\n\n## Post-release Review\n- Evidence: Metrics snapshot and stakeholder feedback\n- Follow-up: Update retrospective and maintenance task\n`,
		"MAINTENANCE_TASK.md": `# Maintenance Task: ${title}\n\n## Maintenance Goal\n- Goal: Preserve correctness, security, and traceability after release.\n- Trigger: Regression, dependency change, monitoring signal, or retrospective.\n- Related requirement: FR-001, NFR-001, NFR-002\n\n## System Area\n- Module: Affected task boundary\n- Owner: Maintainer\n- Operational context: ${safe(project.stage, "Development")}\n\n## Maintenance Type\n- Corrective: Fix verified defects.\n- Adaptive: Respond to platform changes.\n- Perfective: Improve maintainability with behavior-preserving tests.\n- Preventive: Review risks and dependencies.\n\n## Impact Analysis\n- Users affected: Project stakeholders\n- Data affected: Confirm before change\n- Interfaces affected: Confirm before change\n- Documentation affected: Task package and release notes\n\n## Test And Regression Plan\n- Regression tests: TC-001 through TC-005\n- Failure-path tests: TC-003 and TC-004\n- Monitoring evidence: Release metrics\n\n## Risk And Residual Risk\n- Risk ID: R-001, R-002\n- Mitigation: Tests, review, staged release\n- Residual risk: ${risk}\n\n## Release Or Scheduling Window\n- Target date or cadence: Each release and quarterly review\n- Dependency: Owner availability\n- Communication: Release notes\n\n## Completion Evidence\n- Commands run: Record actual commands\n- Documentation updated: Record actual files\n- Retrospective note: Capture reusable lessons\n`,
		"FINAL_REPORT.md": `# Final Engineering Report: ${title}\n\n## Requirements Satisfied\nPending implementation evidence for FR-001, NFR-001, and NFR-002.\n\n## Analysis Summary\nDomain, boundaries, relationships, and failure modes are recorded in ANALYSIS.md.\n\n## Design Decisions\nUse a minimal reversible boundary; no pattern without demonstrated pressure.\n\n## Files Changed\nPending implementation.\n\n## Tests Added / Updated\nTC-001 through TC-005 are planned; replace with actual evidence.\n\n## Commands Run\nPending implementation.\n\n## Security Review\nThreat model and trust boundaries recorded; final human review remains required.\n\n## Quality Review\nMaintainability, reliability, and security evidence required before approval.\n\n## Documentation Updated\nThis task package generated ${stamp()}.\n\n## Risks Remaining\nR-001 and R-002 remain open until implementation validation.\n\n## Rollback Plan\n${rollback}\n\n## Memory Update Suggestions\nPropose only after a verified reusable lesson is observed.\n`
	};
}
function projectContextArtifact(project = {}) {
	return `# Project Context: ${safe(project.name, "Untitled Project")}\n\n## Software Type Classification\n- Primary type: ${safe(project.softwareType, "Web application")}\n- Environment: ${safe(project.environment, "Web")}\n- Technology stack: ${safe(project.stack, "To be confirmed")}\n- Project stage: ${safe(project.stage, "Planning")}\n- Team size: ${safe(project.teamSize, "1-5")}\n\n## Data Handled\n- Security level: ${safe(project.security, "Medium")}\n- Privacy level: ${safe(project.privacy, "Medium")}\n- Compliance: ${safe(project.compliance, "None specified")}\n\n## Documentation Required\nRequirements, design, tests, security, deployment, maintenance, and final report.\n\n## User-facing Quality Attributes\n- Performance: ${safe(project.performance, "Measurable response targets required")}\n- Reliability: ${safe(project.reliability, "Failure behavior and rollback required")}\n- Security: ${safe(project.security, "Medium")}\n\n## Developer-facing Quality Attributes\nMaintainability, testability, portability, and traceability.\n\n## Engineering Consequences\n- Required process model: ${safe(project.process, "Agile")}\n- Release method: ${safe(project.release, "Staged")}\n- AI-assisted development: ${project.aiAssisted ? "Yes, with human review" : "No"}\n`;
}
function evaluateArtifacts(artifacts = {}) {
	const names = Object.keys(artifacts);
	const missing = artifactOrder.filter((name) => !names.includes(name));
	const text = Object.values(artifacts).join("\n");
	const count = (pattern) => new Set(text.match(pattern) || []).size;
	const requirements = count(/\b(?:FR|NFR)-\d{3}\b/g);
	const acceptance = count(/\bAC-\d{3}\b/g);
	const tests = count(/\bTC-\d{3}\b/g);
	const risks = count(/\bR-\d{3}\b/g);
	const testMatrix = artifacts["TEST_CASE_MATRIX.md"] || "";
	const requirementIds = [...new Set(text.match(/\b(?:FR|NFR)-\d{3}\b/g) || [])];
	const linked = requirementIds.filter((id) => testMatrix.includes(id)).length;
	const statuses = artifactOrder.map((name) => {
		const content = artifacts[name];
		if (!content) return {
			name,
			status: "fail",
			source: "browser-static",
			detail: "Missing artifact"
		};
		const incomplete = /\b(?:TODO|TBD|fix later)\b/i.test(content);
		return {
			name,
			status: incomplete ? "warning" : "pass",
			source: "browser-static",
			detail: incomplete ? "Unresolved placeholder" : "Required artifact present"
		};
	});
	return {
		artifactCompletion: Math.round((artifactOrder.length - missing.length) / artifactOrder.length * 100),
		requirements,
		acceptance,
		tests,
		risks,
		traceability: requirementIds.length ? Math.round(linked / requirementIds.length * 100) : 0,
		security: artifacts["SECURITY_REVIEW.md"] ? "pass" : "fail",
		aiEvidence: artifacts["AI_USAGE_REVIEW.md"] ? "pass" : "unknown",
		releaseReadiness: missing.length === 0 && linked > 0 ? "warning" : "fail",
		missing,
		statuses
	};
}
function checkRepositoryPaths(paths = []) {
	const normalized = paths.map((path) => path.replaceAll("\\", "/").replace(/^\.\//, "").replace(/^\/+/, ""));
	const missing = adoptionFiles.filter((required) => !normalized.some((path) => path === required || path.endsWith(`/${required}`)));
	return {
		score: Math.round((adoptionFiles.length - missing.length) / adoptionFiles.length * 100),
		missing,
		passed: adoptionFiles.filter((required) => !missing.includes(required))
	};
}
function buildCodexPrompt(project = {}, task = {}, options = {}) {
	const rules = [
		options.plan !== false && "Produce an Engineering Plan before editing.",
		options.tests !== false && "Run relevant tests and report exact commands and results.",
		options.docs !== false && "Update affected documentation.",
		options.finalReport !== false && "Return a Final Engineering Report.",
		options.minimal !== false && "Use the smallest reversible implementation.",
		!options.dependencies && "Do not add dependencies without explicit approval.",
		!options.architecture && "Do not change architecture unless required by an accepted ADR."
	].filter(Boolean);
	return `Use the software-engineering-governor skill.\n\nProject: ${safe(project.name, "Untitled Project")}\nTask type: ${safe(task.type, "Feature")}\nTask: ${safe(task.title, "Engineering Task")}\nGoal: ${safe(task.goal, "Confirm the goal before implementation.")}\nProblem: ${safe(task.problem, "Confirm the problem before implementation.")}\nConstraints: ${safe(task.constraints, "Minimal reversible change.")}\nAcceptance: ${safe(task.acceptance, "All accepted criteria and regression evidence pass.")}\nRisk: ${safe(task.risk, "Review security, privacy, and rollback risk.")}\nRollback: ${safe(task.rollback, "Restore the prior behavior and artifacts.")}\n\nMandatory rules:\n${rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}\n\nDo not treat AI output as trusted code. Do not execute uploaded or unreviewed scripts. Preserve requirement-to-test traceability and distinguish PASS, FAIL, WARNING, NOT RUN, and UNKNOWN evidence.\n`;
}
//#endregion
//#region app/lib/zip.mjs
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8", { fatal: true });
var MAX_FILES = 2e3;
var MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;
var MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
var MAX_RATIO = 100;
var crcTable;
function table() {
	if (crcTable) return crcTable;
	crcTable = new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let value = n;
		for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
		crcTable[n] = value >>> 0;
	}
	return crcTable;
}
function crc32(bytes) {
	let crc = 4294967295;
	const values = table();
	for (const byte of bytes) crc = values[(crc ^ byte) & 255] ^ crc >>> 8;
	return (crc ^ 4294967295) >>> 0;
}
function dosTimestamp(date = /* @__PURE__ */ new Date()) {
	const year = Math.max(1980, date.getFullYear());
	return {
		time: date.getHours() << 11 | date.getMinutes() << 5 | Math.floor(date.getSeconds() / 2),
		day: year - 1980 << 9 | date.getMonth() + 1 << 5 | date.getDate()
	};
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
	return {
		bytes,
		view: new DataView(bytes.buffer)
	};
}
function createZip(files) {
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
		local.view.setUint32(0, 67324752, true);
		local.view.setUint16(4, 20, true);
		local.view.setUint16(6, 2048, true);
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
		central.view.setUint32(0, 33639248, true);
		central.view.setUint16(4, 20, true);
		central.view.setUint16(6, 20, true);
		central.view.setUint16(8, 2048, true);
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
	end.view.setUint32(0, 101010256, true);
	end.view.setUint16(4, 0, true);
	end.view.setUint16(6, 0, true);
	end.view.setUint16(8, entries.length, true);
	end.view.setUint16(10, entries.length, true);
	end.view.setUint32(12, centralDirectory.length, true);
	end.view.setUint32(16, localOffset, true);
	end.view.setUint16(20, 0, true);
	return concat([
		...localParts,
		centralDirectory,
		end.bytes
	]);
}
function findEnd(view) {
	const minimum = Math.max(0, view.byteLength - 65557);
	for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) if (view.getUint32(offset, true) === 101010256) return offset;
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
function inspectZip(buffer) {
	const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
	const issues = [];
	if (bytes.length > MAX_ARCHIVE_BYTES) issues.push(`archive exceeds ${MAX_ARCHIVE_BYTES} bytes`);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const endOffset = findEnd(view);
	if (endOffset < 0) return {
		entries: [],
		issues: ["invalid ZIP: end record not found"]
	};
	const count = view.getUint16(endOffset + 10, true);
	const centralOffset = view.getUint32(endOffset + 16, true);
	if (count > MAX_FILES) issues.push(`archive has ${count} files; limit is ${MAX_FILES}`);
	const entries = [];
	let offset = centralOffset;
	let totalUncompressed = 0;
	for (let index = 0; index < count; index += 1) {
		if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 33639248) {
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
		const symlink = (externalAttributes >>> 16 & 61440) === 40960;
		totalUncompressed += uncompressedSize;
		if (!(flags & 2048)) issues.push(`${path}: UTF-8 filename flag is missing`);
		for (const problem of pathProblems(path)) issues.push(`${path}: ${problem}`);
		if (symlink) issues.push(`${path}: symbolic link is not allowed`);
		if (![0, 8].includes(method)) issues.push(`${path}: unsupported compression method ${method}`);
		if (compressedSize > 0 && uncompressedSize / compressedSize > MAX_RATIO) issues.push(`${path}: suspicious compression ratio`);
		entries.push({
			path,
			compressedSize,
			uncompressedSize,
			method,
			symlink
		});
		offset = nameStart + nameLength + extraLength + commentLength;
	}
	if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) issues.push(`expanded archive exceeds ${MAX_UNCOMPRESSED_BYTES} bytes`);
	return {
		entries,
		issues: [...new Set(issues)]
	};
}
var zipLimits = {
	maxFiles: MAX_FILES,
	maxArchiveBytes: MAX_ARCHIVE_BYTES,
	maxUncompressedBytes: MAX_UNCOMPRESSED_BYTES,
	maxRatio: MAX_RATIO
};
//#endregion
//#region app/lib/storage.ts
var DATABASE = "codex-se-governor-web";
var STORE = "projects";
var VERSION = 1;
function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE, VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function loadProjects() {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE, "readonly");
		const request = transaction.objectStore(STORE).getAll();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		transaction.oncomplete = () => db.close();
	});
}
async function saveProject(project) {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE, "readwrite");
		transaction.objectStore(STORE).put(project);
		transaction.oncomplete = () => {
			db.close();
			resolve();
		};
		transaction.onerror = () => reject(transaction.error);
	});
}
async function clearProjects() {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE, "readwrite");
		transaction.objectStore(STORE).clear();
		transaction.oncomplete = () => {
			db.close();
			resolve();
		};
		transaction.onerror = () => reject(transaction.error);
	});
}
//#endregion
//#region app/GovernorApp.tsx
var import_jsx_runtime = require_jsx_runtime();
var copy = {
	zh: {
		dashboard: "概览",
		project: "新建项目",
		task: "新建任务",
		artifacts: "工程工件",
		prompt: "Prompt Builder",
		repository: "仓库检查",
		validation: "验证结果",
		metrics: "治理指标",
		releases: "下载与发布",
		history: "历史",
		settings: "设置",
		local: "本地模式",
		newProject: "创建第一个治理项目",
		continue: "继续",
		back: "返回",
		create: "生成项目",
		save: "保存",
		export: "导出 ZIP",
		noProject: "还没有本地项目",
		loadExample: "载入示例",
		currentTask: "当前任务",
		readiness: "发布准备度",
		language: "语言",
		theme: "主题",
		clear: "清除本地数据",
		help: "帮助",
		docs: "治理准则",
		projectLabel: "当前项目"
	},
	en: {
		dashboard: "Dashboard",
		project: "New Project",
		task: "New Task",
		artifacts: "Artifacts",
		prompt: "Prompt Builder",
		repository: "Repository Check",
		validation: "Validation",
		metrics: "Metrics",
		releases: "Downloads",
		history: "History",
		settings: "Settings",
		local: "Local mode",
		newProject: "Create your first governed project",
		continue: "Continue",
		back: "Back",
		create: "Generate project",
		save: "Save",
		export: "Export ZIP",
		noProject: "No local project yet",
		loadExample: "Load example",
		currentTask: "Current task",
		readiness: "Release readiness",
		language: "Language",
		theme: "Theme",
		clear: "Clear local data",
		help: "Help",
		docs: "Governor canon",
		projectLabel: "Current project"
	}
};
var nav = [
	{
		id: "dashboard",
		icon: "⌂"
	},
	{
		id: "project",
		icon: "+"
	},
	{
		id: "task",
		icon: "◇"
	},
	{
		id: "artifacts",
		icon: "▤"
	},
	{
		id: "prompt",
		icon: "›_"
	},
	{
		id: "repository",
		icon: "⌕"
	},
	{
		id: "validation",
		icon: "✓"
	},
	{
		id: "metrics",
		icon: "⌁"
	},
	{
		id: "releases",
		icon: "⇩"
	},
	{
		id: "history",
		icon: "↺"
	},
	{
		id: "settings",
		icon: "⚙"
	}
];
var projectDefaults = {
	name: "",
	description: "",
	stack: "TypeScript / React",
	softwareType: "Web application",
	environment: "Web",
	stage: "Planning",
	teamSize: "1-5",
	security: "Medium",
	privacy: "Medium",
	compliance: "None specified",
	performance: "p95 under 500 ms",
	reliability: "Graceful failure and documented rollback",
	release: "Staged",
	process: "Agile",
	aiAssisted: true
};
var taskDefaults = {
	id: "TASK-001",
	type: "Feature",
	title: "",
	background: "",
	problem: "",
	goal: "",
	constraints: "Minimal reversible change.",
	acceptance: "The requested behavior is observable and regression evidence passes.",
	risk: "Incorrect assumptions may cause behavior or security regressions.",
	affectedFiles: "",
	rollback: "Disable or revert the isolated change and restore the previous behavior."
};
function now() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function identifier(prefix) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function slug(value) {
	return value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "governed-project";
}
function download(name, data, type = "text/plain;charset=utf-8") {
	const href = URL.createObjectURL(new Blob([data], { type }));
	const anchor = document.createElement("a");
	anchor.href = href;
	anchor.download = name.replace(/[\\/:*?"<>|]/g, "-");
	anchor.click();
	URL.revokeObjectURL(href);
}
function statusLabel(status) {
	return status === "not-run" ? "NOT RUN" : status.toUpperCase();
}
function MarkdownPreview({ content }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "markdown-preview",
		children: content.split("\n").map((line, index) => {
			if (line.startsWith("```")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "code-divider" }, index);
			if (line.startsWith("    ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: line.slice(4) || " " }, index);
			if (line.startsWith("### ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: line.slice(4) }, index);
			if (line.startsWith("## ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: line.slice(3) }, index);
			if (line.startsWith("# ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: line.slice(2) }, index);
			if (line.startsWith("- [x] ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["☑ ", line.slice(6)] }, index);
			if (line.startsWith("- [ ] ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["☐ ", line.slice(6)] }, index);
			if (line.startsWith("- ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "bullet",
				children: line.slice(2)
			}, index);
			if (line.startsWith("|")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "table-line",
				children: line
			}, index);
			if (/^\d+\. /.test(line)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "numbered",
				children: line
			}, index);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line || "\xA0" }, index);
		})
	});
}
function StatusBadge({ status, source }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `status status-${status}`,
		title: source || statusLabel(status),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}), statusLabel(status)]
	});
}
function MetricCard({ label, value, detail, tone = "blue" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `metric-card tone-${tone} reveal`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: value }),
			detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: detail })
		]
	});
}
function Field({ label, children, wide = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: wide ? "field field-wide" : "field",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), children]
	});
}
function GovernorApp() {
	const [language, setLanguage] = (0, import_react.useState)("zh");
	const [theme, setTheme] = (0, import_react.useState)("system");
	const [view, setView] = (0, import_react.useState)("dashboard");
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [activeProjectId, setActiveProjectId] = (0, import_react.useState)("");
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [projectStep, setProjectStep] = (0, import_react.useState)(1);
	const [projectDraft, setProjectDraft] = (0, import_react.useState)(projectDefaults);
	const [taskDraft, setTaskDraft] = (0, import_react.useState)(taskDefaults);
	const [selectedArtifact, setSelectedArtifact] = (0, import_react.useState)("REQUIREMENTS.md");
	const [editorMode, setEditorMode] = (0, import_react.useState)("edit");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [capabilityStatus, setCapabilityStatus] = (0, import_react.useState)("unknown");
	const [repoFindings, setRepoFindings] = (0, import_react.useState)([]);
	const [repoName, setRepoName] = (0, import_react.useState)("");
	const [treeText, setTreeText] = (0, import_react.useState)("");
	const [promptOptions, setPromptOptions] = (0, import_react.useState)({
		plan: true,
		tests: true,
		docs: true,
		finalReport: true,
		dependencies: false,
		architecture: false,
		minimal: true
	});
	const fileInput = (0, import_react.useRef)(null);
	const t = copy[language];
	const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0];
	const activeTask = activeProject?.tasks.find((task) => task.id === activeProject.activeTaskId) || activeProject?.tasks[0];
	const metrics = (0, import_react.useMemo)(() => evaluateArtifacts(activeTask?.artifacts || {}), [activeTask]);
	const generatedPrompt = (0, import_react.useMemo)(() => buildCodexPrompt(activeProject || {}, activeTask || taskDraft, promptOptions), [
		activeProject,
		activeTask,
		taskDraft,
		promptOptions
	]);
	(0, import_react.useEffect)(() => {
		loadProjects().then((stored) => {
			setProjects(stored.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
			if (stored[0]) setActiveProjectId(stored[0].id);
		}).finally(() => setLoaded(true));
		fetch("/api/capabilities").then((response) => response.ok ? response.json() : Promise.reject()).then(() => setCapabilityStatus("pass")).catch(() => setCapabilityStatus("unknown"));
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = theme;
		document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
	}, [theme, language]);
	function flash(message) {
		setNotice(message);
		window.setTimeout(() => setNotice(""), 2600);
	}
	async function persist(project) {
		await saveProject(project);
		setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
		setActiveProjectId(project.id);
	}
	function makeTask(input, project) {
		return {
			...input,
			id: input.id || identifier("TASK"),
			artifacts: createTaskArtifacts(project, input),
			updatedAt: now(),
			revisions: []
		};
	}
	async function createProject(example = false) {
		const data = example ? {
			...projectDefaults,
			name: "Northstar Portal",
			description: "A secure customer operations portal.",
			security: "High",
			privacy: "High",
			process: "Agile"
		} : projectDraft;
		if (!data.name.trim()) {
			flash(language === "zh" ? "请填写项目名称" : "Project name is required");
			return;
		}
		const foundation = makeTask({
			...taskDefaults,
			id: "FOUNDATION-001",
			type: "Architecture Change",
			title: "Project governance foundation",
			problem: data.description || "The project needs a traceable engineering baseline.",
			goal: "Establish the project governance lifecycle and evidence baseline.",
			acceptance: "All selected governance artifacts are generated and reviewable."
		}, data);
		foundation.artifacts = {
			"PROJECT_CONTEXT.md": projectContextArtifact(data),
			...foundation.artifacts
		};
		await persist({
			...data,
			id: identifier("project"),
			tasks: [foundation],
			activeTaskId: foundation.id,
			updatedAt: now()
		});
		setProjectStep(1);
		setProjectDraft(projectDefaults);
		setSelectedArtifact("PROJECT_CONTEXT.md");
		setView("dashboard");
		flash(language === "zh" ? "项目已保存在此浏览器" : "Project saved in this browser");
	}
	async function createTask() {
		if (!activeProject) {
			setView("project");
			return;
		}
		if (!taskDraft.title.trim() || !taskDraft.goal.trim()) {
			flash(language === "zh" ? "请填写任务标题和目标" : "Task title and goal are required");
			return;
		}
		const task = makeTask({
			...taskDraft,
			id: identifier("TASK")
		}, activeProject);
		await persist({
			...activeProject,
			tasks: [task, ...activeProject.tasks],
			activeTaskId: task.id,
			updatedAt: now()
		});
		setTaskDraft(taskDefaults);
		setSelectedArtifact("REQUIREMENTS.md");
		setView("artifacts");
		flash(language === "zh" ? "Task Package 已生成" : "Task package generated");
	}
	async function updateArtifact(content) {
		if (!activeProject || !activeTask) return;
		const task = {
			...activeTask,
			artifacts: {
				...activeTask.artifacts,
				[selectedArtifact]: content
			},
			updatedAt: now()
		};
		await persist({
			...activeProject,
			tasks: activeProject.tasks.map((item) => item.id === task.id ? task : item),
			updatedAt: now()
		});
	}
	async function checkpointArtifact() {
		if (!activeProject || !activeTask) return;
		const content = activeTask.artifacts[selectedArtifact] || "";
		const task = {
			...activeTask,
			revisions: [{
				at: now(),
				artifact: selectedArtifact,
				content
			}, ...activeTask.revisions].slice(0, 20),
			updatedAt: now()
		};
		await persist({
			...activeProject,
			tasks: activeProject.tasks.map((item) => item.id === task.id ? task : item),
			updatedAt: now()
		});
		flash(language === "zh" ? "已创建本地版本" : "Local revision created");
	}
	async function restoreRevision(revision) {
		setSelectedArtifact(revision.artifact);
		await updateArtifact(revision.content);
		setView("artifacts");
	}
	function exportTask() {
		if (!activeTask) return;
		download(`${slug(activeTask.title)}.zip`, createZip(activeTask.artifacts), "application/zip");
	}
	function exportProject() {
		if (!activeProject) return;
		const files = { "governor-project.json": JSON.stringify({
			schema: 1,
			name: activeProject.name,
			exportedAt: now(),
			localOnly: true
		}, null, 2) };
		for (const task of activeProject.tasks) for (const [name, content] of Object.entries(task.artifacts)) files[`tasks/${slug(task.title)}/${name}`] = content;
		download(`${slug(activeProject.name)}-governance.zip`, createZip(files), "application/zip");
	}
	function downloadReport() {
		const report = {
			schema: 1,
			generatedAt: now(),
			evidence: "browser-static",
			project: activeProject?.name || null,
			task: activeTask?.title || null,
			metrics
		};
		download(`${slug(activeProject?.name || "project")}-validation.json`, JSON.stringify(report, null, 2), "application/json");
	}
	async function inspectArchive(file) {
		setRepoName(file.name);
		if (file.size > zipLimits.maxArchiveBytes) {
			setRepoFindings([{
				level: "critical",
				title: "Archive limit exceeded",
				detail: `${file.size} bytes > ${zipLimits.maxArchiveBytes} bytes`
			}]);
			return;
		}
		try {
			const inspection = inspectZip(await file.arrayBuffer());
			const adoption = checkRepositoryPaths(inspection.entries.map((entry) => entry.path));
			const findings = inspection.issues.map((issue) => ({
				level: "critical",
				title: "Archive safety",
				detail: issue
			}));
			findings.push(...adoption.missing.map((path) => ({
				level: "warning",
				title: "Missing governance artifact",
				detail: path
			})));
			findings.push(...adoption.passed.map((path) => ({
				level: "passed",
				title: "Adoption evidence",
				detail: path
			})));
			if (!findings.length) findings.push({
				level: "passed",
				title: "Archive structure",
				detail: `${inspection.entries.length} safe UTF-8 entries`
			});
			setRepoFindings(findings);
		} catch {
			setRepoFindings([{
				level: "critical",
				title: "Invalid ZIP",
				detail: "The archive could not be parsed safely."
			}]);
		}
	}
	function inspectTree() {
		const result = checkRepositoryPaths(treeText.split(/\r?\n/).map((line) => line.trim().replace(/^[├└│─\s]+/, "")).filter(Boolean));
		setRepoName("pasted-directory-tree");
		setRepoFindings([...result.missing.map((path) => ({
			level: "warning",
			title: "Missing governance artifact",
			detail: path
		})), ...result.passed.map((path) => ({
			level: "passed",
			title: "Adoption evidence",
			detail: path
		}))]);
	}
	const validationGroups = [
		["Context", activeTask?.artifacts["PROJECT_CONTEXT.md"] ? "pass" : activeProject ? "warning" : "unknown"],
		["Requirements", activeTask?.artifacts["REQUIREMENTS.md"] ? "pass" : "fail"],
		["Analysis", activeTask?.artifacts["ANALYSIS.md"] ? "pass" : "fail"],
		["Design", activeTask?.artifacts["DESIGN.md"] && activeTask?.artifacts["ADR.md"] ? "pass" : "fail"],
		["Implementation", "not-run"],
		["Testing", activeTask?.artifacts["TEST_CASE_MATRIX.md"] ? "warning" : "fail"],
		["Security", metrics.security],
		["AI Evidence", metrics.aiEvidence],
		["Risk", activeTask?.artifacts["RISK_REGISTER.md"] ? "pass" : "fail"],
		["Deployment", activeTask?.artifacts["DEPLOYMENT_PLAN.md"] ? "warning" : "fail"],
		["Maintenance", activeTask?.artifacts["MAINTENANCE_TASK.md"] ? "warning" : "fail"],
		["Release", metrics.releaseReadiness]
	];
	if (!loaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app-loading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "brand-mark",
			children: "SE"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading workspace" })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "topbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "brand",
						onClick: () => setView("dashboard"),
						"aria-label": "Codex SE Governor dashboard",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "brand-mark",
							children: "SE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Codex SE Governor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Lifecycle Workspace" })] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "project-switcher",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.projectLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: activeProjectId,
							onChange: (event) => setActiveProjectId(event.target.value),
							"aria-label": t.projectLabel,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: t.noProject
							}), projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: project.id,
								children: project.name
							}, project.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "top-actions",
						"aria-label": "Global actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button",
								title: t.docs,
								onClick: () => setView("validation"),
								children: "?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button",
								title: t.language,
								onClick: () => setLanguage(language === "zh" ? "en" : "zh"),
								children: language === "zh" ? "EN" : "中"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button",
								title: t.theme,
								onClick: () => setTheme(theme === "system" ? "dark" : theme === "dark" ? "light" : "system"),
								children: theme === "system" ? "◐" : theme === "dark" ? "☾" : "☀"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mode-pill",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}), t.local]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sidebar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Workspace navigation",
					children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: view === item.id ? "active" : "",
						onClick: () => setView(item.id),
						title: t[item.id],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "nav-icon",
							children: item.icon
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t[item.id] })]
					}, item.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "privacy-lock",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◎" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Local-first" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "No repository code execution" })] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "workspace",
				children: [
					view === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "view dashboard-view",
						children: !activeProject ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "onboarding glass-panel reveal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "SOFTWARE ENGINEERING LIFECYCLE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.newProject }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: language === "zh" ? "从项目上下文开始，建立可追踪、可验证、可回滚的工程任务。" : "Start with project context and build traceable, verifiable, reversible engineering work." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "button-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "primary",
										onClick: () => setView("project"),
										children: [t.newProject, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "secondary",
										onClick: () => createProject(true),
										children: t.loadExample
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "onboarding-flow",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Context" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "→" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Requirements" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "→" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "→" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Release" })
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "view-heading reveal",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "eyebrow",
										children: [
											activeProject.stage,
											" · ",
											activeProject.process
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: activeProject.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeProject.description || "Governed engineering workspace" })
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "button-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "secondary",
										onClick: () => setView("task"),
										children: ["+ ", t.task]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "primary",
										onClick: exportProject,
										children: [t.export, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⇩" })]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Artifact completion",
										value: `${metrics.artifactCompletion}%`,
										detail: `${artifactOrder.length - metrics.missing.length}/${artifactOrder.length} required`,
										tone: "purple"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Requirements",
										value: metrics.requirements,
										detail: `${metrics.acceptance} acceptance criteria`,
										tone: "blue"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Test traceability",
										value: `${metrics.traceability}%`,
										detail: `${metrics.tests} test IDs`,
										tone: "gold"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Open risks",
										value: metrics.risks,
										detail: "Review before release",
										tone: "red"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "dashboard-grid",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel task-focus reveal",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "panel-title",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.currentTask }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: metrics.releaseReadiness })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: activeTask?.title }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeTask?.goal }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "lifecycle-track",
											children: validationGroups.slice(0, 6).map(([label, status]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dot dot-${status}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: label })] }, label))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "button-row",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												className: "primary",
												onClick: () => setView("artifacts"),
												children: [language === "zh" ? "继续编辑" : "Continue editing", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "secondary",
												onClick: () => setView("prompt"),
												children: "Prompt"
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel readiness-panel reveal",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "panel-title",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.readiness }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [metrics.artifactCompletion, "%"] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "ring",
											style: { "--progress": `${metrics.artifactCompletion * 3.6}deg` },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: metrics.releaseReadiness === "fail" ? "BLOCKED" : "REVIEW" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "browser static" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: metrics.security }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Security review" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: metrics.aiEvidence }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI evidence" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: capabilityStatus }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sites API" })] })
										] })
									]
								})]
							})
						] })
					}),
					view === "project" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "view-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "eyebrow",
								children: [
									"PROJECT CONTEXT · ",
									projectStep,
									"/5"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.project })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "step-indicator",
								children: [
									1,
									2,
									3,
									4,
									5
								].map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: projectStep >= step ? "active" : "",
									children: step
								}, step))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "wizard glass-panel reveal",
							children: [
								projectStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-grid",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "项目名称" : "Project name",
											wide: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: projectDraft.name,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													name: e.target.value
												}),
												placeholder: "Northstar Portal"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "项目简介" : "Description",
											wide: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: projectDraft.description,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													description: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "技术栈" : "Technology stack",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: projectDraft.stack,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													stack: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "软件类型" : "Software type",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.softwareType,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													softwareType: e.target.value
												}),
												children: [
													"Web application",
													"Mobile application",
													"Desktop software",
													"Server software",
													"Cloud software",
													"Embedded software",
													"AI / Agent",
													"Library / CLI"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "项目阶段" : "Stage",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.stage,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													stage: e.target.value
												}),
												children: [
													"Planning",
													"Discovery",
													"Development",
													"Production",
													"Maintenance"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "团队规模" : "Team size",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.teamSize,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													teamSize: e.target.value
												}),
												children: [
													"1",
													"1-5",
													"6-15",
													"16-50",
													"50+"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										})
									]
								}),
								projectStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "selection-grid",
									children: [
										"Web",
										"Mobile",
										"Desktop",
										"Server",
										"Cloud",
										"Embedded",
										"AI / Agent",
										"Data Science",
										"Library",
										"CLI"
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: projectDraft.environment === item ? "selection active" : "selection",
										onClick: () => setProjectDraft({
											...projectDraft,
											environment: item
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.slice(0, 2).toUpperCase() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item })]
									}, item))
								}),
								projectStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-grid",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Security",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.security,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													security: e.target.value
												}),
												children: [
													"Low",
													"Medium",
													"High",
													"Critical"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Privacy",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.privacy,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													privacy: e.target.value
												}),
												children: [
													"Low",
													"Medium",
													"High",
													"Regulated"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Compliance",
											wide: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: projectDraft.compliance,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													compliance: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Performance",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: projectDraft.performance,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													performance: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Reliability",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: projectDraft.reliability,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													reliability: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Release",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: projectDraft.release,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													release: e.target.value
												}),
												children: [
													"Staged",
													"Continuous",
													"Scheduled",
													"Manual"
												].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
											})
										})
									]
								}),
								projectStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "selection-grid process-grid",
									children: [[
										"Agile",
										"Waterfall",
										"Spiral",
										"V Model",
										"Custom",
										"System recommended"
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: projectDraft.process === item ? "selection active" : "selection",
										onClick: () => setProjectDraft({
											...projectDraft,
											process: item
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↻" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item === "Agile" ? "Iterative feedback" : item === "Waterfall" ? "Stable requirements" : "Risk-based process" })
										]
									}, item)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "toggle-card",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: projectDraft.aiAssisted,
												onChange: (e) => setProjectDraft({
													...projectDraft,
													aiAssisted: e.target.checked
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "AI-assisted development" })
										]
									})]
								}),
								projectStep === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "generation-review",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "review-summary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "brand-mark",
												children: "SE"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: projectDraft.name || "Untitled Project" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
												projectDraft.softwareType,
												" · ",
												projectDraft.process,
												" · ",
												projectDraft.security,
												" security"
											] })] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "artifact-manifest",
											children: [
												"Project context",
												"Requirements",
												"Analysis & design",
												"Test evidence",
												"Risk & security",
												"Deployment & maintenance",
												"Codex Skill prompt",
												"Validation report"
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }), item] }, item))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "boundary-note",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Execution boundary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Static generation and inspection only. Uploaded code is never executed." })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "wizard-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "secondary",
										disabled: projectStep === 1,
										onClick: () => setProjectStep(Math.max(1, projectStep - 1)),
										children: t.back
									}), projectStep < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "primary",
										onClick: () => setProjectStep(projectStep + 1),
										children: [t.continue, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "primary",
										onClick: () => createProject(false),
										children: [t.create, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✦" })]
									})]
								})
							]
						})]
					}),
					view === "task" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "view-heading",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "TASK PACKAGE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.task }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeProject?.name || t.noProject })
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "task-builder glass-panel",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "task-types",
									children: [
										"Feature",
										"Bug Fix",
										"Refactor",
										"Architecture Change",
										"Security Review",
										"Deployment",
										"Maintenance"
									].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setTaskDraft({
											...taskDraft,
											type
										}),
										className: taskDraft.type === type ? "active" : "",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: type.slice(0, 2).toUpperCase() }), type]
									}, type))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-grid",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "标题" : "Title",
											wide: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: taskDraft.title,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													title: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "背景" : "Background",
											wide: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.background,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													background: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "问题" : "Problem",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.problem,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													problem: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "目标" : "Goal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.goal,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													goal: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "约束" : "Constraints",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.constraints,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													constraints: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "验收条件" : "Acceptance",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.acceptance,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													acceptance: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "风险" : "Risk",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.risk,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													risk: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: language === "zh" ? "回滚要求" : "Rollback",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: taskDraft.rollback,
												onChange: (e) => setTaskDraft({
													...taskDraft,
													rollback: e.target.value
												})
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "wizard-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [artifactOrder.length, " artifacts"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "primary",
										onClick: createTask,
										children: [language === "zh" ? "生成 Task Package" : "Generate task package", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✦" })]
									})]
								})
							]
						})]
					}),
					view === "artifacts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view artifact-view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "view-heading compact",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow",
								children: activeTask?.type || "TASK"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: activeTask?.title || t.artifacts })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "button-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "secondary",
									onClick: checkpointArtifact,
									children: ["↺ ", language === "zh" ? "创建版本" : "Checkpoint"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "primary",
									onClick: exportTask,
									children: [t.export, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⇩" })]
								})]
							})]
						}), activeTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "editor-shell",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
								className: "file-list",
								children: Object.keys(activeTask.artifacts).map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setSelectedArtifact(name),
									className: selectedArtifact === name ? "active" : "",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name.endsWith(".md") ? "M↓" : "{}" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: name }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: /TODO|TBD/i.test(activeTask.artifacts[name]) ? "warn" : "ok" })
									]
								}, name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "editor-panel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "editor-toolbar",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "segmented",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: editorMode === "edit" ? "active" : "",
												onClick: () => setEditorMode("edit"),
												children: "Edit"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: editorMode === "preview" ? "active" : "",
												onClick: () => setEditorMode("preview"),
												children: "Preview"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [(activeTask.artifacts[selectedArtifact] || "").split("\n").length, " lines"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "icon-button",
											title: "Download artifact",
											onClick: () => download(selectedArtifact, activeTask.artifacts[selectedArtifact] || ""),
											children: "⇩"
										})
									]
								}), editorMode === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "artifact-editor",
									value: activeTask.artifacts[selectedArtifact] || "",
									onChange: (e) => updateArtifact(e.target.value),
									spellCheck: false
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, { content: activeTask.artifacts[selectedArtifact] || "" })]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							action: () => setView("task"),
							label: t.task
						})]
					}),
					view === "prompt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "view-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow",
								children: "SOFTWARE-ENGINEERING-GOVERNOR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.prompt })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "button-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "secondary",
									onClick: () => navigator.clipboard.writeText(generatedPrompt).then(() => flash(language === "zh" ? "已复制" : "Copied")),
									children: "Copy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "primary",
									onClick: () => download(`${slug(activeTask?.title || "codex-task")}-prompt.md`, generatedPrompt),
									children: ["Markdown", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⇩" })]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "prompt-grid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass-panel prompt-options",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Execution policy" }), Object.entries({
									plan: "Engineering Plan",
									tests: "Run tests",
									docs: "Update docs",
									finalReport: "Final report",
									minimal: "Minimal change",
									dependencies: "Allow dependencies",
									architecture: "Allow architecture change"
								}).map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "switch-row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: promptOptions[key],
											onChange: (e) => setPromptOptions({
												...promptOptions,
												[key]: e.target.checked
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
									]
								}, key))]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "prompt-output",
								children: generatedPrompt
							})]
						})]
					}),
					view === "repository" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "view-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "STATIC INSPECTION · NO EXECUTION"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.repository }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: repoName || `${zipLimits.maxArchiveBytes / 1024 / 1024} MB · ${zipLimits.maxFiles} files` })
							] }), repoFindings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "secondary",
								onClick: downloadReport,
								children: language === "zh" ? "下载报告" : "Download report"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "repository-grid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass-panel upload-panel",
								onDragOver: (e) => e.preventDefault(),
								onDrop: (e) => {
									e.preventDefault();
									const file = e.dataTransfer.files[0];
									if (file) inspectArchive(file);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: fileInput,
										type: "file",
										accept: ".zip,application/zip",
										hidden: true,
										onChange: (e) => e.target.files?.[0] && inspectArchive(e.target.files[0])
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "upload-target",
										onClick: () => fileInput.current?.click(),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⇧" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: language === "zh" ? "拖入或选择 ZIP" : "Drop or choose ZIP" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "UTF-8 · path · adoption · release hygiene" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "tree-input",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: treeText,
											onChange: (e) => setTreeText(e.target.value),
											placeholder: "AGENTS.md\ndocs/software-engineering/17_REVISION_MASTER_CHECKLIST.md\ntemplates/REQUIREMENTS_TEMPLATE.md"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "secondary",
											onClick: inspectTree,
											children: language === "zh" ? "检查目录树" : "Check tree"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass-panel findings-panel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "finding-summary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: repoFindings.filter((f) => f.level === "critical").length }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Critical" })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: repoFindings.filter((f) => f.level === "warning").length }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Warning" })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: repoFindings.filter((f) => f.level === "passed").length }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Passed" })] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "finding-list",
									children: repoFindings.length ? repoFindings.map((finding, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: `finding ${finding.level}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: finding.level === "passed" ? "✓" : finding.level === "warning" ? "!" : "×" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: finding.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: finding.detail })] })]
									}, `${finding.detail}-${index}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "empty-findings",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌕" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: language === "zh" ? "等待静态检查" : "Awaiting static inspection" })]
									})
								})]
							})]
						})]
					}),
					view === "validation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "view-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "EVIDENCE PROVENANCE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.validation }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: language === "zh" ? "状态不会从 UNKNOWN 自动提升为 PASS" : "UNKNOWN evidence is never promoted to PASS" })
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "secondary",
									onClick: downloadReport,
									children: "JSON ⇩"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "validation-grid",
								children: validationGroups.map(([label, status], index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel validation-card reveal",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "validation-index",
											children: String(index + 1).padStart(2, "0")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: status === "pass" ? "Required artifact is present." : status === "warning" ? "Evidence exists; execution remains pending." : status === "not-run" ? "No trusted execution evidence was supplied." : status === "unknown" ? "Evidence is unavailable." : "Required evidence is missing." })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											status,
											source: status === "not-run" ? "user code was not executed" : "browser-static"
										})
									]
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "evidence-legend glass-panel",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "legend-browser" }), "Browser static"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "legend-server" }), "Sites API"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "legend-user" }), "User attestation"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "legend-unknown" }), "Unavailable"] })
								]
							})
						]
					}),
					view === "metrics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "view-heading",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "CURRENT PROJECT · BROWSER STATIC"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.metrics })] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Artifact completion",
										value: `${metrics.artifactCompletion}%`,
										tone: "purple"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Requirements",
										value: metrics.requirements,
										tone: "blue"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Acceptance criteria",
										value: metrics.acceptance,
										tone: "gold"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
										label: "Test cases",
										value: metrics.tests,
										tone: "blue"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metrics-detail",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel chart-panel",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "panel-title",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lifecycle coverage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [metrics.traceability, "% traced"] })]
									}), [
										["Requirements", Math.min(100, metrics.requirements * 20)],
										["Test traceability", metrics.traceability],
										["Risk coverage", Math.min(100, metrics.risks * 25)],
										["Security review", metrics.security === "pass" ? 100 : 0],
										["AI evidence", metrics.aiEvidence === "pass" ? 100 : 0],
										["Release readiness", metrics.releaseReadiness === "warning" ? 72 : 20]
									].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bar-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${value}%` } }) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [value, "%"] })
										]
									}, label))]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel score-panel",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "score-orbit",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: Math.round((metrics.artifactCompletion + metrics.traceability + (metrics.security === "pass" ? 100 : 0)) / 3) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "governance score" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Missing required files" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: metrics.missing.length })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Risk IDs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: metrics.risks })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Local" })] })
									] })]
								})]
							})
						]
					}),
					view === "releases" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "view-heading",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "UTF-8 SAFE EXPORT"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.releases })] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "release-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "release-card glass-panel",
										onClick: exportTask,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "release-icon",
												children: "T"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Task Package" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeTask?.title || t.noProject }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [Object.keys(activeTask?.artifacts || {}).length, " Markdown files"] })
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "⇩" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "release-card glass-panel",
										onClick: exportProject,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "release-icon",
												children: "G"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Governance Project" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: activeProject?.name || t.noProject }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "All local task packages" })
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "⇩" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "release-card glass-panel",
										onClick: downloadReport,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "release-icon",
												children: `{}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Validation Manifest" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Browser static evidence" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "JSON · explicit provenance" })
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "⇩" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "release-card glass-panel",
										onClick: () => download(`${slug(activeTask?.title || "task")}-prompt.md`, generatedPrompt),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "release-icon",
												children: "›_"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Codex Prompt" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Governor lifecycle instructions" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Markdown" })
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "⇩" })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass-panel release-policy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: activeProject ? "pass" : "unknown" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "UTF-8 paths" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: "pass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No macOS artifacts" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: "pass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No local absolute paths" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: "pass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stored ZIP entries" })] })
								]
							})
						]
					}),
					view === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "view-heading",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "INDEXEDDB · THIS DEVICE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.history })] })
							}),
							projects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "history-list",
								children: projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel history-project",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											setActiveProjectId(project.id);
											setView("dashboard");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "brand-mark",
											children: project.name.slice(0, 2).toUpperCase()
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: project.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											project.tasks.length,
											" tasks · ",
											new Date(project.updatedAt).toLocaleString()
										] })] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: project.tasks.slice(0, 3).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										task.type,
										": ",
										task.title
									] }, task.id)) })]
								}, project.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								action: () => setView("project"),
								label: t.project
							}),
							" ",
							activeTask?.revisions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "revision-list",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Artifact revisions" }), activeTask.revisions.map((revision) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => restoreRevision(revision),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↺" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: revision.artifact }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: new Date(revision.at).toLocaleString() })
									]
								}, `${revision.at}-${revision.artifact}`))]
							}) : null
						]
					}),
					view === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "view",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "view-heading",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow",
								children: "LOCAL-FIRST CONTROL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t.settings })] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "settings-grid",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel settings-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Appearance" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: t.language,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: language,
												onChange: (e) => setLanguage(e.target.value),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "zh",
													children: "中文"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "en",
													children: "English"
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: t.theme,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: theme,
												onChange: (e) => setTheme(e.target.value),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "system",
														children: "System"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "dark",
														children: "Dark"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "light",
														children: "Light"
													})
												]
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel settings-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Privacy" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Project storage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "IndexedDB" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Uploaded ZIP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Memory only" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Server upload" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Disabled" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Code execution" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Disabled" })] })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "danger",
											onClick: () => clearProjects().then(() => {
												setProjects([]);
												setActiveProjectId("");
												flash(language === "zh" ? "本地数据已清除" : "Local data cleared");
											}),
											children: t.clear
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "glass-panel settings-card boundary-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Capability boundary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: capabilityStatus }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sites hosts the interface and a read-only capability endpoint. Repository content remains on this device." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "legal-links",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												href: "/privacy",
												children: "Privacy"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												href: "/terms",
												children: "Terms"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "version-row",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Governor UI" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "1.0 MVP" })]
										})
									]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mobile-nav",
				"aria-label": "Mobile navigation",
				children: nav.slice(0, 5).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: view === item.id ? "active" : "",
					onClick: () => setView(item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t[item.id] })]
				}, item.id))
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toast",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }), notice]
			})
		]
	});
}
function EmptyState({ action, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "empty-state glass-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "brand-mark",
				children: "SE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "No active package" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "primary",
				onClick: action,
				children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
			})
		]
	});
}
//#endregion
export { GovernorApp as default };
