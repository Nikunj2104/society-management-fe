import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageResidents from '../screens/admin/ManageResidents';
import ManageComplaints from '../screens/admin/ManageComplaints';
import ManageAnnouncements from '../screens/admin/ManageAnnouncements';
import ManageEvents from '../screens/admin/ManageEvents';
import ManageMaintenance from '../screens/admin/ManageMaintenance';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    const icons: any = {
                        Dashboard: 'dashboard',
                        Residents: 'people',
                        Announcements: 'campaign',
                        Events: 'event',
                        Maintenance: 'account-balance-wallet',
                        Complaints: 'report-problem',
                        Settings: 'settings',
                    };
                    return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Dashboard" component={AdminDashboard} />
            <Tab.Screen name="Residents" component={ManageResidents} />
            <Tab.Screen name="Announcements" component={ManageAnnouncements} />
            <Tab.Screen name="Events" component={ManageEvents} />
            <Tab.Screen name="Maintenance" component={ManageMaintenance} />
            <Tab.Screen name="Complaints" component={ManageComplaints} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default AdminNavigator;
