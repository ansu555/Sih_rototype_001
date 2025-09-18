// Coordinate Correction Script
// This script corrects misplaced station coordinates based on district boundaries

const fs = require('fs');
const path = require('path');

// More accurate West Bengal district boundaries based on actual geographic data
const DISTRICT_BOUNDARIES = {
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
    latMin: 22.8, latMax: 24.5, // Adjusted to include southern parts
    lngMin: 88.0, lngMax: 89.5,
    centerLat: 23.65, centerLng: 88.75
  }
};

function correctCoordinates(lat, lng, district) {
  const bounds = DISTRICT_BOUNDARIES[district];
  if (!bounds) {
    return { lat, lng, corrected: false, reason: 'No boundary data' };
  }
  
  let correctedLat = lat;
  let correctedLng = lng;
  let corrected = false;
  let reasons = [];
  
  // Correct latitude if outside bounds
  if (lat < bounds.latMin) {
    correctedLat = bounds.latMin + 0.1; // Place slightly inside boundary
    corrected = true;
    reasons.push(`Latitude corrected from ${lat} to ${correctedLat}`);
  } else if (lat > bounds.latMax) {
    correctedLat = bounds.latMax - 0.1; // Place slightly inside boundary
    corrected = true;
    reasons.push(`Latitude corrected from ${lat} to ${correctedLat}`);
  }
  
  // Correct longitude if outside bounds
  if (lng < bounds.lngMin) {
    correctedLng = bounds.lngMin + 0.1; // Place slightly inside boundary
    corrected = true;
    reasons.push(`Longitude corrected from ${lng} to ${correctedLng}`);
  } else if (lng > bounds.lngMax) {
    correctedLng = bounds.lngMax - 0.1; // Place slightly inside boundary
    corrected = true;
    reasons.push(`Longitude corrected from ${lng} to ${correctedLng}`);
  }
  
  return {
    lat: correctedLat,
    lng: correctedLng,
    corrected: corrected,
    reasons: reasons
  };
}

function correctStationFile(filePath, districtName, outputPath) {
  console.log(`\n=== Correcting ${districtName} ===`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const stations = Array.isArray(data) ? data : [data];
    
    let totalStations = 0;
    let correctedStations = 0;
    let corrections = [];
    
    stations.forEach((station, index) => {
      totalStations++;
      
      const correction = correctCoordinates(
        station.latitude, 
        station.longitude, 
        station.district
      );
      
      if (correction.corrected) {
        correctedStations++;
        
        // Update the station coordinates
        station.latitude = correction.lat;
        station.longitude = correction.lng;
        
        corrections.push({
          index: index + 1,
          stationCode: station.stationCode,
          stationName: station.stationName,
          originalLat: station.latitude,
          originalLng: station.longitude,
          correctedLat: correction.lat,
          correctedLng: correction.lng,
          reasons: correction.reasons
        });
      }
    });
    
    // Write corrected data to output file
    fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2));
    
    console.log(`Total stations: ${totalStations}`);
    console.log(`Corrected stations: ${correctedStations}`);
    
    if (corrections.length > 0) {
      console.log('\n--- Corrections Made ---');
      corrections.forEach(correction => {
        console.log(`\nStation ${correction.index}: ${correction.stationName} (${correction.stationCode})`);
        console.log(`  Original: ${correction.originalLat}, ${correction.originalLng}`);
        console.log(`  Corrected: ${correction.correctedLat}, ${correction.correctedLng}`);
        console.log(`  Reasons: ${correction.reasons.join(', ')}`);
      });
    }
    
    return {
      district: districtName,
      total: totalStations,
      corrected: correctedStations,
      corrections: corrections
    };
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main correction function
function correctAllStations() {
  console.log('🔧 Starting Coordinate Correction...\n');
  
  const dataDir = path.join(__dirname, '../assets/data/GWL');
  const backupDir = path.join(__dirname, '../assets/data/GWL_backup');
  const districts = ['Bankura', 'Barddhaman', 'Birbhum', 'Cooch Behar', 'Nadia'];
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const results = [];
  
  districts.forEach(district => {
    let fileName;
    if (district === 'Cooch Behar' || district === 'Birbhum' || district === 'Nadia') {
      fileName = 'GWATERLVL.json';
    } else {
      fileName = 'GWATERLVL (1).json';
    }
    
    const filePath = path.join(dataDir, district, fileName);
    const backupPath = path.join(backupDir, `${district}_${fileName}`);
    
    if (fs.existsSync(filePath)) {
      // Create backup
      fs.copyFileSync(filePath, backupPath);
      console.log(`📁 Backup created: ${backupPath}`);
      
      // Correct coordinates
      const result = correctStationFile(filePath, district.toUpperCase(), filePath);
      if (result) {
        results.push(result);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CORRECTION SUMMARY');
  console.log('='.repeat(50));
  
  let totalStations = 0;
  let totalCorrected = 0;
  
  results.forEach(result => {
    console.log(`${result.district}: ${result.corrected}/${result.total} corrected`);
    totalStations += result.total;
    totalCorrected += result.corrected;
  });
  
  console.log(`\nOverall: ${totalCorrected}/${totalStations} stations corrected`);
  
  if (totalCorrected > 0) {
    console.log('\n✅ Coordinate corrections completed!');
    console.log(`📁 Original files backed up to: ${backupDir}`);
  } else {
    console.log('\n✅ No corrections needed - all coordinates are valid!');
  }
  
  return results;
}

// Run correction if this script is executed directly
if (require.main === module) {
  correctAllStations();
}

module.exports = { correctAllStations, correctCoordinates };

