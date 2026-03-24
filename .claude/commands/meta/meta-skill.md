---
description: "Turn a workflow into a repeatable skill"
argument-hint: <workflow description or name>
model: opus
---

Convert a workflow or repeated task into a reusable Claude Code skill (slash command + supporting files).

## Input
$ARGUMENTS

## Instructions

1. **Understand** the workflow:
   - What triggers it? (manual, post-build, periodic)
   - What inputs does it need?
   - What outputs does it produce?
   - What checks/validations are involved?
2. **Read** existing commands in .claude/commands/ for style reference
3. **Design** the skill:
   - Determine if it needs a single command or multiple (e.g., a command + a hook)
   - Identify if it needs agent definitions (builder/validator pattern)
   - Determine if it should update any persistent state (like review-lessons.md)
4. **Create** the skill files:
   - Primary command at .claude/commands/<skill-name>.md
   - Supporting agent definitions if needed at .claude/agents/team/
   - Hook scripts if needed at scripts/hooks/
5. **Document** in the command file:
   - Frontmatter with description and argument-hint
   - Clear purpose statement
   - Step-by-step workflow
   - Input/output specification
   - Error handling (what to do when things fail)
6. **Integrate** with existing workflows:
   - Update CLAUDE.md if this skill should run automatically
   - Wire into settings.json hooks if it should trigger on events
   - Add to the development cycle documentation if applicable
