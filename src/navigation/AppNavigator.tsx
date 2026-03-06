import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SuperAdminNavigator from './SuperAdminNavigator';
import AdminNavigator from './AdminNavigator';
import UserNavigator from './UserNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token == null ? (
                    // Auth Stack
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : user?.role === 'SUPER_ADMIN' ? (
                    // Super Admin Stack
                    <Stack.Screen name="SuperAdminDashboard" component={SuperAdminNavigator} />
                ) : user?.role === 'ADMIN' ? (
                    // Admin Stack
                    <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
                ) : (
                    // User Stack
                    <Stack.Screen name="UserDashboard" component={UserNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
