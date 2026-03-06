import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider } from 'react-native-paper';
import { neonTheme, oceanTheme, sunsetTheme } from '../theme/theme';

export const ThemeContext = createContext<any>(null);

export const CustomThemeProvider = ({ children }: any) => {
    const [themeName, setThemeName] = useState('neon');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appThemePreference');
            if (savedTheme) {
                setThemeName(savedTheme);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const changeTheme = async (name: string) => {
        setThemeName(name);
        try {
            await AsyncStorage.setItem('appThemePreference', name);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    let activeTheme = neonTheme;
    if (themeName === 'ocean') activeTheme = oceanTheme;
    if (themeName === 'sunset') activeTheme = sunsetTheme;

    // Don't render until theme is loaded to avoid flashing wrong theme
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ themeName, changeTheme }}>
            <PaperProvider theme={activeTheme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};
