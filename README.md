# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## District Borders Data

District features are loaded from `data/india-districts-2019-734.json` (currently empty). Populate with a GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "DISTRICT": "Bankura", "ST_NM": "West Bengal", "DISTRICT_ID": "WB-BANKURA" },
      "geometry": { "type": "Polygon", "coordinates": [ [ [ 87.123, 23.456 ], [ 87.130, 23.460 ], [ 87.123, 23.456 ] ] ] }
    }
  ]
}
```

Property key fallbacks:
* District name: `DISTRICT`, `district`, or `NAME_2`
* State name: `ST_NM` or `state`

Guidelines:
* Coordinates must be `[lng, lat]` (GeoJSON spec); loader converts.
* Simplify huge polygons ahead of time (e.g., Douglas-Peucker).
* Ensure rings are closed.

Utilities:
* `loadAllDistricts()` parse everything.
* `loadWestBengalDistricts()` subset for West Bengal.
* Context auto-refreshes on screen focus.

If file is empty the UI shows helper messages instead of borders.
