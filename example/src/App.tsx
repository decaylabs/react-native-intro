import { useState, useMemo } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  IntroProvider,
  type TourOptions,
  type ThemeName,
} from 'react-native-intro';
import { BasicTourScreen } from './screens/BasicTourScreen';
import { HintsScreen } from './screens/HintsScreen';
import { ThemesScreen } from './screens/ThemesScreen';

type TabName = 'tours' | 'hints' | 'themes';

// Tab bar height (paddingVertical * 2 + icon + label + margins)
const TAB_BAR_HEIGHT = 70;

// Color schemes for light and dark modes
const Colors = {
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#007AFF',
    tabActiveBackground: '#f0f8ff',
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    border: '#333333',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    accent: '#0a84ff',
    tabActiveBackground: '#2c2c2e',
  },
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabName>('tours');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('auto');
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Configure scroll padding to account for tab bar
  const tourOptions: TourOptions = useMemo(
    () => ({
      scrollPadding: {
        top: 50,
        bottom: TAB_BAR_HEIGHT + insets.bottom,
      },
    }),
    [insets.bottom]
  );

  return (
    <IntroProvider defaultTourOptions={tourOptions} theme={selectedTheme}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Screen Content */}
        <View style={styles.content}>
          {activeTab === 'tours' && <BasicTourScreen isDark={isDark} />}
          {activeTab === 'hints' && <HintsScreen isDark={isDark} />}
          {activeTab === 'themes' && (
            <ThemesScreen
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
              isDark={isDark}
            />
          )}
        </View>

        {/* Tab Bar */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'tours' && {
                backgroundColor: colors.tabActiveBackground,
              },
            ]}
            onPress={() => setActiveTab('tours')}
          >
            <Text style={styles.tabIcon}>🎯</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textSecondary },
                activeTab === 'tours' && { color: colors.accent },
              ]}
            >
              Tours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'hints' && {
                backgroundColor: colors.tabActiveBackground,
              },
            ]}
            onPress={() => setActiveTab('hints')}
          >
            <Text style={styles.tabIcon}>💡</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textSecondary },
                activeTab === 'hints' && { color: colors.accent },
              ]}
            >
              Hints
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'themes' && {
                backgroundColor: colors.tabActiveBackground,
              },
            ]}
            onPress={() => setActiveTab('themes')}
          >
            <Text style={styles.tabIcon}>🎨</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textSecondary },
                activeTab === 'themes' && { color: colors.accent },
              ]}
            >
              Themes
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </IntroProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
