import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import ManageSocieties from '../screens/superadmin/ManageSocieties';
import ManageAdmins from '../screens/superadmin/ManageAdmins';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

const SuperAdminNavigator = () => {
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
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Dashboard" component={SuperAdminDashboard} />
            <Tab.Screen name="Societies" component={ManageSocieties} />
            <Tab.Screen name="Admins" component={ManageAdmins} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default SuperAdminNavigator;
