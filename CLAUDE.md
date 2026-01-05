# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

react-native-intro is a React Native library that reimplements intro.js functionality natively. It provides step-by-step user onboarding tours and contextual hints for mobile apps. This is **not** a wrapper around the web intro.js library—it's a native React Native implementation with feature parity to intro.js v8.0.0+.

## Commands

```bash
# Install dependencies (uses Yarn workspaces)
yarn

# Build the library
yarn prepare

# Type checking
yarn typecheck

# Lint
yarn lint
yarn lint --fix

# Run tests
yarn test
yarn test --watch              # Watch mode
yarn test path/to/file.test.ts # Single test file

# Example app
yarn example start             # Start Metro bundler
yarn example ios               # Run on iOS
yarn example android           # Run on Android
yarn example web               # Run on web

# Release
yarn release
```

## Architecture

### Core Components (in src/)

| Component | Purpose |
|-----------|---------|
| `IntroProvider` | Context provider that wraps the app and manages tour/hint state |
| `TourStep` | Wrapper component that registers elements as tour steps (supports props-based config) |
| `HintSpot` | Wrapper component that registers hint anchor points (supports props-based config) |
| `TourOverlay` | Full-screen overlay with spotlight cutout around active step |
| `Tooltip` | Positioned tooltip displaying step content |
| `HintBubble` | Pulsing hint indicator and popup dialog |
| `useTour` | Hook for tour-specific control |
| `useHints` | Hook for hint-specific control |
| `useIntro` | Combined hook for both tours and hints |

### Key Design Decisions

- **Props-based configuration**: TourStep and HintSpot support defining content via props (recommended) or programmatically
- **Measure-based positioning**: Uses React Native's `measure()` API to position overlays and tooltips relative to target elements
- **Context-driven state**: All tour/hint state flows through `IntroProvider` context
- **Optional dependencies**: Falls back gracefully when react-native-reanimated or async-storage aren't installed

### API Patterns

Both TourStep and HintSpot support two usage patterns:

1. **Props-based (recommended)**: Define content via component props
   ```tsx
   <TourStep id="welcome" order={1} intro="Welcome!" title="Hello">
     <Button />
   </TourStep>
   tour.start(); // Uses props from all registered TourSteps
   ```

2. **Programmatic**: Pass explicit configuration to hooks
   ```tsx
   <TourStep id="welcome">
     <Button />
   </TourStep>
   tour.start('tour-id', [{ id: 'step-1', targetId: 'welcome', content: '...' }]);
   ```

### Monorepo Structure

- Root: Library source code (`src/`)
- `example/`: Expo example app that links to the local library

## Version Requirements

- React Native: 0.81.0+
- React: 19.0.0+
- Expo: 54.0.0+ (compatible, not required)

## Commit Convention

Uses conventional commits: `fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`

Pre-commit hooks (lefthook) enforce linting, type checking, and commit message format.

## Pre-Commit Requirements

**IMPORTANT**: Before completing any code changes, always verify that git hooks will pass:

```bash
yarn typecheck && yarn lint
```

If there are lint errors, fix them with `yarn lint --fix` or manually.

### Git Hooks (lefthook)

The pre-commit hook runs `yarn typecheck` and `yarn lint` - code must compile and pass linting before commits are accepted.

## Documentation Maintenance

**CRITICAL**: All documentation must be kept up-to-date with every feature change. When adding or modifying features, update the relevant documentation files:

### Documentation Files

| File | Purpose | Update When |
|------|---------|-------------|
| `README.md` | User-facing API docs, installation, usage examples | Any public API change, new feature, or configuration option |
| `DEVELOPER.md` | Developer setup, building, testing, troubleshooting | Build process changes, new dev workflows, common issues |
| `MAINTAINER.md` | Release process, publishing, bob tool, versioning | Release workflow changes, new maintenance tasks |
| `LLM.md` | Complete library docs for AI coding agents | Any feature, API, or integration pattern change |
| `CLAUDE.md` | AI assistant instructions for this codebase | Project structure changes, new conventions |

### JSDoc Comments

All public APIs in `src/` must have complete JSDoc documentation:
- Components: Purpose, props, usage examples
- Hooks: Return values, usage patterns
- Types: Property descriptions
- Utilities: Parameters, return values, examples

### Documentation Checklist

When completing any feature work:
1. Update README.md if the feature affects public API or usage
2. Update JSDoc comments for any new/modified exports
3. Update LLM.md with integration guidance for the feature
4. Update DEVELOPER.md if the feature affects development workflow
5. Update this file (CLAUDE.md) if architecture or conventions change

## Active Technologies

- TypeScript 5.9+ (strict mode)
- React Native 0.81+
- React 19+
- react-native-reanimated 3.16+ (for animations)
- AsyncStorage for "Don't show again" persistence (optional, with custom adapter support)
- Expo 54+ (compatible, not a dependency)

## Key Source Files

| Path | Purpose |
|------|---------|
| `src/index.tsx` | Main exports |
| `src/components/IntroProvider.tsx` | Context provider and reducer |
| `src/components/TourStep.tsx` | Tour step wrapper component |
| `src/components/HintSpot.tsx` | Hint anchor wrapper component |
| `src/components/TourOverlay.tsx` | Overlay with spotlight |
| `src/components/Tooltip.tsx` | Step tooltip display |
| `src/hooks/useIntro.ts` | Main hook implementation |
| `src/context/IntroContext.ts` | State types and initial state |
| `src/context/reducer.ts` | State reducer |
| `src/themes/` | Built-in themes |
| `src/types/` | TypeScript type definitions |

## Testing

Test files are in `__tests__/`:
- `__tests__/hooks/` - Hook tests
- `__tests__/components/` - Component tests
- `__tests__/unit/` - Unit tests

Run tests: `yarn test`
Run specific: `yarn test __tests__/hooks/useIntro.test.ts`
