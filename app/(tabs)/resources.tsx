import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useGroundwater } from '@/contexts/GroundwaterContext';

export default function ResourcesScreen() {
  const { districtSummaries, updatedAt } = useGroundwater();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>District Groundwater Summary</Text>
      <Text style={styles.subtitle}>Updated: {updatedAt.toLocaleString()}</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.head]}>District</Text>
        <Text style={[styles.cell, styles.head]}>Stations</Text>
        <Text style={[styles.cell, styles.head]}>Avg Depth (m)</Text>
        <Text style={[styles.cell, styles.head]}>Latest</Text>
      </View>
      <FlatList
        data={districtSummaries}
        keyExtractor={item => item.district}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.cell, styles.name]}>{item.district}</Text>
            <Text style={styles.cell}>{item.stationCount}</Text>
            <Text style={styles.cell}>{item.avgDepth?.toFixed(2) ?? '-'}</Text>
            <Text style={styles.cell}>{item.latestMeasurementTime ? new Date(item.latestMeasurementTime).toLocaleDateString() : '-'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 16 }}>No groundwater data loaded.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#555' },
  headerRow: { flexDirection: 'row', backgroundColor: '#004D99', paddingVertical: 6, borderRadius: 6 },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  cell: { flex: 1, fontSize: 12, color: '#222', paddingHorizontal: 4 },
  head: { color: '#fff', fontWeight: '600' },
  name: { fontWeight: '600' },
});
