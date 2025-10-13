import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BluetoothContextProvider } from './src/context/BluetoothContext';
import HomeScreen from './src/screens/HomeScreen';
import { StreamConfigScreen } from './src/screens/StreamConfigScreen';
import { StreamingScreen } from './src/screens/StreamingScreen';

// Define navigation parameter list
export type RootStackParamList = {
  Home: undefined;
  StreamConfig: undefined;
  Streaming: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
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
  );
}
