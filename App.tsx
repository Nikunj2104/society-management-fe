import React from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CustomThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix for browser autofill overriding React Native dark themes */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
        transition: background-color 50000s ease-in-out 0s;
        -webkit-text-fill-color: white !important;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
