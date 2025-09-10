import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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
  return (
    <View style={[styles.wrapper, { height }] }>
      <MapContainer
        style={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
