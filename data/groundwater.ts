// Groundwater data loading and aggregation.
// Static JSON imports (add more as needed)
// @ts-ignore
import bankuraRaw from '../assets/data/GWL/Bankura/GWATERLVL (1).json';
// @ts-ignore
import barddhamanRaw from '../assets/data/GWL/Barddhaman/GWATERLVL (1).json';
// @ts-ignore
import birbhumRaw from '../assets/data/GWL/Birbhum/GWATERLVL.json';
// @ts-ignore
import coochBeharRaw from '../assets/data/GWL/Cooch Behar/GWATERLVL.json';
// @ts-ignore
import nadiaRaw from '../assets/data/GWL/Nadia/GWATERLVL.json';
// Dynamically imports JSON files placed under assets/data/GWL/<DistrictName>/GWATERLVL*.json
// Each file contains an array of readings (multiple timestamps per stationCode).

// (No platform-specific logic yet)

export interface GroundwaterReading {
  stationCode: string;
  stationName: string;
  stationType?: string;
  latitude: number;
  longitude: number;
  agencyName?: string;
  state: string;
  district: string; // uppercase in sample (e.g., BANKURA)
  dataAcquisitionMode?: string;
  stationStatus?: string;
  datatypeCode?: string;
  description?: string;
  dataValue: number;          // depth below ground level (m)
  dataTime: {
    year: number; monthValue: number; month: string; dayOfMonth: number;
    dayOfYear: number; dayOfWeek: string; hour: number; minute: number; second: number; nano: number;
  };
  unit?: string; // 'm'
  wellType?: string | null;
  wellDepth?: number | null;
  [k: string]: any;
}

export interface GroundwaterStationLatest {
  stationCode: string;
  name: string;
  latitude: number;
  longitude: number;
  district: string;  // normalized (Title Case for matching polygons)
  state: string;
  latestDepth: number;   // dataValue of latest reading
  latestTime: Date;      // constructed from dataTime
  acquisition: string | undefined;
  status: string | undefined;
  readingsCount: number;
}

export interface DistrictGroundwaterSummary {
  district: string;    // Title Case to match district shape names
  state: string;
  stationCount: number;
  avgDepth: number | null; // average of latest depths
  latestMeasurementTime: Date | null; // max latestTime among stations
  minDepth: number | null;
  maxDepth: number | null;
}

// Utility to convert dataset district value (e.g., 'BANKURA') to 'Bankura'
function normalizeDistrictName(name: string): string {
  if (!name) return name;
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function toDate(t: GroundwaterReading['dataTime']): Date {
  return new Date(Date.UTC(t.year, t.monthValue - 1, t.dayOfMonth, t.hour, t.minute, t.second));
}


const RAW_GROUPS: any[] = [bankuraRaw, barddhamanRaw, birbhumRaw, coochBeharRaw, nadiaRaw];

function loadDistrictReadingsRaw(): GroundwaterReading[] {
  const out: GroundwaterReading[] = [];
  RAW_GROUPS.forEach(group => { if (Array.isArray(group)) group.forEach(r => out.push(r)); });
  return out;
}

export interface GroundwaterDataBundle {
  stations: GroundwaterStationLatest[];
  districtSummaries: DistrictGroundwaterSummary[];
  updatedAt: Date;
}

export function buildGroundwaterData(): GroundwaterDataBundle {
  const raw = loadDistrictReadingsRaw();
  const byStation: Record<string, GroundwaterStationLatest> = {};

  raw.forEach(rec => {
    if (!rec.stationCode || rec.latitude == null || rec.longitude == null || rec.dataValue == null) return;
    const key = rec.stationCode;
    const readingDate = toDate(rec.dataTime);
    const districtNorm = normalizeDistrictName(rec.district);
    const existing = byStation[key];
    if (!existing) {
      byStation[key] = {
        stationCode: rec.stationCode,
        name: rec.stationName,
        latitude: rec.latitude,
        longitude: rec.longitude,
        district: districtNorm,
        state: rec.state || 'West Bengal',
        latestDepth: rec.dataValue,
        latestTime: readingDate,
        acquisition: rec.dataAcquisitionMode,
        status: rec.stationStatus,
        readingsCount: 1,
      };
    } else {
      existing.readingsCount += 1;
      // Choose the most recent reading
      if (readingDate > existing.latestTime) {
        existing.latestTime = readingDate;
        existing.latestDepth = rec.dataValue;
      }
    }
  });

  const stations = Object.values(byStation);
  // Aggregate district summaries from station latest values
  const byDistrict: Record<string, DistrictGroundwaterSummary> = {};
  stations.forEach(s => {
    const key = s.district;
    const dist = byDistrict[key] || (byDistrict[key] = {
      district: key,
      state: s.state,
      stationCount: 0,
      avgDepth: null,
      latestMeasurementTime: null,
      minDepth: null,
      maxDepth: null,
    });
    dist.stationCount += 1;
    dist.avgDepth = dist.avgDepth == null ? s.latestDepth : (dist.avgDepth * (dist.stationCount - 1) + s.latestDepth) / dist.stationCount;
    dist.latestMeasurementTime = !dist.latestMeasurementTime || s.latestTime > dist.latestMeasurementTime ? s.latestTime : dist.latestMeasurementTime;
    dist.minDepth = dist.minDepth == null ? s.latestDepth : Math.min(dist.minDepth, s.latestDepth);
    dist.maxDepth = dist.maxDepth == null ? s.latestDepth : Math.max(dist.maxDepth, s.latestDepth);
  });

  return {
    stations: stations.sort((a, b) => a.district.localeCompare(b.district)),
    districtSummaries: Object.values(byDistrict).sort((a, b) => a.district.localeCompare(b.district)),
    updatedAt: new Date(),
  };
}

// Simple anomaly detection utilities
export interface StationAnomaly {
  stationCode: string;
  depth: number;
  zScore: number;
}

export function detectDepthAnomalies(stations: GroundwaterStationLatest[], zThreshold = 2): StationAnomaly[] {
  if (!stations.length) return [];
  const depths = stations.map(s => s.latestDepth);
  const mean = depths.reduce((a,b) => a+b, 0) / depths.length;
  const variance = depths.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / depths.length;
  const std = Math.sqrt(variance) || 1;
  return stations.map(s => {
    const z = (s.latestDepth - mean) / std;
    return { stationCode: s.stationCode, depth: s.latestDepth, zScore: z };
  }).filter(a => Math.abs(a.zScore) >= zThreshold);
}
