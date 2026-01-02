import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { IntroProvider } from 'react-native-intro';
import { BasicTourScreen } from './screens/BasicTourScreen';

export default function App() {
  return (
    <IntroProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <BasicTourScreen />
      </SafeAreaView>
    </IntroProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
