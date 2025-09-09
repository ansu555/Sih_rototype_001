import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Station } from '@/types/station';
import { sampleStations } from '@/data/stations';
import { metrics } from '../data/metrics';

export function useDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = useCallback(() => setMenuOpen(o => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const onLogout = useCallback(() => { router.replace('/'); }, [router]);

  const stationData: Station[] = sampleStations;
  const metricData = metrics;

  const summary = useMemo(() => ({
    sensorCount: metricData.find(m => m.key === 'activeSensors')?.value,
    alertCount: metricData.find(m => m.key === 'alerts')?.value,
  }), [metricData]);

  return {
    state: { menuOpen, stationData, metricData, summary },
    actions: { toggleMenu, closeMenu, onLogout },
  };
}
