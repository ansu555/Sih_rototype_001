import type { LatLng } from './westBengalGeo';

/**
 * INTERNATIONAL_BORDER_LINES
 * Attempts to derive only the international boundary segments of India by
 * identifying polygon edges that are not shared by another polygon in the
 * in.json FeatureCollection. This is a heuristic and may include coastal edges
 * (also unshared) and may miss simplified overlaps. For a production-grade
 * result use a proper GIS dissolve + boundary operation.
 */
export interface BorderSegment { id: string; coordinates: LatLng[] }

export const INTERNATIONAL_BORDER_LINES: BorderSegment[] = (() => {
  try {
    const india = require('./in.json');
    if (!india?.features) return [];

    // Collect all outer rings (including West Bengal) with numeric indexing.
    type Ring = { coords: number[][]; featureId: string };
    const rings: Ring[] = [];
    for (const f of india.features) {
      const g = f.geometry;
      if (!g) continue;
      const fid = String(f.id ?? f.properties?.id ?? Math.random());
      if (g.type === 'Polygon') {
        if (g.coordinates[0]) rings.push({ coords: g.coordinates[0], featureId: fid });
      } else if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) {
          if (poly[0]) rings.push({ coords: poly[0], featureId: fid });
        }
      }
    }

    // Build a map of normalized edge -> count. Normalization: order coords so smaller first.
    const edgeMap = new Map<string, { a: number[]; b: number[]; count: number }>();
    const toKey = (a: number[], b: number[]) => {
      const forward = `${a[0].toFixed(6)},${a[1].toFixed(6)}|${b[0].toFixed(6)},${b[1].toFixed(6)}`;
      const reverse = `${b[0].toFixed(6)},${b[1].toFixed(6)}|${a[0].toFixed(6)},${a[1].toFixed(6)}`;
      return forward < reverse ? forward : reverse;
    };

    for (const ring of rings) {
      const pts = ring.coords;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const key = toKey(a, b);
        const entry = edgeMap.get(key);
        if (entry) entry.count += 1; else edgeMap.set(key, { a, b, count: 1 });
      }
    }

    // International (or coastal) edges are those with count === 1.
    // We then stitch contiguous segments back into polyline sequences.
    const adjacency = new Map<string, string[]>();
    const pointKey = (p: number[]) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;

    interface RawEdge { a: number[]; b: number[] }
    const rawEdges: RawEdge[] = [];
    for (const { a, b, count } of edgeMap.values()) {
      if (count === 1) {
        rawEdges.push({ a, b });
        const ak = pointKey(a); const bk = pointKey(b);
        if (!adjacency.has(ak)) adjacency.set(ak, []);
        if (!adjacency.has(bk)) adjacency.set(bk, []);
        adjacency.get(ak)!.push(bk);
        adjacency.get(bk)!.push(ak);
      }
    }

    // Depth-first stitch
    const visitedEdges = new Set<string>();
    const segments: BorderSegment[] = [];

    const edgeKey = (a: number[], b: number[]) => toKey(a, b);

    function buildPath(start: number[]): number[][] {
      const path: number[][] = [start];
      let current = start;
      while (true) {
        const ck = pointKey(current);
        const nextCandidates = (adjacency.get(ck) || []).map(k => k.split(',').map(Number));
        let advanced = false;
        for (const cand of nextCandidates) {
          const k = edgeKey(current, cand);
            if (!visitedEdges.has(k)) {
              visitedEdges.add(k);
              path.push(cand);
              current = cand;
              advanced = true;
              break;
            }
        }
        if (!advanced) break;
      }
      return path;
    }

    for (const e of rawEdges) {
      const k = edgeKey(e.a, e.b);
      if (visitedEdges.has(k)) continue;
      visitedEdges.add(k);
      const seq = buildPath(e.a);
      // Ensure last point includes the second vertex of starting edge if missing
      if (seq[seq.length - 1] !== e.b) seq.push(e.b);
      if (seq.length > 2) {
        const coords: LatLng[] = seq.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        segments.push({ id: `seg-${segments.length}`, coordinates: coords });
      }
    }

    return segments;
  } catch {
    return [];
  }
})();

