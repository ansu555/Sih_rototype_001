import type { LatLng } from './westBengalGeo';

/**
 * INDIA_OUTLINE_POLYGONS
 * Lightweight outline for India (all states) extracted from in.json.
 * Only outer rings are used. West Bengal excluded (handled separately for highlight).
 * NOTE: This parses once at module load; if bundle size becomes an issue, consider
 * pre-generating a trimmed JSON with only needed coordinates.
 */
export const INDIA_OUTLINE_POLYGONS: LatLng[][] = (() => {
  try {
    const india = require('./in.json');
    if (!india?.features) return [];
    const result: LatLng[][] = [];
    for (const f of india.features) {
      if (f?.properties?.name === 'West Bengal') continue; // skip to avoid double render
      const g = f.geometry;
      if (!g) continue;
      const toLatLng = (coords: number[][]): LatLng[] => coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
      if (g.type === 'Polygon') {
        // outer ring only
        result.push(toLatLng(g.coordinates[0]));
      } else if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) {
          if (poly[0]) result.push(toLatLng(poly[0]));
        }
      }
    }
    return result;
  } catch {
    return [];
  }
})();

/**
 * INDIA_BORDER_POLYGONS
 * A coarse outer border built by selecting features tagged as mainland/outer
 * (simplistic approach: we currently reuse the union of all outer rings; for
 * production you'd run a dissolve topology server-side to avoid overlaps).
 */
export const INDIA_BORDER_POLYGONS: LatLng[][] = (() => {
  // For now just reuse outline polygons; Map layer will style it with thicker stroke.
  return INDIA_OUTLINE_POLYGONS;
})();

export { INDIA_BORDER_POLYGONS as INDIA_OUTER_BORDER }; // alias if needed

export default INDIA_OUTLINE_POLYGONS;
