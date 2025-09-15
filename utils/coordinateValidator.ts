// Coordinate Validation Utility
// This utility validates and corrects station coordinates to ensure accurate placement

export interface CoordinateValidationResult {
  isValid: boolean;
  correctedLat?: number;
  correctedLng?: number;
  issues: string[];
  warnings: string[];
}

export interface DistrictBoundary {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  centerLat: number;
  centerLng: number;
}

// West Bengal district boundaries based on actual geographic data
export const DISTRICT_BOUNDARIES: Record<string, DistrictBoundary> = {
  'BANKURA': {
    latMin: 22.5, latMax: 24.0,
    lngMin: 86.5, lngMax: 88.0,
    centerLat: 23.25, centerLng: 87.25
  },
  'BARDDHAMAN': {
    latMin: 22.8, latMax: 24.0,
    lngMin: 87.0, lngMax: 89.0,
    centerLat: 23.4, centerLng: 88.0
  },
  'BIRBHUM': {
    latMin: 23.2, latMax: 24.5,
    lngMin: 87.0, lngMax: 88.5,
    centerLat: 23.85, centerLng: 87.75
  },
  'COOCH BEHAR': {
    latMin: 26.0, latMax: 26.8,
    lngMin: 88.5, lngMax: 89.9,
    centerLat: 26.4, centerLng: 89.2
  },
  'NADIA': {
    latMin: 22.8, latMax: 24.5,
    lngMin: 88.0, lngMax: 89.5,
    centerLat: 23.65, centerLng: 88.75
  }
};

/**
 * Validates station coordinates against district boundaries
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @param district - District name
 * @param autoCorrect - Whether to automatically correct invalid coordinates
 * @returns Validation result with corrections if needed
 */
export function validateStationCoordinates(
  lat: number,
  lng: number,
  district: string,
  autoCorrect: boolean = false
): CoordinateValidationResult {
  const result: CoordinateValidationResult = {
    isValid: true,
    issues: [],
    warnings: []
  };

  // Check for null or invalid coordinates
  if (lat === null || lng === null || lat === undefined || lng === undefined) {
    result.isValid = false;
    result.issues.push('Null or undefined coordinates');
    return result;
  }

  // Check coordinate ranges
  if (lat < -90 || lat > 90) {
    result.isValid = false;
    result.issues.push(`Invalid latitude: ${lat} (must be between -90 and 90)`);
  }

  if (lng < -180 || lng > 180) {
    result.isValid = false;
    result.issues.push(`Invalid longitude: ${lng} (must be between -180 and 180)`);
  }

  // Check if coordinates are within district boundaries
  const bounds = DISTRICT_BOUNDARIES[district.toUpperCase()];
  if (!bounds) {
    result.warnings.push(`No boundary data for district: ${district}`);
    return result;
  }

  let correctedLat = lat;
  let correctedLng = lng;

  // Check latitude bounds
  if (lat < bounds.latMin) {
    result.isValid = false;
    result.issues.push(`Latitude ${lat} outside ${district} bounds (${bounds.latMin}-${bounds.latMax})`);
    if (autoCorrect) {
      correctedLat = bounds.latMin + 0.1;
    }
  } else if (lat > bounds.latMax) {
    result.isValid = false;
    result.issues.push(`Latitude ${lat} outside ${district} bounds (${bounds.latMin}-${bounds.latMax})`);
    if (autoCorrect) {
      correctedLat = bounds.latMax - 0.1;
    }
  }

  // Check longitude bounds
  if (lng < bounds.lngMin) {
    result.isValid = false;
    result.issues.push(`Longitude ${lng} outside ${district} bounds (${bounds.lngMin}-${bounds.lngMax})`);
    if (autoCorrect) {
      correctedLng = bounds.lngMin + 0.1;
    }
  } else if (lng > bounds.lngMax) {
    result.isValid = false;
    result.issues.push(`Longitude ${lng} outside ${district} bounds (${bounds.lngMin}-${bounds.lngMax})`);
    if (autoCorrect) {
      correctedLng = bounds.lngMax - 0.1;
    }
  }

  // Add corrected coordinates if auto-correction was applied
  if (autoCorrect && (correctedLat !== lat || correctedLng !== lng)) {
    result.correctedLat = correctedLat;
    result.correctedLng = correctedLng;
    result.warnings.push(`Coordinates auto-corrected to: ${correctedLat}, ${correctedLng}`);
  }

  return result;
}

/**
 * Validates multiple stations at once
 * @param stations - Array of station objects with lat, lng, and district properties
 * @param autoCorrect - Whether to automatically correct invalid coordinates
 * @returns Array of validation results
 */
export function validateMultipleStations(
  stations: Array<{ latitude: number; longitude: number; district: string; [key: string]: any }>,
  autoCorrect: boolean = false
): Array<{ station: any; validation: CoordinateValidationResult }> {
  return stations.map(station => ({
    station,
    validation: validateStationCoordinates(
      station.latitude,
      station.longitude,
      station.district,
      autoCorrect
    )
  }));
}

/**
 * Gets the center coordinates for a district
 * @param district - District name
 * @returns Center coordinates or null if district not found
 */
export function getDistrictCenter(district: string): { lat: number; lng: number } | null {
  const bounds = DISTRICT_BOUNDARIES[district.toUpperCase()];
  if (!bounds) return null;
  
  return {
    lat: bounds.centerLat,
    lng: bounds.centerLng
  };
}

/**
 * Checks if a coordinate is within a specific district
 * @param lat - Latitude
 * @param lng - Longitude
 * @param district - District name
 * @returns True if coordinate is within district bounds
 */
export function isCoordinateInDistrict(lat: number, lng: number, district: string): boolean {
  const bounds = DISTRICT_BOUNDARIES[district.toUpperCase()];
  if (!bounds) return false;
  
  return lat >= bounds.latMin && lat <= bounds.latMax && 
         lng >= bounds.lngMin && lng <= bounds.lngMax;
}

/**
 * Gets all available district names
 * @returns Array of district names
 */
export function getAvailableDistricts(): string[] {
  return Object.keys(DISTRICT_BOUNDARIES);
}
