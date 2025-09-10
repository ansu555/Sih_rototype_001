import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';

export default function DistrictsScreen() {
  const { districts, selectedDistrictId, setSelectedDistrictId, refresh } = useDistrictSelection();
  const [query, setQuery] = useState('');

  useFocusEffect(() => { refresh(); });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
  }, [query, districts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>West Bengal Districts</Text>
      <TextInput
        placeholder="Search district..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        autoCorrect={false}
      />
      {districts.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No district geometry data loaded</Text>
          <Text style={styles.emptyText}>Add features to india-districts-2019-734.json with DISTRICT & ST_NM for West Bengal to enable borders.</Text>
        </View>
      )}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const active = item.id === selectedDistrictId;
          return (
            <TouchableOpacity style={[styles.row, active && styles.rowActive]} onPress={() => setSelectedDistrictId(active ? null : item.id)}>
              <View style={styles.rowHeader}> 
                <Text style={styles.rowName}>{item.name}</Text>
                {active && <Text style={styles.badge}>Selected</Text>}
              </View>
              <Text style={styles.rowMeta}>{item.state}</Text>
              <Text style={styles.rowMetaSmall}>{item.polygons.length} ring(s)</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4, color: '#002B55' },
  input: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#d0d7de' },
  row: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width:0, height:2 }, shadowRadius: 4, elevation: 2 },
  rowActive: { borderWidth: 2, borderColor: '#004D99' },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowName: { fontSize: 16, fontWeight: '600', color: '#003A73' },
  rowMeta: { fontSize: 13, color: '#555', marginTop: 4 },
  rowMetaSmall: { fontSize: 12, color: '#777', marginTop: 2 },
  badge: { backgroundColor: '#004D99', color: '#fff', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  emptyBox: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#d0d7de' },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#555' },
});
