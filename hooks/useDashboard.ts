import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Station } from '@/types/station';
import { sampleStations } from '@/data/stations';
import { useGroundwater } from '@/contexts/GroundwaterContext';

export function useDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { stations: gwStations } = useGroundwater();

  const toggleMenu = useCallback(() => setMenuOpen(o => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const onLogout = useCallback(() => { router.replace('/'); }, [router]);

  // Convert groundwater stations to Station format for compatibility
  const stationData: Station[] = useMemo(() => {
    return gwStations.map(s => ({
      id: s.stationCode,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      depthMeters: s.latestDepth,
      status: s.latestDepth < 10 ? 'safe' : s.latestDepth < 20 ? 'semi-critical' : 'critical',
      district: s.district // Include district information
    } as Station & { district: string }));
  }, [gwStations]);

  const metricData = useMemo(() => {
    const total = stationData.length;
    const avgDepth = total ? stationData.reduce((s, st) => s + st.depthMeters, 0) / total : 0;
    const critical = stationData.filter(s => s.status === 'critical').length;
    const semi = stationData.filter(s => s.status === 'semi-critical').length;
    const safe = stationData.filter(s => s.status === 'safe').length;
    // Simple placeholder trend logic: show +N for critical if any, -N for safe improvement etc.
    return [
      { key: 'activeSensors', label: 'Active Sensors', value: String(total), trend: total ? '+0' : '0' },
      { key: 'avgDepth', label: 'Avg Depth (m)', value: avgDepth.toFixed(1), trend: '\u00b10.0' },
      { key: 'criticalSites', label: 'Critical Sites', value: String(critical), trend: critical ? '+0' : '0', highlight: critical > 0 },
      { key: 'semiCritical', label: 'Semi-Critical', value: String(semi), trend: semi ? '+0' : '0' },
      { key: 'safeSites', label: 'Safe Sites', value: String(safe), trend: safe ? '+0' : '0' },
    ];
  }, [stationData]);

  const summary = useMemo(() => ({
    sensorCount: metricData.find(m => m.key === 'activeSensors')?.value,
    alertCount: metricData.find(m => m.key === 'alerts')?.value,
  }), [metricData]);

  return {
    state: { menuOpen, stationData, metricData, summary },
    actions: { toggleMenu, closeMenu, onLogout },
  };
}
