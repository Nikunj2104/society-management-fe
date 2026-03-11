import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Platform, Pressable, Modal as RNModal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useTheme, Surface, Button, Portal } from 'react-native-paper';
import api from '../../services/api';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setError(null);
            const response = await api.get('/super-admin/admins');
            setAdmins(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Failed to load admins', err);
            setError(err.response?.data?.message || 'Unauthorized or connection failed.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAdmins();
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/super-admin/admins/${id}/status`);
            fetchAdmins();
            Alert.alert('Success', `Admin marked as ${!currentStatus ? 'Active' : 'Blocked'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update admin status');
        }
    };

    const handleDeleteClick = (admin: any) => {
        setAdminToDelete(admin);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!adminToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/super-admin/admins/${adminToDelete._id}`);
            setDeleteModalVisible(false);
            setAdminToDelete(null);
            fetchAdmins();
        } catch (error) {
            console.error('Delete failed:', error);
            const msg = Platform.OS === 'web' ? 'Failed to delete' : 'Failed to delete admin';
            Platform.OS === 'web' ? alert(msg) : null;
        } finally {
            setIsDeleting(false);
        }
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
            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Pressable
                    onPress={() => handleDeleteClick(item)}
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.5 : 1, padding: 10, marginBottom: 5 },
                        styles.deleteBtn
                    ]}
                    hitSlop={15}
                >
                    <MaterialIcons name="delete-outline" size={26} color={theme.colors.error} />
                </Pressable>
                <Button
                    mode="contained"
                    buttonColor={item.isActive ? '#28a745' : theme.colors.error}
                    textColor="#fff"
                    labelStyle={{ fontSize: 10, marginHorizontal: 6, marginVertical: 0 }}
                    style={{ borderRadius: 20, height: 30, justifyContent: 'center' }}
                    onPress={() => toggleStatus(item._id, item.isActive)}
                >
                    {item.isActive ? 'Active' : 'Blocked'}
                </Button>
            </View>
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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {error ? (
                            <>
                                <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
                                <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 10, textAlign: 'center' }}>
                                    {error}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                                    Try logging out and logging back in if the problem persists.
                                </Text>
                            </>
                        ) : (
                            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                                No admins created yet.
                            </Text>
                        )}
                    </View>
                }
            />

            {/* Modern Deletion Modal */}
            <Portal>
                <RNModal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.elevation.level3 }]} elevation={5}>
                            <View style={styles.modalIconContainer}>
                                <MaterialIcons name="report-problem" size={40} color={theme.colors.error} />
                            </View>
                            
                            <Text variant="headlineSmall" style={styles.modalTitle}>Confirm Delete</Text>
                            <Text variant="bodyMedium" style={styles.modalSubtitle}>
                                Are you sure you want to remove <Text style={{fontWeight: 'bold', color: theme.colors.onSurface}}>{adminToDelete?.name}</Text>? 
                                This action will archive them from the active records.
                            </Text>

                            <View style={styles.modalFooter}>
                                <Button 
                                    mode="text" 
                                    onPress={() => setDeleteModalVisible(false)} 
                                    textColor={theme.colors.onSurfaceVariant}
                                    style={{ flex: 1, marginRight: 8 }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    mode="contained" 
                                    onPress={confirmDelete} 
                                    buttonColor={theme.colors.error}
                                    textColor="#fff"
                                    loading={isDeleting}
                                    style={{ flex: 1 }}
                                    contentStyle={{ paddingVertical: 4 }}
                                >
                                    Delete
                                </Button>
                            </View>
                        </Surface>
                    </View>
                </RNModal>
            </Portal>
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
    emptyContainer: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20 },
    deleteBtn: {
        zIndex: 5,
        elevation: 5,
    },
    // Modern Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    modalTitle: {
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center'
    },
    modalSubtitle: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 32,
        lineHeight: 20
    },
    modalFooter: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    }
});

export default ManageAdmins;
