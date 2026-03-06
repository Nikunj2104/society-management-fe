import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// 1. Neon Dark Theme (Our current default)
export const neonTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#00C853', // Darker, richer neon green
        onPrimary: '#000000',
        primaryContainer: '#003314',
        onPrimaryContainer: '#69F0AE',

        secondary: '#00BFA5',
        onSecondary: '#000000',
        secondaryContainer: '#003D33',
        onSecondaryContainer: '#1DE9B6',

        background: '#000000', // Pure black
        onBackground: '#FFFFFF',

        surface: '#121212', // Very dark grey
        onSurface: '#FFFFFF',
        surfaceVariant: '#2C2C2C',
        onSurfaceVariant: '#A0A0A0',

        error: '#FF5252',
        onError: '#000000',
    },
};

// 2. Ocean Blue Theme (Light)
export const oceanTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#1E88E5',
        onPrimary: '#FFFFFF',
        primaryContainer: '#bbdefb',
        onPrimaryContainer: '#004282',

        secondary: '#039BE5',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#ccebff',
        onSecondaryContainer: '#004c73',

        background: '#F0F4F8',
        onBackground: '#1A1C1E',

        surface: '#FFFFFF',
        onSurface: '#1A1C1E',
        surfaceVariant: '#E1E2E4',
        onSurfaceVariant: '#43474E',

        error: '#B3261E',
        onError: '#FFFFFF',
    },
};

// 3. Sunset Crimson Theme (Dark)
export const sunsetTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#FF5252',
        onPrimary: '#FFFFFF',
        primaryContainer: '#4A0000',
        onPrimaryContainer: '#FFB8B8',

        secondary: '#FF8A65',
        onSecondary: '#000000',
        secondaryContainer: '#5C2314',
        onSecondaryContainer: '#FFDBCF',

        background: '#120A0A',
        onBackground: '#FFFFFF',

        surface: '#241414',
        onSurface: '#FFFFFF',
        surfaceVariant: '#382222',
        onSurfaceVariant: '#D6C0C0',

        error: '#CF6679',
        onError: '#000000',
    },
};

// Default export if something needs it
export const theme = neonTheme;
