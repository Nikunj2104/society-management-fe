import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;
            if (!projectId) {
                console.warn('Project ID not found in Constants. Ensure EAS is configured.');
            }
            
            try {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                console.log('Expo Push Token (Remote):', token);
                
                // Send token to backend
                await api.post('/user/push-token', { token });
            } catch (tokenError: any) {
                if (tokenError.message.includes('Expo Go') || tokenError.message.includes('not supported')) {
                    console.warn('Push Notifications (Remote) are not supported in Expo Go on Android SDK 51+. Use a Development Build.');
                } else {
                    console.error('Error getting remote push token:', tokenError);
                }
                
                // Fallback to null token or local-only handling
                token = null;
            }
        } catch (e) {
            console.error('Error in registerForPushNotificationsAsync:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};
