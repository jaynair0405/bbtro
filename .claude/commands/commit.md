---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*), Bash(git diff:*), Bash(git log:*)
description: Safely commit and push the current task's changes to GitHub
---

## Current Git Status

!`git status`

## Recent Commits (for message style reference)

!`git log -3 --oneline`

## Your Task

1. Run `git branch --show-current` and confirm it matches the work being committed.
   Do not commit incomplete module work directly on `master`.
2. Review `git status --short` and `git diff`.
3. Stage only files belonging to the current task by naming each path explicitly.
   Never use `git add .` or `git add -A` in a dirty worktree.
4. Review the staged patch with `git diff --cached` and exclude unrelated changes.
5. Create a descriptive commit message summarizing the staged changes.
6. Commit with the standard signature block.
7. Push the current branch. Use `git push -u origin <branch>` on its first push;
   otherwise use plain `git push`.

End the commit message with:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
