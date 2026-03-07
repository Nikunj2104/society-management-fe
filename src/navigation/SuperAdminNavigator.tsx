import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import ManageSocieties from '../screens/superadmin/ManageSocieties';
import ManageAdmins from '../screens/superadmin/ManageAdmins';
import ManageFestivals from '../screens/superadmin/ManageFestivals';
import ManageThemes from '../screens/superadmin/ManageThemes';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

const SuperAdminNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName: any = 'dashboard';

                    if (route.name === 'Dashboard') {
                        iconName = 'dashboard';
                    } else if (route.name === 'Societies') {
                        iconName = 'location-city';
                    } else if (route.name === 'Admins') {
                        iconName = 'people';
                    } else if (route.name === 'Notifications') {
                        iconName = 'notifications';
                    } else if (route.name === 'Themes') {
                        iconName = 'color-lens';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.surfaceVariant,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={SuperAdminDashboard} />
            <Tab.Screen name="Societies" component={ManageSocieties} />
            <Tab.Screen name="Admins" component={ManageAdmins} />
            <Tab.Screen name="Notifications" component={ManageFestivals} />
            <Tab.Screen name="Themes" component={ManageThemes} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default SuperAdminNavigator;
