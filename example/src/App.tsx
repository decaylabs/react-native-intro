import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { IntroProvider } from 'react-native-intro';
import { BasicTourScreen } from './screens/BasicTourScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <IntroProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <BasicTourScreen />
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
});
