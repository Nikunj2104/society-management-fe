import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface NotificationData {
    _id: string;
    title: string;
    message: string;
    type: 'maintenance' | 'announcement' | 'event' | 'complaint' | 'other';
}

interface NotificationContextData {
    notifications: NotificationData[];
}

export const NotificationContext = createContext({} as NotificationContextData);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useContext(AuthContext);
    const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
    const theme = useTheme();
    const socketRef = useRef<Socket | null>(null);
    const slideAnim = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (user && user._id) {
            // Initialize Socket
            socketRef.current = io(API_URL.replace('/api', ''), {
                transports: ['websocket'],
            });

            const eventName = `notification_${user._id}`;
            console.log(`📡 Listening for notifications on: ${eventName}`);

            socketRef.current.on(eventName, (data: NotificationData) => {
                showNotification(data);
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [user]);

    const showNotification = (data: NotificationData) => {
        setCurrentNotification(data);
        
        // Slide Down
        Animated.spring(slideAnim, {
            toValue: 50,
            useNativeDriver: true,
            bounciness: 10
        }).start();

        // Auto hide after 5 seconds
        setTimeout(hideNotification, 5000);
    };

    const hideNotification = () => {
        Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setCurrentNotification(null));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'maintenance': return 'payments';
            case 'announcement': return 'campaign';
            case 'event': return 'event';
            case 'complaint': return 'report-problem';
            default: return 'notifications';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'maintenance': return '#00C853';
            case 'complaint': return '#f59e0b';
            case 'announcement': return theme.colors.primary;
            default: return theme.colors.secondary;
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications: [] }}>
            {children}
            
            {currentNotification && (
                <Animated.View style={[
                    styles.notificationWrapper, 
                    { transform: [{ translateY: slideAnim }] }
                ]}>
                    <TouchableOpacity activeOpacity={0.9} onPress={hideNotification}>
                        <Surface style={[styles.notificationCard, { backgroundColor: theme.colors.elevation.level3 }]} elevation={5}>
                            <View style={[styles.iconContainer, { backgroundColor: getColor(currentNotification.type) + '20' }]}>
                                <MaterialIcons name={getIcon(currentNotification.type) as any} size={24} color={getColor(currentNotification.type)} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{currentNotification.title}</Text>
                                <Text variant="bodySmall" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>{currentNotification.message}</Text>
                            </View>
                            <IconButton icon="close" size={16} onPress={hideNotification} />
                        </Surface>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </NotificationContext.Provider>
    );
};

const styles = StyleSheet.create({
    notificationWrapper: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#00C853', // Default brand color
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    textContainer: {
        flex: 1,
    }
});
