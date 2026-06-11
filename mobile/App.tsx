import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        🎯 FidélisationPro
      </Text>
      <Text style={{ color: '#EAB308', marginTop: 10 }}>
        App Mobile prête !
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
  },
});