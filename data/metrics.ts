export interface Metric {
  key: string;
  label: string;
  value: string;
  trend: string; // e.g. +4, -0.6
  highlight?: boolean;
}

export const metrics: Metric[] = [
  { key: 'activeSensors', label: 'Active Sensors', value: '128', trend: '+4' },
  { key: 'avgDepth', label: 'Avg Depth (m)', value: '23.4', trend: '-0.6' },
  { key: 'alerts', label: 'Alerts', value: '5', trend: '+2', highlight: true },
  { key: 'rechargeSites', label: 'Recharge Sites', value: '42', trend: '+1' },
];
