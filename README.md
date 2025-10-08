# Interoperable Research Interface System (IRIS)

A React Native application built with Expo, running primarily on web and Android platforms with TypeScript.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Expo Go app (for testing on physical devices)

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── services/       # API and external services
│   ├── types/          # TypeScript type definitions
│   └── assets/         # Images, fonts, etc.
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run web        # Run on web browser
npm run android    # Run on Android emulator/device
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run web` - Run on web browser
- `npm run android` - Run on Android
- `npm run dev:web` - Start web development server
- `npm run dev:android` - Start Android development server
- `npm run build:web` - Build for web production
- `npm run build:android` - Build Android APK
- `npm run prebuild` - Generate native Android folders
- `npm run clean` - Clear cache and restart
- `npm run type-check` - Run TypeScript type checking

## Development

### Web Development
```bash
npm run dev:web
```
Open http://localhost:8081 in your browser.

### Android Development
1. Set up Android Studio and emulator
2. Run `npm run android`

## Building for Production

### Web
```bash
npm run build:web
```

### Android
```bash
npm run build:android
```

## TypeScript

The project uses strict TypeScript configuration. Type definitions are located in `src/types/`.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run type-check` to verify types
4. Submit a pull request

## License

MIT
