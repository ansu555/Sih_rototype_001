import React, { useMemo, useRef } from 'react';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';
import { useGroundwater } from '@/contexts/GroundwaterContext';
import { WEST_BENGAL_POLYGONS } from '@/data/westBengalGeo';

// Re-use existing styling palette from GISMap for coherence.

export default function DistrictMap() {
  const { districts, selectedDistrictId, setSelectedDistrictId, selectedDistrict } = useDistrictSelection();
  const { stations: gwStations } = useGroundwater();
  const mapRef = useRef<MapView>(null);

  const region = {
    latitude: 23.5,
    longitude: 87.3,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const districtPolygons = useMemo(() => districts, [districts]);

  // Filter stations based on selected district
  const visibleStations = useMemo(() => {
    if (!selectedDistrictId) return gwStations;
    const selected = districts.find(d => d.id === selectedDistrictId);
    if (!selected) return gwStations;
    return gwStations.filter(s => s.district === selected.name);
  }, [gwStations, selectedDistrictId, districts]);

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        zoomEnabled
        scrollEnabled
        minZoomLevel={1}
        maxZoomLevel={20}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
      >
        {/* Base West Bengal fill for context */}
        {WEST_BENGAL_POLYGONS.map((poly, i) => (
          <Polygon key={`wb-base-${i}`} coordinates={poly} strokeColor="transparent" fillColor="rgba(0,77,153,0.10)" zIndex={1} />
        ))}
        {/* District borders */}
        {districtPolygons.map(d => (
          <Polygon
            key={d.id}
            coordinates={d.polygons[0] || []}
            strokeColor={d.id === selectedDistrictId ? '#E0A100' : 'rgba(0,0,0,0.45)'}
            strokeWidth={d.id === selectedDistrictId ? 3 : 1}
            fillColor={d.id === selectedDistrictId ? 'rgba(255,193,7,0.25)' : 'rgba(0,0,0,0.0)'}
            tappable
            onPress={() => setSelectedDistrictId(d.id === selectedDistrictId ? null : d.id)}
            zIndex={d.id === selectedDistrictId ? 3 : 2}
          />
        ))}
        {/* Station markers */}
        {visibleStations.map(s => {
          const getMarkerColor = (depth: number) => {
            if (depth < 10) return '#2e8b57'; // Green for safe
            if (depth < 20) return '#ffcc00'; // Yellow for semi-critical
            return '#ff4500'; // Red for critical
          };
          
          return (
            <Marker 
              key={s.stationCode} 
              coordinate={{ latitude: s.latitude, longitude: s.longitude }} 
              onPress={() => {
                const status = s.latestDepth < 10 ? 'Safe' : s.latestDepth < 20 ? 'Semi-Critical' : 'Critical';
                alert(`Station Details:\n\nName: ${s.name}\nStation Code: ${s.stationCode}\nDepth: ${s.latestDepth.toFixed(1)} m\nDistrict: ${s.district}\nStatus: ${status}\nCoordinates: ${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`);
              }}
            >
              <View style={[styles.stationDot, { backgroundColor: getMarkerColor(s.latestDepth) }]} />
            </Marker>
          );
        })}
      </MapView>
      {selectedDistrict && (
        <View style={styles.fabBox} pointerEvents="none">
          <Text style={styles.fabTitle}>{selectedDistrict.name}</Text>
          <Text style={styles.fabMeta}>{selectedDistrict.polygons.length} ring(s)</Text>
        </View>
      )}
      {districts.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>Add district GeoJSON data to enable borders.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 380, borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8', margin: 16 },
  fabBox: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,77,153,0.95)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  fabTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fabMeta: { color: '#E8F2FF', fontSize: 12, marginTop: 2 },
  emptyOverlay: { position: 'absolute', top: 0, left:0, right:0, bottom:0, justifyContent: 'center', alignItems:'center', padding: 20 },
  emptyText: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, fontSize: 14, color: '#333' },
  marker: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#004D99' },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  stationDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
});
