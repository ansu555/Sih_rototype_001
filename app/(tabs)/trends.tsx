import { View, Text, StyleSheet } from 'react-native';

export default function TrendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trends Screen</Text>
      <Text>Content for groundwater trends will go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
