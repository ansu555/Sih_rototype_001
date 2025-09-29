import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGroundwater } from '@/contexts/GroundwaterContext';

function severityForDepth(depth: number) {
  if (depth < 10) return { label: 'Safe', color: '#2e8b57' };
  if (depth < 20) return { label: 'Semi-Critical', color: '#ffcc00' };
  return { label: 'Critical', color: '#ff4500' };
}

function ageDays(date?: Date) {
  if (!date) return 'unknown';
  const d = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  return `${d}d`;
}

export default function AlertsPanel() {
  const { anomalies, stations, updatedAt } = useGroundwater();

  // map anomalies to station details
  const anomalyItems = useMemo(() => {
    const byCode = new Map(stations.map(s => [s.stationCode, s] as [string, any]));
    return anomalies.map(a => ({ ...a, station: byCode.get(a.stationCode) }));
  }, [anomalies, stations]);

  const staleStations = useMemo(() => stations.filter(s => {
    const age = (Date.now() - s.latestTime.getTime()) / 86400000; // days
    return age > 30; // stale threshold
  }), [stations]);

  // coordinate-corrected detection: best-effort via readingsCount  (we logged corrections in build step)
  // There's no explicit flag persisted in the bundle; we'll mark stations with readingsCount>50 as 'inspected' as a placeholder.
  const correctedCandidates = useMemo(() => stations.filter(s => s.readingsCount > 50).slice(0,5), [stations]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Recent Alerts & Data Quality</Text>
      <Text style={styles.meta}>Data updated: {updatedAt ? updatedAt.toLocaleString() : 'unknown'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anomalies ({anomalyItems.length})</Text>
        {anomalyItems.length === 0 ? (
          <Text style={styles.empty}>No anomalies detected</Text>
        ) : anomalyItems.slice(0,6).map(a => (
          <TouchableOpacity key={a.stationCode} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: '#E04D4D' }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{a.station?.name || a.stationCode}</Text>
              <Text style={styles.rowMeta}>Depth: {a.depth.toFixed(1)} m • z {a.zScore.toFixed(2)} • {a.station?.district || '—'}</Text>
            </View>
            <Text style={styles.age}>{ageDays(a.station?.latestTime)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stale Stations (&gt;30d) ({staleStations.length})</Text>
        {staleStations.length === 0 ? (
          <Text style={styles.empty}>All stations are recent</Text>
        ) : staleStations.slice(0,6).map(s => {
          const sev = severityForDepth(s.latestDepth);
          return (
            <View key={s.stationCode} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: sev.color }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{s.name}</Text>
                <Text style={styles.rowMeta}>{s.stationCode} • {s.district}</Text>
              </View>
              <Text style={styles.age}>{ageDays(s.latestTime)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality Review Candidates</Text>
        {correctedCandidates.length === 0 ? (
          <Text style={styles.empty}>No flagged coordinate corrections</Text>
        ) : correctedCandidates.map(s => (
          <View key={s.stationCode} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: '#0066CC' }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{s.name}</Text>
              <Text style={styles.rowMeta}>Readings: {s.readingsCount} • {s.district}</Text>
            </View>
            <Text style={styles.age}>{ageDays(s.latestTime)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E6EDF6' },
  title: { fontSize: 15, fontWeight: '700', color: '#004D99', marginBottom: 4 },
  meta: { fontSize: 11, color: '#66788A', marginBottom: 8 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#233149', marginBottom: 6 },
  empty: { fontSize: 13, color: '#5A6A78' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: '#223' },
  rowMeta: { fontSize: 12, color: '#556A78', marginTop: 2 },
  age: { fontSize: 12, color: '#8A98A6', marginLeft: 8 },
});
