---
description: "Generate a new agent definition"
argument-hint: <n> <role description>
model: opus
---

Create a new Claude Code agent definition.

## Input
$ARGUMENTS

## Instructions

1. Read existing agents in .claude/agents/team/ for style reference
2. Read CLAUDE.md for project conventions
3. Create a new agent file at .claude/agents/team/<n>.md
4. The agent definition MUST include:
   - Frontmatter with name, description, tools list, and model
   - Clear role statement (what this agent does)
   - Explicit tool restrictions (what it can and cannot touch)
   - A validation/review checklist appropriate to its role
   - Report format specification
5. Consider the principle of least privilege:
   - Read-only agents should NOT have Write/Edit tools
   - Implementation agents should be scoped to specific directories
   - Verification agents should be able to run checks but not modify code
6. Follow patterns established by existing builder.md and validator.md agents
