import 'dotenv/config';

export default {
  expo: {
    name: 'dev-lalaba-merchant',
    slug: 'dev-lalaba-merchant',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    runtimeVersion: {
      policy: 'sdkVersion',
    },

    // Environment variables setup
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        databaseURL: process.env.FIREBASE_DB_URL,
      },
      walletApiBaseUrl: process.env.WALLET_API_BASE_URL,
    },

    // iOS Configuration
    ios: {
      bundleIdentifier: 'com.yourcompany.lalabamerchant',
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan documents and capture product images',
        NSPhotoLibraryUsageDescription: 'This app accesses your photos to upload product images',
        NSLocationWhenInUseUsageDescription: 'This app uses your location for delivery tracking and store locator',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app uses your location for background delivery updates',
        LSApplicationQueriesSchemes: ['geo', 'maps'],
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },

    // Android Configuration
    android: {
      package: 'com.yourcompany.lalabamerchant',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'CAMERA',
        'WRITE_EXTERNAL_STORAGE',
        'READ_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },

    // Web Configuration
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    // Plugins Configuration
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-secure-store',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        },
      ],
      'expo-location',
      'expo-file-system',
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos',
        },
      ],
    ],

    // Experiments
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },

    // Hook for EAS updates
    updates: {
      url: 'https://u.expo.dev/[your-project-id]',
    },
  },
};