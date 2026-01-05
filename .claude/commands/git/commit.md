---
description: Generate a conventional commit message from staged changes
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git commit:*)
---

## Context

Staged changes:
```
!`git diff --cached --stat`
```

Detailed diff:
```
!`git diff --cached`
```

## Task

Generate a commit message for the staged changes following the **Conventional Commits** specification, then execute the commit.

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature (correlates with MINOR in SemVer)
- `fix`: A bug fix (correlates with PATCH in SemVer)
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

### Rules
1. Keep the subject line under 72 characters
2. Use imperative mood ("add" not "added", "fix" not "fixed")
3. Do not end the subject line with a period
4. Separate subject from body with a blank line
5. Use the body to explain *what* and *why*, not *how*
6. Add "!" after type/scope for breaking changes (e.g., "feat!:" or "feat(api)!:")

### Execution

After generating the commit message, execute the commit using:
```bash
git commit -m "$(cat <<'EOF'
<your commit message here>
EOF
)"
```

Show the user the commit message you generated, then run the git commit command.
