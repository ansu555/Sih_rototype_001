import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 68.0],
  [37.5, 97.5],
];

export type StationStatus = 'safe' | 'semi-critical' | 'critical';

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depthMeters: number;
  status: StationStatus;
}

export const STATUS_COLOR: Record<StationStatus, string> = {
  safe: '#1B8F2A',
  'semi-critical': '#E2A400',
  critical: '#C62828',
};

export function InvalidateOnResize() {
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
export function SetMaxBounds({
  bounds,
  viscosity,
}: {
  bounds: [[number, number], [number, number]];
  viscosity: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(bounds);
    // @ts-ignore: maxBoundsViscosity is not on the TS MapOptions
    map.options.maxBoundsViscosity = viscosity;
  }, [map, bounds, viscosity]);
  return null;
}
