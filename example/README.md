# react-native-intro Example App

This Expo app demonstrates all features of the react-native-intro library.

## Running the Example

### Prerequisites

From the **repository root**, install all dependencies:

```bash
yarn install
```

### Start the App

```bash
# Start Metro bundler
yarn example start

# Run on iOS
yarn example ios

# Run on Android
yarn example android

# Run on Web
yarn example web
```

Or from the `example/` directory:

```bash
cd example
yarn start
yarn ios      # or android, web
```

## App Structure

The app has four tabs showcasing different library features:

### Tours Tab

Demonstrates basic tour functionality:

- **Props-based configuration** - Step content defined on `TourStep` components
- **Auto-scrolling** - Automatically scrolls to off-screen elements
- **Progress indicators** - Progress bar and step bullets
- **Navigation** - Next, Back, Skip, and Done buttons
- **Animation toggle** - Enable/disable step transition animations
- **Completion callbacks** - Modal shown when tour completes

### Hints Tab

Demonstrates contextual hints:

- **Hint types** - Default, info, warning, error, and success styles
- **Pulsing animation** - Animated indicators that draw attention
- **Tap to reveal** - Tap hint indicator to show tooltip
- **Position options** - Hints positioned at different anchor points
- **Animation toggle** - Enable/disable pulsing animation

### Themes Tab

Demonstrates theming capabilities:

- **Built-in themes**:
  - **Classic** - Light theme with blue accents
  - **Modern** - Contemporary design with indigo accents
  - **Dark** - Dark theme with cyan accents
  - **Auto** - Follows system light/dark mode
- **Theme preview** - Start a tour to see theme in action
- **Live switching** - Change themes and see immediate effect

### Advanced Tab

Demonstrates advanced features:

- **Async callbacks** - `onBeforeStart`, `onBeforeChange`, `onBeforeExit` with Promise support
- **Confirmation dialogs** - Block navigation with async validation
- **Event logging** - Real-time display of callback events
- **"Don't show again"** - Persistence with AsyncStorage
- **Dismissed state management** - Check and clear dismissed tours
- **Callback toggles** - Enable/disable confirmation prompts and async delays

## Features Demonstrated

| Feature | Tab | Description |
|---------|-----|-------------|
| Props-based tours | Tours | Define step content via TourStep props |
| Programmatic tours | Advanced | Pass steps array to tour.start() |
| Auto-scroll | Tours | Scrolls to off-screen elements |
| Progress bar | Tours | Visual progress indicator |
| Step bullets | Tours | Clickable step dots |
| Hints | Hints | Contextual help indicators |
| Hint types | Hints | Semantic hint styling (info, warning, etc.) |
| Themes | Themes | Built-in and custom themes |
| Auto theme | Themes | System light/dark mode detection |
| Callbacks | Advanced | Lifecycle event hooks |
| Async callbacks | Advanced | Promise-based validation |
| Persistence | Advanced | "Don't show again" functionality |

## Code Examples

The example screens serve as reference implementations:

- `src/screens/BasicTourScreen.tsx` - Props-based tour setup
- `src/screens/HintsScreen.tsx` - Hints with different types
- `src/screens/ThemesScreen.tsx` - Theme selection and preview
- `src/screens/AdvancedScreen.tsx` - Callbacks and persistence

## Dark Mode

The app fully supports dark mode:

- Follows system color scheme preference
- All screens adapt to light/dark mode
- Theme "auto" option demonstrates automatic theme switching
