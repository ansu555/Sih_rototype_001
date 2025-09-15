import React, { useRef, useState, useMemo } from 'react';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WEST_BENGAL_POLYGONS } from '../data/westBengalGeo';
import { WEST_BENGAL_DISTRICTS } from '../data/districts';
import { INDIA_OUTLINE_POLYGONS, INDIA_BORDER_POLYGONS } from '../data/indiaOutline';
import { INTERNATIONAL_BORDER_LINES } from '../data/indiaInternationalBorder';
import { useDistrictSelection } from '../contexts/DistrictSelectionContext';
import { useGroundwater } from '@/contexts/GroundwaterContext';
import DataPanel from './DataPanel';

interface Station { id: string; name: string; latitude: number; longitude: number; depthMeters: number; }

const desaturatedStyle = [
  { elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 10 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ saturation: -100 }, { lightness: 40 }] },
  { featureType: 'water', stylers: [{ color: '#b3cde0' }] },
];

interface GISMapProps {
  stations: Station[];
  height?: number;              // explicit height when not fullscreen
  fullscreen?: boolean;         // if true, render in fullscreen mode (layout handled by parent)
  onToggleFullscreen?: () => void; // toggle callback
}

export default function GISMap({ stations, height = 320, fullscreen = false, onToggleFullscreen }: GISMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [dataPanelVisible, setDataPanelVisible] = useState(false);
  const { selectedDistrictId, setSelectedDistrictId } = useDistrictSelection();
  const { districtSummaries, stations: gwStations } = useGroundwater();

  // Build lookup of avgDepth per district for coloring.
  const districtDepthMap = useMemo(() => {
    const map: Record<string, number> = {};
    districtSummaries.forEach(d => { if (d.avgDepth != null) map[d.district] = d.avgDepth; });
    return map;
  }, [districtSummaries]);

  // Color scale (shallower depth = greener, deeper = redder). Determine min/max.
  const depthRange = useMemo(() => {
    const depths = Object.values(districtDepthMap);
    if (!depths.length) return { min: 0, max: 1 };
    return { min: Math.min(...depths), max: Math.max(...depths) };
  }, [districtDepthMap]);

  function depthToColor(d?: number): string {
    if (d == null) return 'rgba(0,0,0,0.05)';
    const { min, max } = depthRange;
    const t = max === min ? 0.5 : (d - min) / (max - min);
    // interpolate green (good) to red (deep)
    const r = Math.round(255 * t);
    const g = Math.round(180 * (1 - t));
    const b = 60;
    return `rgba(${r},${g},${b},0.35)`;
  }

  // Merge passed stations with real groundwater latest if caller provides empty.
  const markerStations: Station[] = useMemo(() => {
    const base = stations.length ? stations : gwStations.map(s => ({
      id: s.stationCode,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      depthMeters: s.latestDepth,
      district: s.district,
    } as any));
    if (!selectedDistrictId) return base as Station[];
    // Find district name from id
    const selected = WEST_BENGAL_DISTRICTS.find(d => d.id === selectedDistrictId);
    if (!selected) return base as Station[];
    const districtName = selected.name;
    return base.filter((s: any) => s.district === districtName) as Station[];
  }, [stations, gwStations, selectedDistrictId]);

  // Override initial region to West Bengal for now
  const region = {
    latitude: 23.5,      // center of West Bengal
    longitude: 87.3,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const handleZoomIn = () => {
    mapRef.current?.getCamera().then(camera => {
      mapRef.current?.animateCamera({
        center: camera.center,
        zoom: Math.min(camera.zoom + 1, 20), // Max zoom level 20
      });
    });
  };

  const handleZoomOut = () => {
    mapRef.current?.getCamera().then(camera => {
      mapRef.current?.animateCamera({
        center: camera.center,
        zoom: Math.max(camera.zoom - 1, 1), // Min zoom level 1
      });
    });
  };

  return (
    <View style={[styles.wrapper, fullscreen ? styles.fullscreenWrapper : { height }] }>
      <MapView 
        ref={mapRef}
        style={StyleSheet.absoluteFill} 
        initialRegion={region}
        zoomEnabled={true}
        scrollEnabled={true}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        customMapStyle={mapType === 'standard' ? desaturatedStyle : undefined}
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
        {INDIA_OUTLINE_POLYGONS.map((poly, idx) => (
          <Polygon
            key={`india-${idx}`}
            coordinates={poly}
            strokeColor="rgba(0,0,0,0.25)"
            strokeWidth={1}
            fillColor="rgba(0,0,0,0.03)"
            zIndex={1}
          />
        ))}
        {INDIA_BORDER_POLYGONS.slice(0,1).map((poly, idx) => (
          <Polygon
            key={`india-border-${idx}`}
            coordinates={poly}
            strokeColor="#222"
            strokeWidth={2}
            fillColor="transparent"
            zIndex={1}
          />
        ))}
        {INTERNATIONAL_BORDER_LINES.map(seg => (
          <Polyline
            key={seg.id}
            coordinates={seg.coordinates}
            strokeColor="#000"
            strokeWidth={.5}
            zIndex={3}
          />
        ))}
        {WEST_BENGAL_POLYGONS.map((poly, idx) => (
            <Polygon
            key={`wb-${idx}`}
             coordinates={poly}
             strokeColor="#004D99"
             strokeWidth={2}
             fillColor="rgba(0,77,153,0.18)"
             zIndex={2}
            />
          ))}
        {/* District borders for West Bengal */}
        {WEST_BENGAL_DISTRICTS.map(d => {
          const isSelected = selectedDistrictId === d.id;
          const avg = districtDepthMap[d.name];
          return (
            <Polygon
              key={`district-${d.id}`}
              coordinates={d.polygons[0] || []}
              strokeColor={isSelected ? '#E0A100' : 'rgba(0,0,0,0.6)'}
              strokeWidth={isSelected ? 3 : 1}
              fillColor={isSelected ? 'rgba(255,193,7,0.3)' : depthToColor(avg)}
              tappable
              onPress={() => setSelectedDistrictId(isSelected ? null : d.id)}
              zIndex={isSelected ? 5 : 3}
            />
          );
        })}
        {markerStations.map(s => {
          // Determine marker color based on depth
          const getMarkerColor = (depth: number) => {
            if (depth < 10) return '#2e8b57'; // Green for safe
            if (depth < 20) return '#ffcc00'; // Yellow for semi-critical
            return '#ff4500'; // Red for critical
          };
          
          return (
            <Marker 
              key={s.id} 
              coordinate={{ latitude: s.latitude, longitude: s.longitude }} 
              onPress={() => {
                // Show detailed station information
                const stationWithDistrict = s as any;
                const districtName = stationWithDistrict.district || 'Unknown District';
                const status = s.depthMeters < 10 ? 'Safe' : s.depthMeters < 20 ? 'Semi-Critical' : 'Critical';
                
                alert(`Station Details:\n\nName: ${s.name}\nStation Code: ${s.id}\nDepth: ${s.depthMeters.toFixed(1)} m\nDistrict: ${districtName}\nStatus: ${status}\nCoordinates: ${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`);
              }}
            >
              <View style={[styles.stationDot, { backgroundColor: getMarkerColor(s.depthMeters) }]} />
            </Marker>
          );
        })}
      </MapView>
      <View style={styles.legendBox}>
        <Text style={styles.legendTitle}>District Avg Depth</Text>
        <View style={styles.gradientBar}>
          <View style={[styles.gradientSegment,{ backgroundColor:'#2e8b57'}]} />
          <View style={[styles.gradientSegment,{ backgroundColor:'#9acb50'}]} />
          <View style={[styles.gradientSegment,{ backgroundColor:'#ffcc00'}]} />
          <View style={[styles.gradientSegment,{ backgroundColor:'#ff8c00'}]} />
          <View style={[styles.gradientSegment,{ backgroundColor:'#ff4500'}]} />
        </View>
        <View style={styles.legendLabels}>
          <Text style={styles.legendLabel}>{depthRange.min.toFixed(1)}</Text>
          <Text style={styles.legendLabel}>{depthRange.max.toFixed(1)} m</Text>
        </View>
      </View>
      <View style={styles.stationLegendBox}>
        <Text style={styles.legendTitle}>Station Status</Text>
        <View style={styles.stationLegendItems}>
          <View style={styles.stationLegendItem}>
            <View style={[styles.stationLegendDot, { backgroundColor: '#2e8b57' }]} />
            <Text style={styles.stationLegendText}>Safe (&lt;10m)</Text>
          </View>
          <View style={styles.stationLegendItem}>
            <View style={[styles.stationLegendDot, { backgroundColor: '#ffcc00' }]} />
            <Text style={styles.stationLegendText}>Semi-Critical (10-20m)</Text>
          </View>
          <View style={styles.stationLegendItem}>
            <View style={[styles.stationLegendDot, { backgroundColor: '#ff4500' }]} />
            <Text style={styles.stationLegendText}>Critical (&gt;20m)</Text>
          </View>
        </View>
      </View>
      <View style={[styles.topBar, fullscreen && styles.topBarFullscreen]}> 
        <TouchableOpacity onPress={onToggleFullscreen} style={styles.fullBtn} accessibilityRole="button" accessibilityLabel={fullscreen ? 'Exit fullscreen map' : 'Enter fullscreen map'}>
          <Text style={styles.fullBtnText}>{fullscreen ? '×' : '⛶'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapTypeBar}>
        {(['standard','satellite','terrain','hybrid'] as MapType[]).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, mapType === type && styles.typeButtonActive]}
            onPress={() => setMapType(type)}
          >
            <Text style={[styles.typeText, mapType === type && styles.typeTextActive]}>
              {type.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.dataBtn}
          onPress={() => setDataPanelVisible(true)}
        >
          <Text style={styles.dataBtnText}>📊</Text>
        </TouchableOpacity>
      </View>
      <DataPanel 
        visible={dataPanelVisible}
        onClose={() => setDataPanelVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8', width: '100%', alignSelf: 'stretch' },
  fullscreenWrapper: { borderRadius: 0, flex: 1, width: '100%', height: '100%' },
  marker: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#004D99' },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  stationDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
  zoomControls: { position: 'absolute', bottom: 16, right: 8, gap: 8 },
  zoomButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  zoomButtonText: { fontSize: 20, fontWeight: 'bold', color: '#004D99' },
  mapTypeBar: { position: 'absolute', top: 12, right: 8, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4, gap: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.15, shadowRadius: 3 },
  typeButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#004D99' },
  typeText: { fontSize: 12, fontWeight: '600', color: '#004D99' },
  typeTextActive: { color: '#fff' },
  topBar: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', zIndex: 10 },
  topBarFullscreen: { top: 20 },
  fullBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fullBtnText: { fontSize: 20, fontWeight: '700', color: '#004D99' },
  legendBox: { position: 'absolute', bottom: 16, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8, width: 140 },
  stationLegendBox: { position: 'absolute', bottom: 16, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8, width: 160 },
  legendTitle: { fontSize: 12, fontWeight: '700', color: '#222', marginBottom: 4 },
  gradientBar: { height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row' },
  gradientSegment: { flex: 1 },
  legendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  legendLabel: { fontSize: 10, color: '#222' },
  stationLegendItems: { gap: 4 },
  stationLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stationLegendDot: { width: 12, height: 12, borderRadius: 6 },
  stationLegendText: { fontSize: 10, color: '#222', flex: 1 },
  dataBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0A100' },
  dataBtnText: { fontSize: 16 },
});
