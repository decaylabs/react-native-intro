---
description: Generate a PR title and description from branch changes
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git branch:*), Bash(gh pr create:*)
---

## Context

Current branch:
```
!`git branch --show-current`
```

Main branch commits not in current branch (to find base):
```
!`git log --oneline main..HEAD 2>/dev/null || git log --oneline master..HEAD 2>/dev/null || echo "Could not determine commits"`
```

Summary of all changes from main/master:
```
!`git diff main --stat 2>/dev/null || git diff master --stat 2>/dev/null || echo "Could not determine diff"`
```

## Task

Generate a **PR title** and **description** based on the branch changes, then create the PR.

### PR Title Format (Conventional Commits)
```
<type>[optional scope]: <description>
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Build system or dependency changes
- `ci`: CI configuration changes
- `chore`: Other changes

### PR Title Rules
1. Keep under 72 characters
2. Use imperative mood ("add" not "added")
3. No period at the end
4. Add "!" for breaking changes (e.g., "feat!:")

### PR Description Format
```markdown
## Summary
<2-4 bullet points describing the changes>

## Changes
<List of specific changes made>

## Test Plan
<How to test these changes>
```

### Execution

After generating the PR title and description, create the PR using:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<description>
EOF
)"
```

Show the user the PR title and description you generated, then run the gh pr create command. Return the PR URL when complete.
