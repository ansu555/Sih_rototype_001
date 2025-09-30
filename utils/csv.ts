// Utility for building CSV content from arrays of objects.
// Simple implementation: handles commas, quotes, and newlines via CSV standard escaping.

export function toCSV(rows: Record<string, any>[], headers?: string[]): string {
  if (!rows.length) {
    return headers ? headers.join(',') + '\n' : '';
  }
  const headerKeys = headers || Object.keys(rows[0]);
  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Escape double quotes by doubling them
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const headerLine = headerKeys.map(escape).join(',');
  const lines = rows.map(r => headerKeys.map(k => escape(r[k])).join(','));
  return [headerLine, ...lines].join('\n');
}

export function buildStationsCSV(data: {
  stations: {
    stationCode: string;
    name: string;
    district: string;
    state: string;
    latestDepth: number;
    latestTime: Date;
    readingsCount: number;
  }[];
  meta?: Record<string, string | number | null | undefined>;
}): string {
  const { stations, meta } = data;
  const rows = stations.map(s => ({
    stationCode: s.stationCode,
    name: s.name,
    district: s.district,
    state: s.state,
    latestDepth: s.latestDepth,
    latestTimeISO: s.latestTime.toISOString(),
    readingsCount: s.readingsCount,
  }));
  const csvCore = toCSV(rows, [
    'stationCode','name','district','state','latestDepth','latestTimeISO','readingsCount'
  ]);
  if (meta) {
    const metaLines = Object.entries(meta).map(([k,v]) => `# ${k}: ${v ?? ''}`);
    return metaLines.join('\n') + '\n' + csvCore;
  }
  return csvCore;
}
