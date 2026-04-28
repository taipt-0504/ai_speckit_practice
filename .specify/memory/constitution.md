<!--
Sync Impact Report
Version change: 1.0.0 -> 2.0.0
Modified principles:
- I. Code Quality Is a Deliverable -> I. Code Quality Is a Deliverable
- II. Tests Define Done -> II. Test First Is Mandatory
Added sections:
- None
Removed sections:
- Core principle III. User Experience Must Stay Consistent
- Core principle IV. Performance Budgets Are Requirements
- Core principle V. Simplicity Before Expansion
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->
# AI Project 1 Constitution

## Core Principles

### I. Code Quality Is a Deliverable
All production code MUST be readable, reviewed, and maintainable before it is
considered complete. Changes MUST pass formatting, linting, and static-analysis
checks appropriate to the stack, and they MUST leave touched code in a clearer
state than it was found. Large abstractions, duplicated logic, and dead paths
MUST be removed or explicitly justified in the implementation plan. The purpose
is to keep the codebase cheap to evolve rather than merely functional today.

### II. Test First Is Mandatory
Every behavior change MUST begin by defining automated tests that would fail
without the implementation. The default sequence is specify behavior, write the
test, observe failure, implement, and then refactor while keeping the suite
green. The minimum required mix is the lowest-cost combination that proves the
behavior at the correct level: unit tests for local logic, integration or
contract tests for boundaries, and regression tests for defects. Manual checks
may supplement automation but MUST NOT replace it. Work that cannot yet be
tested is incomplete and MUST be tracked as an explicit blocker.

### III. Dockerized Implementation for Environment Parity
Implementation workflows MUST provide a Docker-based path for development and
execution so contributors can run the same stack across operating systems with
minimal host-specific drift. Features that add or change runtime dependencies
MUST update Docker configuration and documentation in the same change. Teams
MUST verify core flows through the containerized path before marking work done.

## Engineering Standards

- Specs MUST define measurable success criteria, code quality expectations, and
  the test evidence required to mark the work complete.
- Plans MUST include a Constitution Check that verifies code quality controls
  and a failing-first test strategy for the feature.
- Plans MUST define how the feature is executed and validated through Docker,
  including required services and environment variables.
- Tasks MUST include the work needed to enforce these principles, including
  quality-gate setup and automated tests for every behavior change.
- Tasks touching runtime or infrastructure MUST include Docker-related updates
  where needed to preserve cross-environment reproducibility.
- Reviewers MUST reject changes that omit the validation steps required by the
  spec or plan.

## Delivery Workflow

1. Specify the user outcome, code quality expectations, and test evidence.
2. Plan the technical approach and document constitution gates before design
   work is considered ready.
3. Write or update automated tests before implementation and confirm the new
   behavior is failing for the right reason.
4. Implement in small increments, keeping tests, Docker parity, and quality
  checks close to the change.
5. Mark work complete only after automated tests, Docker validation, and required quality gates
   pass.

## Governance

This constitution takes precedence over local habits and template defaults.
Amendments require: (1) a documented proposal, (2) an explanation of the impact
on existing templates or workflow, and (3) synchronization of affected artifacts
in the same change. Versioning follows semantic rules for governance: MAJOR for
breaking principle removals or redefinitions, MINOR for new principles or
materially expanded obligations, and PATCH for clarifications that do not change
enforcement. Every review, plan, and task list MUST include a compliance check
against this constitution, and unresolved violations MUST be tracked explicitly
before merge.

**Version**: 2.1.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-28
