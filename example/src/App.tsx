import { useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { IntroProvider } from 'react-native-intro';
import { BasicTourScreen } from './screens/BasicTourScreen';
import { HintsScreen } from './screens/HintsScreen';

type TabName = 'tours' | 'hints';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('tours');

  return (
    <SafeAreaProvider>
      <IntroProvider>
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
