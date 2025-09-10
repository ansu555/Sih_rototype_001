import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { buildGroundwaterData, GroundwaterDataBundle, detectDepthAnomalies, StationAnomaly } from '@/data/groundwater';

interface GroundwaterContextValue extends GroundwaterDataBundle {
  anomalies: StationAnomaly[];
  refresh: () => void;
}

const GroundwaterContext = createContext<GroundwaterContextValue | undefined>(undefined);

export const GroundwaterProvider = ({ children }: { children: ReactNode }) => {
  const [bundle, setBundle] = useState<GroundwaterDataBundle>(() => buildGroundwaterData());
  const [anomalies, setAnomalies] = useState<StationAnomaly[]>([]);

  const refresh = () => {
    const next = buildGroundwaterData();
    setBundle(next);
  };

  useEffect(() => {
    setAnomalies(detectDepthAnomalies(bundle.stations));
  }, [bundle]);

  const value: GroundwaterContextValue = useMemo(() => ({
    ...bundle,
    anomalies,
    refresh,
  }), [bundle, anomalies]);

  return <GroundwaterContext.Provider value={value}>{children}</GroundwaterContext.Provider>;
};

export function useGroundwater() {
  const ctx = useContext(GroundwaterContext);
  if (!ctx) throw new Error('useGroundwater must be used within GroundwaterProvider');
  return ctx;
}
