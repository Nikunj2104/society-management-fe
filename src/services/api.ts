import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, localhost points to the emulator itself. Use your machine's IP address instead, 
// or 10.0.2.2 if testing on Android Emulator, or localhost if testing via web.
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
