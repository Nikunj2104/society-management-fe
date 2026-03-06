import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useTheme, Surface } from 'react-native-paper';
import api from '../../services/api';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await api.get('/super-admin/admins');
            setAdmins(response.data);
        } catch (error) {
            console.error('Failed to load admins', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAdmin = (id: string) => {
        Alert.alert('Confirm', 'Remove this admin? They will lose access to the society panel.', [
            { text: 'Cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        Alert.alert('Info', 'Admin removal logic to be implemented on backend if needed.');
                    } catch (e) {
                        Alert.alert('Error', 'Failed to remove admin');
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>{item.email}</Text>
                <View style={[styles.societyTag, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialIcons name="location-city" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurface, marginLeft: 4, fontWeight: '600' }}>{item.society?.name || 'Unassigned'}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => deleteAdmin(item._id)}>
                <MaterialIcons name="delete-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>Society Admins</Text>
            <FlatList
                data={admins}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceVariant }}>No admins created yet.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    title: { fontWeight: 'bold', marginBottom: 20 },
    card: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    societyTag: { flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});

export default ManageAdmins;
