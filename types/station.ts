export type StationStatus = 'safe' | 'semi-critical' | 'critical';

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depthMeters: number;
  status: StationStatus;
}
