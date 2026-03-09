import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider } from 'react-native-paper';
import {
    neonTheme, oceanTheme, sunsetTheme,
    holiTheme, diwaliTheme, uttarayanTheme,
    rakshabandhanTheme, janmashtamiTheme, ganeshChaturthiTheme
} from '../theme/theme';
import { getCurrentFestival, Festival } from '../utils/festivals';
import { FestivalNotification } from '../components/common/FestivalNotification';
import api from '../services/api';
import { io } from 'socket.io-client';

export const ThemeContext = createContext<any>(null);

export const CustomThemeProvider = ({ children }: any) => {
    const [festival, setFestival] = useState<Festival | null>(null);
    const [themeName, setThemeName] = useState('neon');
    const [dbThemes, setDbThemes] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadData();

        // Connect to Socket via standard EXPO_PUBLIC_API_URL but replace /api with root url
        const serverUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(serverUrl);

        // Listen for realtime push updates from Super Admin actions
        socket.on('notifications_updated', () => {
            console.log("Realtime Update: Super Admin changed a notification! Re-fetching...");
            fetchLiveFestivals();
        });

        socket.on('themes_updated', () => {
            console.log("Realtime Update: Super Admin changed themes! Re-fetching...");
            fetchLiveThemes();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchLiveFestivals = async () => {
        try {
            const response = await api.get(`/notifications?_t=${Date.now()}`);
            const data = response.data;
            const loadedFestivals = Array.isArray(data) ? data : [];
            setFestival(getCurrentFestival(loadedFestivals));
        } catch (apiError) {
            console.warn("Could not fetch remote festivals. Falling back to default list.");
            setFestival(getCurrentFestival([]));
        }
    };

    const fetchLiveThemes = async () => {
        try {
            const response = await api.get(`/themes?_t=${Date.now()}`);
            const data = response.data;
            setDbThemes(Array.isArray(data) ? data : []);
        } catch (apiError) {
            console.error("Could not fetch DB themes.");
        }
    }

    const loadData = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appThemePreference');
            if (savedTheme) {
                setThemeName(savedTheme);
            }

            // Fetch live festivals returning from backend concurrently
            await Promise.all([
                fetchLiveFestivals(),
                fetchLiveThemes()
            ]);

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

    let baseTheme = neonTheme;
    if (themeName === 'ocean') baseTheme = oceanTheme;
    if (themeName === 'sunset') baseTheme = sunsetTheme;
    if (themeName === 'holi') baseTheme = holiTheme;
    if (themeName === 'diwali') baseTheme = diwaliTheme;
    if (themeName === 'uttarayan') baseTheme = uttarayanTheme;
    if (themeName === 'rakshabandhan') baseTheme = rakshabandhanTheme;
    if (themeName === 'janmashtami') baseTheme = janmashtamiTheme;
    if (themeName === 'ganeshChaturthi') baseTheme = ganeshChaturthiTheme;

    let activeTheme = { ...baseTheme };

    // Apply Super Admin dynamic edits over the base theme if they exist in DB
    const safeDbThemes = Array.isArray(dbThemes) ? dbThemes : [];
    const activeDbFestivalTheme = safeDbThemes.find(t => t.type === 'festival' && t.isActiveFestival);
    const selectedDbTheme = safeDbThemes.find(t => t.themeKey === themeName);
    const dbOverride = activeDbFestivalTheme || selectedDbTheme;

    if (dbOverride && dbOverride.colors) {
        activeTheme = {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: dbOverride.colors.primary,
                background: dbOverride.colors.background,
                surface: dbOverride.colors.surface,
                surfaceVariant: dbOverride.colors.surfaceVariant,
                onSurface: dbOverride.colors.text,
                onBackground: dbOverride.colors.text,
            }
        };
    }

    // Don't render until theme is loaded to avoid flashing wrong theme
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ themeName, changeTheme }}>
            <PaperProvider theme={activeTheme}>
                <FestivalNotification festival={festival} />
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};
