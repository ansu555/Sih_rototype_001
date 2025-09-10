// District geometry loader & types.
// Expects GeoJSON FeatureCollection in india-districts-2019-734.json with features like:
// { type: 'Feature', properties: { DISTRICT: 'Bankura', ST_NM: 'West Bengal', DISTRICT_ID?: string }, geometry: { type: 'MultiPolygon' | 'Polygon', coordinates: number[][][] | number[][][][] } }
// NOTE: Current provided file is empty – loader will return an empty array until data is populated.

import raw from './india-districts-2019-734.json';

export interface DistrictFeatureProperties {
  DISTRICT?: string;        // common naming in many datasets
  district?: string;        // alternative lowercase
  NAME_2?: string;          // alternative (GADM style)
  ST_NM?: string;           // state name
  state?: string;           // alt state name key
  DISTRICT_ID?: string;     // optional stable id
  [k: string]: any;         // allow extra attrs
}

export interface DistrictGeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  properties: DistrictFeatureProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any; // refine at runtime
  };
}

interface FeatureCollection { type: 'FeatureCollection'; features: DistrictGeoJSONFeature[] }

export interface DistrictShape {
  id: string;              // stable id (generated if missing)
  name: string;            // district name
  state: string;           // parent state name
  polygons: { latitude: number; longitude: number; }[][]; // array of rings (outer ring only used for now)
}

function isFeatureCollection(obj: any): obj is FeatureCollection {
  return obj && obj.type === 'FeatureCollection' && Array.isArray(obj.features);
}

function toLatLngPairs(coords: any): { latitude: number; longitude: number; }[][] {
  // Accept Polygon -> [ring][coord][lng,lat]; MultiPolygon -> [poly][ring][coord][lng,lat]
  if (!Array.isArray(coords)) return [];
  // Heuristic: detect nesting depth
  const depth = Array.isArray(coords[0]) ? (Array.isArray(coords[0][0]) ? (Array.isArray(coords[0][0][0]) ? 4 : 3) : 2) : 1;
  if (depth === 3) {
    // Polygon: coords[ring][point][2]
    return coords.map((ring: any[]) => ring.map(pt => ({ latitude: pt[1], longitude: pt[0] })));
  } else if (depth === 4) {
    // MultiPolygon: take all rings from all polygons (flat)
    const rings: { latitude: number; longitude: number; }[][] = [];
    coords.forEach((poly: any[]) => {
      poly.forEach((ring: any[]) => {
        rings.push(ring.map(pt => ({ latitude: pt[1], longitude: pt[0] })));
      });
    });
    return rings;
  }
  return [];
}

export function loadAllDistricts(): DistrictShape[] {
  if (!isFeatureCollection(raw)) return [];
  const out: DistrictShape[] = [];
  raw.features.forEach((f, idx) => {
    if (!f.geometry || !f.geometry.coordinates) return;
    const polygons = toLatLngPairs(f.geometry.coordinates);
    if (!polygons.length) return;
    const props = f.properties || {};
    const name = props.DISTRICT || props.district || props.NAME_2 || `District ${idx}`;
    const state = props.ST_NM || props.state || 'Unknown';
    const id = (props.DISTRICT_ID || f.id || `${state}-${name}-${idx}`).toString();
    out.push({ id, name, state, polygons });
  });
  return out;
}

export function loadDistrictsByState(stateName: string): DistrictShape[] {
  return loadAllDistricts().filter(d => d.state.toLowerCase() === stateName.toLowerCase());
}

// Focus helper for West Bengal specifically
export function loadWestBengalDistricts(): DistrictShape[] {
  return loadDistrictsByState('West Bengal');
}

// If file empty this will be []
export const WEST_BENGAL_DISTRICTS: DistrictShape[] = loadWestBengalDistricts();
