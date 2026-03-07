import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import UserDashboard from '../screens/user/UserDashboard';
import MyComplaints from '../screens/user/MyComplaints';
import MaintenanceHistory from '../screens/user/MaintenanceHistory';
import SocietyInfo from '../screens/user/SocietyInfo';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

const UserNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    const icons: any = {
                        Dashboard: 'dashboard',
                        MyComplaints: 'report-problem',
                        Maintenance: 'account-balance-wallet',
                        Info: 'info',
                        Settings: 'settings',
                    };
                    return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.surfaceVariant,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={UserDashboard} />
            <Tab.Screen name="MyComplaints" component={MyComplaints} />
            <Tab.Screen name="Maintenance" component={MaintenanceHistory} />
            <Tab.Screen name="Info" component={SocietyInfo} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default UserNavigator;
