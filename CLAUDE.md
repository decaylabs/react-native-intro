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

### Core Components (to be implemented in src/)

| Component | Purpose |
|-----------|---------|
| `IntroProvider` | Context provider that wraps the app and manages tour/hint state |
| `TourStep` | Wrapper component that registers child elements as tour steps |
| `HintSpot` | Component that registers hint anchor points on elements |
| `TourOverlay` | Full-screen overlay with spotlight cutout around active step |
| `Tooltip` | Positioned tooltip displaying step content |
| `HintBubble` | Pulsing hint indicator and popup dialog |
| `useIntro` | Hook for programmatic tour/hint control |

### Key Design Decisions

- **Measure-based positioning**: Uses React Native's `measure()` API to position overlays and tooltips relative to target elements
- **Context-driven state**: All tour/hint state flows through `IntroProvider` context
- **Optional dependencies**: Falls back gracefully when react-native-reanimated or async-storage aren't installed

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
