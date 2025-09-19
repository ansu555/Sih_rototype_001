import { View, Text, StyleSheet } from 'react-native';
import TrendChart from '@/components/TrendChart';

export default function TrendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trend Analysis</Text>
      <View style={styles.chartContainer}>
        <TrendChart />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#004D99',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E4E7',
    padding: 18,
  },
});
