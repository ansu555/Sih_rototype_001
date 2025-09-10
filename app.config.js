// app.config.js
export default ({ config }) => {
  // config parameter is the existing app.json configuration, loaded by Expo CLI.
  // We will modify it here.

  // Expo CLI automatically loads .env files and makes variables available in process.env
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    // This warning will appear during the build process if the key is missing.
    console.warn("Warning: GOOGLE_MAPS_API_KEY is not set in your .env file. Google Maps may not work correctly.");
  }

  // Update the Android configuration
  const androidConfig = config.android || {};
  const androidGoogleMapsConfig = androidConfig.config?.googleMaps || {};
  
  const updatedAndroidConfig = {
    ...androidConfig,
    config: {
      ...(androidConfig.config || {}),
      googleMaps: {
        ...androidGoogleMapsConfig,
        apiKey: googleMapsApiKey || androidGoogleMapsConfig.apiKey, // Use env var, fallback to app.json if env var is missing
      },
    },
  };

  // Optionally, you can do the same for iOS if needed:
  // const iosConfig = config.ios || {};
  // const iosGoogleMapsConfig = iosConfig.config || {};
  // const updatedIosConfig = {
  //   ...iosConfig,
  //   config: {
  //     ...(iosConfig.config || {}),
  //     googleMapsApiKey: googleMapsApiKey || iosGoogleMapsConfig.googleMapsApiKey,
  //   },
  // };

  return {
    ...config, // Spread the existing base app.json config
     scheme: "prototype001", 
    android: updatedAndroidConfig,
    // ios: updatedIosConfig, // Uncomment if you add iOS configuration
  };
};
