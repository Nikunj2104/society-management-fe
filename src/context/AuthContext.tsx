import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface AuthContextData {
    user: any;
    token: string | null;
    loading: boolean;
    signIn: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (data: any) => Promise<void>;
    updateUser: (data: any) => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error loading auth state', error);
            } finally {
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);

    const signIn = async (data: any) => {
        try {
            const response = await api.post('/auth/login', data);
            const resData = response.data;

            await AsyncStorage.setItem('userToken', resData.token);
            await AsyncStorage.setItem('userData', JSON.stringify(resData));

            setToken(resData.token);
            setUser(resData);
        } catch (error) {
            console.error('Login error', error);
            throw error;
        }
    };

    const signUp = async (data: any) => {
        try {
            const response = await api.post('/auth/register', data);
            const resData = response.data;

            await AsyncStorage.setItem('userToken', resData.token);
            await AsyncStorage.setItem('userData', JSON.stringify(resData));

            setToken(resData.token);
            setUser(resData);
        } catch (error) {
            console.error('Register error', error);
            throw error;
        }
    };

    const signOut = async () => {
        await AsyncStorage.clear();
        setToken(null);
        setUser(null);
    };

    const updateUser = async (data: any) => {
        const updatedUser = { ...user, ...data };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut, signUp, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
