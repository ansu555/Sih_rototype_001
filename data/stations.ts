import { Station } from '@/types/station';

export const sampleStations: Station[] = [
  { id: 'S1', name: 'Station A', latitude: 19.07, longitude: 72.87, depthMeters: 5.2, status: 'safe' },
  { id: 'S2', name: 'Station B', latitude: 19.17, longitude: 72.99, depthMeters: 12.4, status: 'semi-critical' },
  { id: 'S3', name: 'Station C', latitude: 18.98, longitude: 72.81, depthMeters: 27.8, status: 'critical' },
  { id: 'S4', name: 'Station D', latitude: 19.12, longitude: 73.05, depthMeters: 9.1, status: 'safe' },
];
