import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl, KeyboardAvoidingView, ScrollView, Platform, Modal as RNModal } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, IconButton, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

const ManageResidents = () => {
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', flatNumber: '' });
    const [errors, setErrors] = useState<any>({});
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchResidents();
        setRefreshing(false);
    }, []);

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', phone: '', flatNumber: '' });
        setErrors({});
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };



    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        try {
            const res = await api.get('/admin/residents');
            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            console.error("Fetch residents error:", e.message);
            setResidents([]);
        } finally {
            setLoading(false);
        }
    };

    const addResident = async () => {
        const newErrors: any = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        if (!form.password.trim()) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            await api.post('/admin/residents', form);
            handleCloseModal();
            fetchResidents();
            Alert.alert('Success', 'Resident added!');
        } catch (e: any) {
            console.error('Add resident error:', e.response?.data || e.message);
            Alert.alert('Error', e?.response?.data?.message || 'Failed to add resident');
        }
    };

    const handleDeleteClick = (resident: any) => {
        setItemToDelete(resident);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/admin/residents/${itemToDelete._id}`);
            setDeleteModalVisible(false);
            setItemToDelete(null);
            fetchResidents();
        } catch (error: any) {
            console.error(`Delete resident ${itemToDelete._id} error:`, error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to remove resident';
            Alert.alert('Error', errorMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderError = (msg: string) => msg ? <Text style={styles.errorText}>{msg}</Text> : null;

    if (loading) return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.onSurfaceVariant }}>Loading Residents...</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Residents</Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Total: {residents.length}</Text>
                </View>
                <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    + Add
                </Button>
            </View>

            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
                data={residents}
                keyExtractor={item => item._id || Math.random().toString()}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No residents found.</Text>}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.name || 'Unknown User'}</Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                Flat: {item.flatNumber && item.flatNumber.trim() !== '' ? item.flatNumber : 'N/A'} | {item.email}
                            </Text>
                            {item.phone ? <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.phone}</Text> : null}
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleDeleteClick(item)}
                            style={{ padding: 8, zIndex: 999 }}
                        >
                            <IconButton
                                icon="delete-outline"
                                iconColor={theme.colors.error}
                                size={24}
                                style={{ margin: 0 }}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>
                    </Surface>
                )}
            />

            <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={handleCloseModal}>
                <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ width: '100%', flex: 1, justifyContent: 'center' }}
                    >
                        <Surface style={[styles.modal, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView
                                contentContainerStyle={{ padding: 20 }}
                                keyboardShouldPersistTaps="handled"
                                bounces={false}
                                overScrollMode="never"
                            >
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            NEW RESIDENT
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Add a member to the society.
                                        </Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={handleCloseModal} />
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    <PaperInput
                                        placeholder="Full Name *"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.name}
                                        onChangeText={val => setForm({ ...form, name: val })}
                                        left={<PaperInput.Icon icon="account-outline" color={errors.name ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        outlineColor={errors.name ? theme.colors.error : theme.colors.surfaceVariant}
                                        activeOutlineColor={errors.name ? theme.colors.error : theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                        error={!!errors.name}
                                    />
                                    {renderError(errors.name)}
                                    <PaperInput
                                        placeholder="Email Address *"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="off"
                                        importantForAutofill="no"
                                        textContentType="none"
                                        value={form.email}
                                        onChangeText={val => setForm({ ...form, email: val })}
                                        left={<PaperInput.Icon icon="email-outline" color={errors.email ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        outlineColor={errors.email ? theme.colors.error : theme.colors.surfaceVariant}
                                        activeOutlineColor={errors.email ? theme.colors.error : theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                        error={!!errors.email}
                                    />
                                    {renderError(errors.email)}
                                    <PaperInput
                                        placeholder="Password *"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        secureTextEntry
                                        autoComplete="new-password"
                                        importantForAutofill="no"
                                        textContentType="none"
                                        value={form.password}
                                        onChangeText={val => setForm({ ...form, password: val })}
                                        left={<PaperInput.Icon icon="lock-outline" color={errors.password ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        outlineColor={errors.password ? theme.colors.error : theme.colors.surfaceVariant}
                                        activeOutlineColor={errors.password ? theme.colors.error : theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                        error={!!errors.password}
                                    />
                                    {renderError(errors.password)}
                                    <PaperInput
                                        placeholder="Phone Number"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        keyboardType="phone-pad"
                                        value={form.phone}
                                        onChangeText={val => setForm({ ...form, phone: val })}
                                        left={<PaperInput.Icon icon="phone-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />
                                    <PaperInput
                                        placeholder="Flat Number (e.g. A-101)"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.flatNumber}
                                        onChangeText={val => setForm({ ...form, flatNumber: val })}
                                        left={<PaperInput.Icon icon="home-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={addResident}
                                        style={styles.button}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        ADD RESIDENT
                                    </Button>

                                    <TouchableOpacity
                                        style={{ alignSelf: 'center', marginTop: 20 }}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Surface>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Custom Deletion Modal */}
            <Portal>
                <RNModal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.deleteModalOverlay}>
                        <Surface style={[styles.deleteModalContent, { backgroundColor: theme.colors.elevation.level3 }]} elevation={5}>
                            <View style={styles.deleteModalIconContainer}>
                                <MaterialIcons name="report-problem" size={40} color={theme.colors.error} />
                            </View>
                            
                            <Text variant="headlineSmall" style={styles.deleteModalTitle}>Confirm Delete</Text>
                            <Text variant="bodyMedium" style={styles.deleteModalSubtitle}>
                                Are you sure you want to remove <Text style={{fontWeight: 'bold', color: theme.colors.onSurface}}>{itemToDelete?.name}</Text>? 
                                This action cannot be undone.
                            </Text>

                            <View style={styles.deleteModalFooter}>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: { padding: 15, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 10 },
    modal: { borderRadius: 24, overflow: 'hidden', maxHeight: '95%', width: '100%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    input: {
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
    button: {
        borderRadius: 30,
        elevation: 8,
        marginTop: 10,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    buttonContent: {
        paddingVertical: 10,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 4,
        fontWeight: '600'
    },
    // Custom Deletion Modal Styles
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    deleteModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
    },
    deleteModalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    deleteModalTitle: {
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center'
    },
    deleteModalSubtitle: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 32,
        lineHeight: 20
    },
    deleteModalFooter: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    }
});

export default ManageResidents;
