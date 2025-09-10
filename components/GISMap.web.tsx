import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from 'react-leaflet';
import wbDistricts from '../assets/data/wb_districts.geojson';
import 'leaflet/dist/leaflet.css';

export type StationStatus = 'safe' | 'semi-critical' | 'critical';

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depthMeters: number;
  status: StationStatus;
}

const STATUS_COLOR: Record<StationStatus, string> = {
  safe: '#1B8F2A',
  'semi-critical': '#E2A400',
  critical: '#C62828',
};


function InvalidateOnResize() {
  const map = useMap();
  const timeout = useRef<number | null>(null);
  useEffect(() => {
    const handler = () => {
      if (timeout.current) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => map.invalidateSize(), 150);
    };
    window.addEventListener('resize', handler);
    handler();
    return () => {
      if (timeout.current) window.clearTimeout(timeout.current);
      window.removeEventListener('resize', handler);
    };
  }, [map]);
  return null;
}

export default function GISMap({ stations, height = 260 }: { stations: Station[]; height?: number }) {
  const wbLayerRef = useRef<any>(null);
  function FitToBounds() {
    const map = useMap();
    useEffect(() => {
      const layer: any = wbLayerRef.current;
      const bounds = layer?.getBounds?.();
      if (bounds) {
        map.fitBounds(bounds, { padding: [12, 12] });
      }
    }, [map]);
    return null;
  }

  return (
    <View style={[styles.wrapper, { height }] }>
      <MapContainer
        style={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* West Bengal district borders (GeoJSON) */}
        {/** Type cast used to satisfy TS for react-leaflet GeoJSON style prop */}
        {/** Replace the asset file with real WB districts GeoJSON to see borders */}
        <GeoJSON ref={wbLayerRef} {...({
          data: wbDistricts,
          style: {
            color: '#1E3A8A',
            weight: 1,
            fillOpacity: 0,
          },
        } as any)} />
        <FitToBounds />
        {stations.map(s => (
          <CircleMarker 
            key={s.id} 
            center={[s.latitude, s.longitude]} 
            pathOptions={{ 
              color: '#000', 
              weight: 1,
              fillColor: STATUS_COLOR[s.status], 
              fillOpacity: 0.9 
            }}
          >
            <Popup>
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div>Depth: {s.depthMeters} m</div>
              <div>Status: {s.status}</div>
            </Popup>
          </CircleMarker>
        ))}
        <InvalidateOnResize />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8' },
  map: { width: '100%', height: '100%' },
});
