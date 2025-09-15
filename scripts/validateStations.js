// Station Coordinate Validation Script
// This script validates that all stations are placed within their correct districts

const fs = require('fs');
const path = require('path');

// West Bengal district boundaries (approximate ranges)
const DISTRICT_BOUNDARIES = {
  'BANKURA': {
    latMin: 22.5, latMax: 24.0,
    lngMin: 86.5, lngMax: 88.0
  },
  'BARDDHAMAN': {
    latMin: 22.8, latMax: 24.0,
    lngMin: 87.0, lngMax: 89.0
  },
  'BIRBHUM': {
    latMin: 23.2, latMax: 24.5,
    lngMin: 87.0, lngMax: 88.5
  },
  'COOCH BEHAR': {
    latMin: 26.0, latMax: 26.8,
    lngMin: 88.5, lngMax: 89.9
  },
  'NADIA': {
    latMin: 22.8, latMax: 24.5,
    lngMin: 88.0, lngMax: 89.5
  }
};

function validateCoordinates(lat, lng, district) {
  const issues = [];
  
  // Check for null or invalid coordinates
  if (lat === null || lng === null || lat === undefined || lng === undefined) {
    issues.push('Null or undefined coordinates');
    return issues;
  }
  
  // Check coordinate ranges
  if (lat < -90 || lat > 90) {
    issues.push(`Invalid latitude: ${lat} (must be between -90 and 90)`);
  }
  
  if (lng < -180 || lng > 180) {
    issues.push(`Invalid longitude: ${lng} (must be between -180 and 180)`);
  }
  
  // Check if coordinates are within district boundaries
  const bounds = DISTRICT_BOUNDARIES[district];
  if (bounds) {
    if (lat < bounds.latMin || lat > bounds.latMax) {
      issues.push(`Latitude ${lat} outside ${district} bounds (${bounds.latMin}-${bounds.latMax})`);
    }
    
    if (lng < bounds.lngMin || lng > bounds.lngMax) {
      issues.push(`Longitude ${lng} outside ${district} bounds (${bounds.lngMin}-${bounds.lngMax})`);
    }
  } else {
    issues.push(`No boundary data for district: ${district}`);
  }
  
  return issues;
}

function validateStationFile(filePath, districtName) {
  console.log(`\n=== Validating ${districtName} ===`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const stations = Array.isArray(data) ? data : [data];
    
    let totalStations = 0;
    let validStations = 0;
    let invalidStations = [];
    
    stations.forEach((station, index) => {
      totalStations++;
      
      const issues = validateCoordinates(
        station.latitude, 
        station.longitude, 
        station.district
      );
      
      if (issues.length === 0) {
        validStations++;
      } else {
        invalidStations.push({
          index: index + 1,
          stationCode: station.stationCode,
          stationName: station.stationName,
          latitude: station.latitude,
          longitude: station.longitude,
          district: station.district,
          issues: issues
        });
      }
    });
    
    console.log(`Total stations: ${totalStations}`);
    console.log(`Valid stations: ${validStations}`);
    console.log(`Invalid stations: ${invalidStations.length}`);
    
    if (invalidStations.length > 0) {
      console.log('\n--- Invalid Stations ---');
      invalidStations.forEach(station => {
        console.log(`\nStation ${station.index}: ${station.stationName} (${station.stationCode})`);
        console.log(`  Coordinates: ${station.latitude}, ${station.longitude}`);
        console.log(`  District: ${station.district}`);
        console.log(`  Issues: ${station.issues.join(', ')}`);
      });
    }
    
    return {
      district: districtName,
      total: totalStations,
      valid: validStations,
      invalid: invalidStations.length,
      invalidStations: invalidStations
    };
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Main validation function
function validateAllStations() {
  console.log('🔍 Starting Station Coordinate Validation...\n');
  
  const dataDir = path.join(__dirname, '../assets/data/GWL');
  const districts = ['Bankura', 'Barddhaman', 'Birbhum', 'Cooch Behar', 'Nadia'];
  
  const results = [];
  
  districts.forEach(district => {
    let fileName;
    if (district === 'Cooch Behar' || district === 'Birbhum' || district === 'Nadia') {
      fileName = 'GWATERLVL.json';
    } else {
      fileName = 'GWATERLVL (1).json';
    }
    const filePath = path.join(dataDir, district, fileName);
    
    if (fs.existsSync(filePath)) {
      const result = validateStationFile(filePath, district.toUpperCase());
      if (result) {
        results.push(result);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  
  let totalStations = 0;
  let totalValid = 0;
  let totalInvalid = 0;
  
  results.forEach(result => {
    console.log(`${result.district}: ${result.valid}/${result.total} valid (${result.invalid} invalid)`);
    totalStations += result.total;
    totalValid += result.valid;
    totalInvalid += result.invalid;
  });
  
  console.log(`\nOverall: ${totalValid}/${totalStations} valid (${totalInvalid} invalid)`);
  
  if (totalInvalid > 0) {
    console.log('\n⚠️  Some stations have coordinate issues that need attention.');
  } else {
    console.log('\n✅ All stations have valid coordinates!');
  }
  
  return results;
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateAllStations();
}

module.exports = { validateAllStations, validateCoordinates };
