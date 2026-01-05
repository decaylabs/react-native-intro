# Developer Guide

This guide covers setting up your development environment, running the example app, building, testing, and contributing to react-native-intro.

## Prerequisites

- **Node.js** 18+ (recommend using nvm)
- **Yarn** 4.x (included via Corepack)
- **Watchman** (for Metro bundler)
- **Xcode** 15+ (for iOS development)
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS dependencies)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dknell/react-native-intro.git
cd react-native-intro
```

### 2. Install Dependencies

```bash
# Enable Corepack for Yarn 4
corepack enable

# Install all dependencies (library + example app via workspaces)
yarn install
```

### 3. Build the Library

```bash
yarn prepare
```

This runs react-native-builder-bob to build the library to `lib/`.

## Running the Example App

The example app is an Expo project in `example/` that links to the local library via Yarn workspaces.

### iOS

```bash
# Install CocoaPods dependencies
cd example/ios && pod install && cd ../..

# Start Metro and run on iOS
yarn example start
# In another terminal:
yarn example ios
```

### Android

```bash
# Start Metro and run on Android
yarn example start
# In another terminal:
yarn example android
```

### Web

```bash
yarn example web
```

### Development Workflow

1. Make changes to library source in `src/`
2. Changes are automatically picked up by Metro (no rebuild needed)
3. Shake the device or press `r` in Metro to reload
4. For TypeScript changes, run `yarn typecheck` to verify

## Project Structure

```
react-native-intro/
├── src/                    # Library source code
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── context/            # React context and reducer
│   ├── utils/              # Utility functions
│   ├── themes/             # Built-in themes
│   ├── types/              # TypeScript type definitions
│   └── index.tsx           # Main exports
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   └── unit/               # Unit tests
├── example/                # Expo example app
│   ├── src/
│   │   ├── screens/        # Demo screens
│   │   └── components/     # Shared components
│   └── App.tsx
├── lib/                    # Built output (git-ignored)
├── specs/                  # Feature specifications
└── .github/                # CI workflows
```

## Available Scripts

### Library

| Command | Description |
|---------|-------------|
| `yarn prepare` | Build the library (bob build) |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint |
| `yarn lint --fix` | Auto-fix lint errors |
| `yarn test` | Run Jest tests |
| `yarn test --watch` | Run tests in watch mode |
| `yarn test path/to/file.test.ts` | Run specific test file |
| `yarn clean` | Remove built files |

### Example App

| Command | Description |
|---------|-------------|
| `yarn example start` | Start Metro bundler |
| `yarn example ios` | Run on iOS simulator |
| `yarn example android` | Run on Android emulator |
| `yarn example web` | Run in browser |

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Watch mode
yarn test --watch

# Run specific test file
yarn test __tests__/hooks/useIntro.test.ts

# Run tests matching a pattern
yarn test -t "should start tour"
```

### Test Structure

- **Unit tests** (`__tests__/unit/`): Pure function tests
- **Component tests** (`__tests__/components/`): React component tests using Testing Library
- **Hook tests** (`__tests__/hooks/`): Custom hook tests

### Writing Tests

Use `@testing-library/react-native` for component tests:

```tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { IntroProvider, TourStep, useTour } from '../src';

function TestComponent() {
  const tour = useTour();
  return (
    <TourStep id="test" intro="Test content">
      <Button title="Start" onPress={() => tour.start()} />
    </TourStep>
  );
}

test('starts tour on button press', () => {
  render(
    <IntroProvider>
      <TestComponent />
    </IntroProvider>
  );

  fireEvent.press(screen.getByText('Start'));
  // Assert tour started...
});
```

## Type Checking

```bash
# Check all TypeScript files
yarn typecheck

# Watch mode (requires tsc-watch)
npx tsc --watch --noEmit
```

The library uses TypeScript strict mode. All public APIs must be fully typed.

## Linting

```bash
# Check for lint errors
yarn lint

# Auto-fix fixable issues
yarn lint --fix
```

ESLint is configured with:
- `@react-native/eslint-config`
- `eslint-plugin-prettier`

## Pre-Commit Hooks

Lefthook runs before each commit:

1. `yarn typecheck` - Type checking must pass
2. `yarn lint` - Linting must pass

If hooks fail, the commit is rejected. Fix issues and try again.

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Changes to build process, tooling, etc. |
| `style` | Code style changes (formatting, etc.) |
| `perf` | Performance improvements |

### Examples

```bash
feat(tour): add floating tooltip support
fix(tooltip): correct positioning near screen edges
docs: update README with new API examples
test(hooks): add tests for useIntro hook
chore: update dependencies
```

## Adding a New Feature

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Write tests first** (TDD approach recommended)

3. **Implement the feature** in `src/`

4. **Update types** in `src/types/` if adding new APIs

5. **Add JSDoc comments** for all public APIs

6. **Update documentation**:
   - README.md for user-facing features
   - LLM.md for AI agent integration

7. **Update example app** if helpful for demos

8. **Run checks**:
   ```bash
   yarn typecheck && yarn lint && yarn test
   ```

9. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push -u origin feat/my-feature
   ```

10. **Open a Pull Request**

## Debugging

### Metro Bundler Issues

```bash
# Clear Metro cache
yarn example start --reset-cache

# Clear all caches
cd example && rm -rf node_modules/.cache
```

### iOS Build Issues

```bash
# Clean and reinstall pods
cd example/ios
rm -rf Pods Podfile.lock
pod install
```

### Android Build Issues

```bash
# Clean Android build
cd example/android
./gradlew clean
```

### Reanimated Issues

If animations aren't working:

1. Ensure babel plugin is configured in `babel.config.js`
2. Clear Metro cache: `yarn example start --reset-cache`
3. Rebuild the app completely

## Architecture Overview

### State Management

All tour/hint state flows through React Context:

```
IntroProvider
  └── IntroContext (state + dispatch)
       ├── tourCallbacks
       ├── hintCallbacks
       └── registry (element refs)
```

The reducer in `src/context/reducer.ts` handles all state transitions.

### Component Hierarchy

```
IntroProvider
  └── TourOverlay (portal-like, renders above content)
       ├── Overlay (semi-transparent background)
       ├── Spotlight (cutout around target)
       └── Tooltip (positioned content)
```

### Element Registration

1. `TourStep` and `HintSpot` register refs on mount
2. When tour starts, all refs are measured via `measureInWindow()`
3. Measurements stored in state, used for positioning

## Troubleshooting

### "useIntro must be used within an IntroProvider"

Ensure your component tree is wrapped with `IntroProvider`:

```tsx
<IntroProvider>
  <App />
</IntroProvider>
```

### Measurements return 0

This can happen if:
- Element isn't mounted yet (use setTimeout)
- `collapsable={false}` is missing on Android
- Element has `display: none` or 0 dimensions

### Tests fail with "act" warnings

Wrap async operations in `waitFor`:

```tsx
import { waitFor } from '@testing-library/react-native';

await waitFor(() => {
  expect(something).toBe(true);
});
```

## Getting Help

- **GitHub Issues**: [github.com/dknell/react-native-intro/issues](https://github.com/dknell/react-native-intro/issues)
- **Discussions**: [github.com/dknell/react-native-intro/discussions](https://github.com/dknell/react-native-intro/discussions)

## License

MIT - see [LICENSE](./LICENSE) for details.
