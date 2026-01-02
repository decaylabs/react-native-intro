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
- Expo: 54.0.0+ (optional)

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

## Active Technologies
- TypeScript 5.9+ (strict mode) (001-rn-intro-library)
- AsyncStorage for "Don't show again" preference (with custom adapter option) (001-rn-intro-library)

## Recent Changes
- 001-rn-intro-library: Added TypeScript 5.9+ (strict mode)
