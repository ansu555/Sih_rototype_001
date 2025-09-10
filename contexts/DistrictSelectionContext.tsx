import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { DistrictShape, WEST_BENGAL_DISTRICTS, loadWestBengalDistricts } from '@/data/districts';

interface DistrictSelectionContextValue {
  districts: DistrictShape[];               // currently loaded districts (WB subset for now)
  selectedDistrictId: string | null;
  setSelectedDistrictId: (id: string | null) => void;
  selectedDistrict: DistrictShape | undefined;
  refresh: () => void;                      // reload in case data file updated (dev convenience)
}

const DistrictSelectionContext = createContext<DistrictSelectionContextValue | undefined>(undefined);

export const DistrictSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [districts, setDistricts] = useState<DistrictShape[]>(WEST_BENGAL_DISTRICTS);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  const refresh = () => setDistricts(loadWestBengalDistricts());

  const value = useMemo(() => ({
    districts,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedDistrict: districts.find(d => d.id === selectedDistrictId),
    refresh,
  }), [districts, selectedDistrictId]);

  return <DistrictSelectionContext.Provider value={value}>{children}</DistrictSelectionContext.Provider>;
};

export function useDistrictSelection() {
  const ctx = useContext(DistrictSelectionContext);
  if (!ctx) throw new Error('useDistrictSelection must be used within DistrictSelectionProvider');
  return ctx;
}
