import { Text, View, StyleSheet } from 'react-native';
import { IntroProvider } from 'react-native-intro';

export default function App() {
  return (
    <IntroProvider>
      <View style={styles.container}>
        <Text>React Native Intro Example</Text>
      </View>
    </IntroProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
