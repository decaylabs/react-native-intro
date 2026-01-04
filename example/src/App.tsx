import { useState, useMemo } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { IntroProvider, type TourOptions } from 'react-native-intro';
import { BasicTourScreen } from './screens/BasicTourScreen';
import { HintsScreen } from './screens/HintsScreen';

type TabName = 'tours' | 'hints';

// Tab bar height (paddingVertical * 2 + icon + label + margins)
const TAB_BAR_HEIGHT = 70;

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabName>('tours');
  const insets = useSafeAreaInsets();

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
    <IntroProvider defaultTourOptions={tourOptions}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Screen Content */}
        <View style={styles.content}>
          {activeTab === 'tours' && <BasicTourScreen />}
          {activeTab === 'hints' && <HintsScreen />}
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tours' && styles.tabActive]}
            onPress={() => setActiveTab('tours')}
          >
            <Text style={styles.tabIcon}>🎯</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'tours' && styles.tabLabelActive,
              ]}
            >
              Tours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'hints' && styles.tabActive]}
            onPress={() => setActiveTab('hints')}
          >
            <Text style={styles.tabIcon}>💡</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'hints' && styles.tabLabelActive,
              ]}
            >
              Hints
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#f0f8ff',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
