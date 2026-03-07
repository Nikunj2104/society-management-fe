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

// 4. Holi Theme (Vibrant Pink & Purple)
export const holiTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#E91E63',
        onPrimary: '#FFFFFF',
        primaryContainer: '#FCE4EC',
        onPrimaryContainer: '#880E4F',

        secondary: '#9C27B0',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#F3E5F5',
        onSecondaryContainer: '#4A148C',

        background: '#FAFAFA',
        onBackground: '#121212',

        surface: '#FFFFFF',
        onSurface: '#121212',
        surfaceVariant: '#EEEEEE',
        onSurfaceVariant: '#424242',

        error: '#D32F2F',
        onError: '#FFFFFF',
    },
};

// 5. Diwali Theme (Festive Orange & Gold - Dark)
export const diwaliTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#FF9800',
        onPrimary: '#000000',
        primaryContainer: '#4E2A00',
        onPrimaryContainer: '#FFE0B2',

        secondary: '#FFC107',
        onSecondary: '#000000',
        secondaryContainer: '#543B00',
        onSecondaryContainer: '#FFECB3',

        background: '#120A05',
        onBackground: '#FFFFFF',

        surface: '#1E1005',
        onSurface: '#FFFFFF',
        surfaceVariant: '#3E2723',
        onSurfaceVariant: '#D7CCC8',

        error: '#CF6679',
        onError: '#000000',
    },
};

// 6. Uttarayan Theme (Kite Festival - Sky Blue & Yellow)
export const uttarayanTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#03A9F4',
        onPrimary: '#FFFFFF',
        primaryContainer: '#E1F5FE',
        onPrimaryContainer: '#01579B',

        secondary: '#FFEB3B',
        onSecondary: '#000000',
        secondaryContainer: '#FFFDE7',
        onSecondaryContainer: '#F57F17',

        background: '#E8F5E9',
        onBackground: '#1A1C1E',

        surface: '#FFFFFF',
        onSurface: '#1A1C1E',
        surfaceVariant: '#CFD8DC',
        onSurfaceVariant: '#455A64',

        error: '#B3261E',
        onError: '#FFFFFF',
    },
};

// 7. Rakshabandhan Theme (Thread colors - Red & Deep Orange)
export const rakshabandhanTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#D32F2F',
        onPrimary: '#FFFFFF',
        primaryContainer: '#FFCDD2',
        onPrimaryContainer: '#B71C1C',

        secondary: '#FF5722',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#FFCCBC',
        onSecondaryContainer: '#BF360C',

        background: '#FFF8E1',
        onBackground: '#212121',

        surface: '#FFFFFF',
        onSurface: '#212121',
        surfaceVariant: '#FFECB3',
        onSurfaceVariant: '#5D4037',

        error: '#C62828',
        onError: '#FFFFFF',
    },
};

// 8. Janmashtami Theme (Lord Krishna - Deep Blue & Peacock Green - Dark)
export const janmashtamiTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#5C6BC0',
        onPrimary: '#FFFFFF',
        primaryContainer: '#1A237E',
        onPrimaryContainer: '#C5CAE9',

        secondary: '#00BFA5',
        onSecondary: '#000000',
        secondaryContainer: '#003D33',
        onSecondaryContainer: '#A7FFEB',

        background: '#0B0C10',
        onBackground: '#FFFFFF',

        surface: '#121212',
        onSurface: '#FFFFFF',
        surfaceVariant: '#1F2833',
        onSurfaceVariant: '#C5C6C7',

        error: '#CF6679',
        onError: '#000000',
    },
};

// 9. Ganesh Chaturthi Theme (Saffron, Yellow & Maroon)
export const ganeshChaturthiTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#FF6F00',
        onPrimary: '#FFFFFF',
        primaryContainer: '#FFE082',
        onPrimaryContainer: '#E65100',

        secondary: '#880E4F',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#F8BBD0',
        onSecondaryContainer: '#4A148C',

        background: '#FFF3E0',
        onBackground: '#3E2723',

        surface: '#FFFFFF',
        onSurface: '#3E2723',
        surfaceVariant: '#FFE0B2',
        onSurfaceVariant: '#5D4037',

        error: '#D32F2F',
        onError: '#FFFFFF',
    },
};

// Default export if something needs it
export const theme = neonTheme;
