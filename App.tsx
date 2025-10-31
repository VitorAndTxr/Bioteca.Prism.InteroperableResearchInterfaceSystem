import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BluetoothContextProvider } from './apps/mobile/src/context/BluetoothContext';
import HomeScreen from './apps/mobile/src/screens/HomeScreen';
import { StreamConfigScreen } from './apps/mobile/src/screens/StreamConfigScreen';
import { StreamingScreen } from './apps/mobile/src/screens/StreamingScreen';
import { ResearchNodeMiddlewareProvider } from '@iris/middleware';
import type { ResearchNodeCertificateConfig } from '@iris/middleware';
import { createMobileSecureStorage } from './apps/mobile/src/storage/secureStorage';

// Define navigation parameter list
export type RootStackParamList = {
  Home: undefined;
  StreamConfig: undefined;
  Streaming: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const secureStorage = createMobileSecureStorage();

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

function resolveCertificateConfig(): ResearchNodeCertificateConfig | undefined {
  const subjectName = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_SUBJECT_NAME');
  const certificate = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE');
  const certificateWithPrivateKey = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY');
  const password = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD');
  const validFrom = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_FROM');
  const validTo = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_TO');
  const thumbprint = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_THUMBPRINT');
  const serialNumber = getEnv('EXPO_PUBLIC_IRN_MIDDLEWARE_SERIAL_NUMBER');

  const values: Array<[string, string | undefined]> = [
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_SUBJECT_NAME', subjectName],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE', certificate],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY', certificateWithPrivateKey],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD', password],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_FROM', validFrom],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_TO', validTo],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_THUMBPRINT', thumbprint],
    ['EXPO_PUBLIC_IRN_MIDDLEWARE_SERIAL_NUMBER', serialNumber]
  ];

  const missing = values.filter(([, value]) => !value);

  if (missing.length > 0) {
    console.warn('[App] Missing Expo public certificate environment variables:', missing.map(([key]) => key));
    return undefined;
  }

  return {
    subjectName: subjectName!,
    certificate: certificate!,
    certificateWithPrivateKey: certificateWithPrivateKey!,
    password: password!,
    validFrom: validFrom!,
    validTo: validTo!,
    thumbprint: thumbprint!,
    serialNumber: serialNumber!
  };
}

const certificateConfig = resolveCertificateConfig();

export default function App() {
  return (
    <ResearchNodeMiddlewareProvider storage={secureStorage} certificateConfig={certificateConfig}>
      <BluetoothContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'PRISM - IRIS' }}
            />
            <Stack.Screen
              name="StreamConfig"
              component={StreamConfigScreen}
              options={{ title: 'Stream Configuration' }}
            />
            <Stack.Screen
              name="Streaming"
              component={StreamingScreen}
              options={{ title: 'sEMG Streaming' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </BluetoothContextProvider>
    </ResearchNodeMiddlewareProvider>
  );
}
