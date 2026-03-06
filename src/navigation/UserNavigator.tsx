import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import UserDashboard from '../screens/user/UserDashboard';
import MyComplaints from '../screens/user/MyComplaints';
import MaintenanceHistory from '../screens/user/MaintenanceHistory';
import SocietyInfo from '../screens/user/SocietyInfo';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

const UserNavigator = () => {
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
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: 'gray',
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
