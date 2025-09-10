import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGroundwater } from '@/contexts/GroundwaterContext';

export default function GroundwaterScreen() {
	const { stations, anomalies, updatedAt } = useGroundwater();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Groundwater Stations</Text>
			<Text style={styles.subtitle}>Latest update: {updatedAt.toLocaleString()}</Text>
			<FlatList
				data={stations}
				keyExtractor={item => item.stationCode}
				renderItem={({ item }) => (
					<View style={styles.row}>
						<View style={{ flex: 1 }}>
							<Text style={styles.name}>{item.name}</Text>
							<Text style={styles.meta}>{item.district} • {item.latestTime.toLocaleDateString()}</Text>
						</View>
						<Text style={styles.depth}>{item.latestDepth.toFixed(2)} m</Text>
					</View>
				)}
				ListEmptyComponent={<Text style={{ padding: 16 }}>No station data.</Text>}
			/>
			{anomalies.length > 0 && (
				<View style={styles.anomalyBox}>
					<Text style={styles.anomalyTitle}>Anomalies ({anomalies.length})</Text>
					{anomalies.slice(0,5).map(a => (
						<Text key={a.stationCode} style={styles.anomalyItem}>{a.stationCode} z={a.zScore.toFixed(2)}</Text>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
	subtitle: { fontSize: 12, color: '#555', marginBottom: 12 },
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
	name: { fontSize: 14, fontWeight: '600', color: '#222' },
	meta: { fontSize: 11, color: '#666', marginTop: 2 },
	depth: { fontSize: 13, fontWeight: '600', color: '#004D99' },
	anomalyBox: { marginTop: 12, padding: 12, backgroundColor: '#FFF4E0', borderRadius: 8 },
	anomalyTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4, color: '#B25C00' },
	anomalyItem: { fontSize: 11, color: '#B25C00' }
});

