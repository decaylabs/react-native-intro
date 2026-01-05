# Maintainer Guide

This guide covers the release process, publishing to npm, version management, and maintenance tasks for react-native-intro.

## Build System

### react-native-builder-bob

This library uses [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob) for building. The configuration is in `package.json`:

```json
{
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [
      ["module", { "esm": true }],
      ["typescript", { "project": "tsconfig.build.json" }]
    ]
  }
}
```

### Build Outputs

| Output | Path | Purpose |
|--------|------|---------|
| ESM modules | `lib/module/` | Main entry point for bundlers |
| TypeScript declarations | `lib/typescript/` | Type definitions |

### Building Locally

```bash
# Build the library
yarn prepare

# Clean and rebuild
yarn clean && yarn prepare
```

## Version Management

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Pre-release Versions

For testing before stable release:

```
1.0.0-alpha.1  → Early preview, unstable API
1.0.0-beta.1   → Feature complete, testing phase
1.0.0-rc.1     → Release candidate, final testing
```

## Release Process

### Prerequisites

1. **npm account** with publish access to `react-native-intro`
2. **GitHub token** for creating releases (stored in `GITHUB_TOKEN` env var)
3. All tests passing: `yarn test`
4. TypeScript compiles: `yarn typecheck`
5. Lint passes: `yarn lint`

### Automated Release (Recommended)

This project uses [release-it](https://github.com/release-it/release-it) for automated releases.

```bash
# Dry run (see what would happen)
yarn release --dry-run

# Release with automatic version bump based on commits
yarn release

# Specific version type
yarn release minor   # 0.1.0 → 0.2.0
yarn release patch   # 0.1.0 → 0.1.1
yarn release major   # 0.1.0 → 1.0.0

# Pre-release
yarn release --preRelease=alpha
yarn release --preRelease=beta
yarn release --preRelease=rc
```

### What release-it Does

1. **Bumps version** in package.json
2. **Generates changelog** from conventional commits
3. **Creates git commit** with version bump
4. **Creates git tag** (e.g., `v0.2.0`)
5. **Pushes to GitHub**
6. **Creates GitHub release** with changelog
7. **Publishes to npm**

### Manual Release (If Needed)

```bash
# 1. Ensure clean working directory
git status

# 2. Run all checks
yarn typecheck && yarn lint && yarn test

# 3. Build the library
yarn clean && yarn prepare

# 4. Bump version
npm version patch  # or minor/major

# 5. Push with tags
git push --follow-tags

# 6. Publish to npm
npm publish
```

## Changelog

Changelog is auto-generated from conventional commits using `@release-it/conventional-changelog`.

### Commit Categories in Changelog

| Commit Type | Changelog Section |
|-------------|-------------------|
| `feat` | Features |
| `fix` | Bug Fixes |
| `perf` | Performance Improvements |
| `docs` | Documentation (if configured) |

### Breaking Changes

Include `BREAKING CHANGE:` in commit body:

```
feat(api): change tour.start() signature

BREAKING CHANGE: The first parameter is now required.
Before: tour.start()
After: tour.start('tour-id')
```

## npm Publishing

### Package Contents

The `files` field in package.json controls what's published:

```json
{
  "files": [
    "src",
    "lib",
    "android",
    "ios",
    "cpp",
    "*.podspec",
    "react-native.config.js"
  ]
}
```

Excluded:
- `__tests__/`
- `example/`
- Build artifacts in `android/build`, `ios/build`
- Dot files

### Verify Package Contents

Before publishing, verify what will be included:

```bash
# List files that would be published
npm pack --dry-run

# Create tarball for inspection
npm pack
tar -tzf react-native-intro-*.tgz
```

### Publishing to npm

```bash
# Login (if not already)
npm login

# Publish (public package)
npm publish --access public

# Publish with tag (for pre-releases)
npm publish --tag beta
npm publish --tag next
```

## CI/CD

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push, PR | Type check, lint, test |
| `publish.yml` | Tag push | Publish to npm |

### CI Workflow (`ci.yml`)

Runs on every push and PR:

1. Install dependencies
2. Run type checking
3. Run linting
4. Run tests

### Publish Workflow (`publish.yml`)

Triggered on version tags (e.g., `v1.0.0`):

1. Build the library
2. Publish to npm
3. Create GitHub release

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `NPM_TOKEN` | npm publish authentication |

## Dependency Management

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-native": ">=0.81.0",
    "react-native-reanimated": ">=3.16.0",
    "@react-native-async-storage/async-storage": ">=2.1.0",
    "expo": ">=54.0.0"
  },
  "peerDependenciesMeta": {
    "@react-native-async-storage/async-storage": { "optional": true },
    "expo": { "optional": true }
  }
}
```

### Updating Dependencies

```bash
# Check for outdated packages
yarn outdated

# Update all (careful with breaking changes)
yarn up "*"

# Update specific package
yarn up react-native-reanimated

# Update dev dependencies
yarn up "@types/*"
```

### Testing Dependency Updates

1. Update in a branch
2. Run full test suite
3. Test example app on iOS/Android
4. Verify build output

## Deprecation Process

When deprecating features:

1. **Add deprecation warning** in code:
   ```typescript
   /**
    * @deprecated Use TourStep instead
    */
   export const Step = TourStep;
   ```

2. **Add console warning** for runtime:
   ```typescript
   console.warn('[react-native-intro] Step is deprecated. Use TourStep instead.');
   ```

3. **Document in README** under a deprecation section

4. **Remove in next major version**

## Troubleshooting Releases

### npm publish fails

```bash
# Check if logged in
npm whoami

# Re-login
npm login

# Verify package name is available
npm view react-native-intro
```

### GitHub release fails

- Check `GITHUB_TOKEN` secret is set
- Verify token has `repo` permissions
- Check release-it config in package.json

### Build fails during release

```bash
# Clean and rebuild
yarn clean
yarn prepare

# Check for TypeScript errors
yarn typecheck
```

## Security

### Reporting Vulnerabilities

Security issues should be reported via GitHub Security Advisories, not public issues.

### Dependency Auditing

```bash
# Check for vulnerabilities
yarn npm audit

# Fix automatically (if possible)
yarn npm audit --fix
```

## Support

### Issue Triage

1. **Bug reports**: Verify reproduction, add labels
2. **Feature requests**: Discuss in issues first
3. **Questions**: Point to README/docs

### Pull Request Review

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] TypeScript types complete
- [ ] Conventional commit message
- [ ] No breaking changes (or documented)

## Handoff Checklist

If transferring maintainership:

- [ ] Transfer npm ownership: `npm owner add <user> react-native-intro`
- [ ] Add to GitHub repository admins
- [ ] Share any private documentation
- [ ] Update CODEOWNERS file
- [ ] Introduce to community/users
