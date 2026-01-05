/**
 * ThemesScreen - Demo screen showing theme customization
 *
 * Demonstrates the different built-in themes (classic, modern, dark, auto)
 * and custom theme creation.
 */

import { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  TourStep,
  useTour,
  useScrollView,
  type ScrollableRef,
  type ThemeName,
} from '@decaylabs/react-native-intro';

type SelectableTheme = ThemeName;

interface ThemesScreenProps {
  selectedTheme: SelectableTheme;
  onThemeChange: (theme: SelectableTheme) => void;
  isDark?: boolean;
}

// Color schemes
const Colors = {
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#007AFF',
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    border: '#333333',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    accent: '#0a84ff',
  },
};

interface ThemeOption {
  name: SelectableTheme;
  label: string;
  description: string;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    name: 'classic',
    label: 'Classic',
    description: 'Light theme with blue accents',
    colors: {
      primary: '#3498db',
      background: '#ffffff',
      text: '#333333',
    },
  },
  {
    name: 'modern',
    label: 'Modern',
    description: 'Contemporary design with indigo accents',
    colors: {
      primary: '#6366f1',
      background: '#ffffff',
      text: '#1a1a2e',
    },
  },
  {
    name: 'dark',
    label: 'Dark',
    description: 'Dark theme with cyan accents',
    colors: {
      primary: '#06b6d4',
      background: '#1e1e1e',
      text: '#ffffff',
    },
  },
  {
    name: 'auto',
    label: 'Auto',
    description: 'Follows system light/dark mode',
    colors: {
      primary: '#888888',
      background: 'linear-gradient',
      text: '#666666',
    },
  },
];

export function ThemesScreen({
  selectedTheme,
  onThemeChange,
  isDark = false,
}: ThemesScreenProps) {
  const colors = isDark ? Colors.dark : Colors.light;
  const tour = useTour();
  const scrollRef = useRef<any>(null);

  // Register ScrollView for auto-scrolling during tour
  const { onScroll } = useScrollView(
    scrollRef as React.RefObject<ScrollableRef | null>
  );

  const startTour = () => {
    tour.start({
      animate: true,
      animationDuration: 400,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <TourStep
        id="themes-header"
        order={0}
        title="Theme Customization"
        intro="This demo shows the different built-in themes available in react-native-intro. Select a theme to see it in action!"
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Theme Demo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select a theme and start the tour to see it in action
          </Text>
        </View>
      </TourStep>

      {/* Theme Selector */}
      <TourStep
        id="theme-selector"
        order={1}
        title="Choose Your Theme"
        intro="Pick from classic, modern, dark, or auto themes. The auto theme follows your system's light/dark mode setting."
      >
        <View
          style={[
            styles.themeSelectorContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Theme
          </Text>
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.themeCard,
                  { backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8' },
                  selectedTheme === option.name && {
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                  { borderColor: option.colors.primary },
                ]}
                onPress={() => onThemeChange(option.name)}
              >
                {/* Color preview */}
                <View style={styles.colorPreview}>
                  {option.name === 'auto' ? (
                    <View style={styles.autoPreview}>
                      <View style={[styles.autoHalf, styles.autoLight]} />
                      <View style={[styles.autoHalf, styles.autoDark]} />
                    </View>
                  ) : (
                    <>
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: option.colors.background },
                        ]}
                      />
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: option.colors.primary },
                        ]}
                      />
                    </>
                  )}
                </View>

                <Text
                  style={[
                    styles.themeName,
                    { color: colors.text },
                    selectedTheme === option.name && { color: colors.accent },
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {option.description}
                </Text>

                {selectedTheme === option.name && (
                  <View
                    style={[
                      styles.selectedBadge,
                      { backgroundColor: option.colors.primary },
                    ]}
                  >
                    <Text style={styles.selectedBadgeText}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TourStep>

      {/* Start Tour Button */}
      <TourStep
        id="start-themed-tour"
        order={2}
        title="Ready to See It!"
        intro="Tap the button to restart the tour with your selected theme. The new theme will be applied when you start a new tour from the settings."
      >
        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor:
                THEME_OPTIONS.find((t) => t.name === selectedTheme)?.colors
                  .primary || '#3498db',
            },
          ]}
          onPress={startTour}
          disabled={tour.isActive}
        >
          <Text style={styles.startButtonText}>
            {tour.isActive
              ? 'Tour in progress...'
              : `Start Tour with ${THEME_OPTIONS.find((t) => t.name === selectedTheme)?.label} Theme`}
          </Text>
        </TouchableOpacity>
      </TourStep>

      {/* Theme Details */}
      <View style={styles.detailsContainer}>
        <TourStep
          id="theme-features"
          order={3}
          title="Theme Features"
          intro="Each theme customizes the overlay, tooltip, buttons, progress bar, and hint indicators. You can also create custom themes!"
        >
          <View
            style={[styles.detailsCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              What Themes Customize
            </Text>
            <View style={styles.featureList}>
              <FeatureItem icon="O" label="Overlay color and opacity" />
              <FeatureItem
                icon="T"
                label="Tooltip styling (colors, shadows, borders)"
              />
              <FeatureItem icon="B" label="Button colors and shapes" />
              <FeatureItem icon="P" label="Progress bar appearance" />
              <FeatureItem icon="H" label="Hint indicator styling" />
            </View>
          </View>
        </TourStep>

        <TourStep
          id="custom-theme"
          order={4}
          title="Create Custom Themes"
          intro="Use createTheme() or mergeTheme() to build your own theme based on existing ones. Perfect for matching your brand!"
        >
          <View style={styles.codeCard}>
            <Text style={styles.codeTitle}>Custom Theme Example</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`import { createTheme } from '@decaylabs/react-native-intro';

const myTheme = createTheme('dark', {
  buttons: {
    primary: {
      backgroundColor: '#8b5cf6',
    },
  },
  tooltip: {
    borderRadius: 20,
  },
});`}
              </Text>
            </View>
          </View>
        </TourStep>
      </View>

      {/* Auto Theme Info */}
      <View
        style={[
          styles.infoContainer,
          isDark && { backgroundColor: '#1a3a4a', borderLeftColor: '#2196F3' },
        ]}
      >
        <Text style={[styles.infoTitle, isDark && { color: '#64B5F6' }]}>
          About Auto Theme
        </Text>
        <Text style={[styles.infoText, isDark && { color: '#90CAF9' }]}>
          The "auto" theme automatically switches between the classic (light)
          and dark themes based on your device's system setting. This ensures
          your onboarding experience matches your app's appearance mode.
        </Text>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  themeSelectorContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '47%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorSwatch: {
    flex: 1,
  },
  colorDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  autoPreview: {
    flex: 1,
    flexDirection: 'row',
  },
  autoHalf: {
    flex: 1,
  },
  autoLight: {
    backgroundColor: '#ffffff',
  },
  autoDark: {
    backgroundColor: '#1e1e1e',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  themeNameSelected: {
    color: '#007AFF',
  },
  themeDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  startButton: {
    margin: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
    gap: 16,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  featureLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  codeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#e0e0e0',
    lineHeight: 18,
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
