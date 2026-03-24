---
description: "Create a plan with agent team assignments"
argument-hint: <what to plan>
model: opus
disallowed-tools: Write(app/*), Write(components/*), Write(lib/*), Edit(app/*), Edit(components/*), Edit(lib/*)
---

Create a detailed implementation plan with explicit agent team assignments.

## Input
$ARGUMENTS

## Workflow

1. **Read** CLAUDE.md and relevant docs/ to understand the project
2. **Analyze** the codebase to understand current state and dependencies
3. **Design** the approach: what changes, in what order, what could break
4. **Decompose** into parallelizable tasks:
   - Identify which tasks are independent (can run in parallel)
   - Identify which tasks have dependencies (must be sequential)
   - Group tasks by domain/layer
5. **Assign agents** to each task:
   - Builder agents for implementation tasks (specify which files each touches)
   - Validator agents for verification after each phase
   - No two builders should touch the same files
6. **Save** the plan to specs/<descriptive-name>.md

## Plan Structure

The plan MUST include:

### Overview
- Objective (what and why)
- Acceptance criteria

### Task Breakdown
For each task:
- **Task ID**: T1, T2, etc.
- **Agent**: builder | validator
- **Depends on**: list of task IDs (or "none" if independent)
- **Files**: specific files this task creates/modifies
- **Description**: what the agent should do
- **Verification**: how to confirm the task is done correctly

### Execution Order
```
Phase 1 (parallel): T1, T2, T3
  -> validate
Phase 2 (parallel): T4, T5
  -> validate
Phase 3 (sequential): T6
  -> final validation + cleanup
```

### Risks
- What could go wrong
- Rollback strategy
