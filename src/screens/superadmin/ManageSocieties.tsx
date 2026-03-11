import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useTheme, TextInput as PaperInput, Surface, Button, IconButton } from 'react-native-paper';
import api from '../../services/api';

const ManageSocieties = () => {
    const [societies, setSocieties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({
        name: '', address: '', city: '', state: '', zipCode: '', numberOfUnits: ''
    });

    const [adminModalVisible, setAdminModalVisible] = useState(false);
    const [selectedSociety, setSelectedSociety] = useState<any>(null);
    const [adminForm, setAdminForm] = useState({
        name: '', email: '', password: '', phone: ''
    });

    const [formErrors, setFormErrors] = useState<any>({});
    const [adminFormErrors, setAdminFormErrors] = useState<any>({});

    const handleCloseSocietyModal = () => {
        setModalVisible(false);
        setForm({ name: '', address: '', city: '', state: '', zipCode: '', numberOfUnits: '' });
        setFormErrors({});
    };

    const handleCloseAdminModal = () => {
        setAdminModalVisible(false);
        setAdminForm({ name: '', email: '', password: '', phone: '' });
        setAdminFormErrors({});
        setSelectedSociety(null);
    };

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        try {
            setError(null);
            const response = await api.get('/super-admin/societies');
            setSocieties(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Failed to load societies', err);
            setError(err.response?.data?.message || 'Unauthorized or connection failed.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSocieties();
    };

    const handleCreateSociety = async () => {
        const errors: any = {};
        if (!form.name.trim()) errors.name = 'Society name is required';
        if (!form.city.trim()) errors.city = 'City is required';
        if (!form.state.trim()) errors.state = 'State is required';
        if (!form.numberOfUnits.trim()) errors.numberOfUnits = 'Required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        const trimmedForm = {
            name: form.name.trim(), address: form.address.trim(), city: form.city.trim(),
            state: form.state.trim(), zipCode: form.zipCode.trim(), numberOfUnits: form.numberOfUnits.trim(),
        };

        try {
            await api.post('/super-admin/societies', { ...trimmedForm, numberOfUnits: parseInt(trimmedForm.numberOfUnits) });
            Alert.alert('Success', 'Society created successfully');
            handleCloseSocietyModal();
            fetchSocieties();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create society');
        }
    };

    const handleAddAdmin = async () => {
        const errors: any = {};
        if (!adminForm.name.trim()) errors.name = 'Admin name is required';
        if (!adminForm.email.trim()) errors.email = 'Email is required';
        if (!adminForm.password.trim()) errors.password = 'Password is required';
        
        if (Object.keys(errors).length > 0) {
            setAdminFormErrors(errors);
            return;
        }

        setAdminFormErrors({});
        const trimmedAdminForm = {
            name: adminForm.name.trim(), email: adminForm.email.trim().toLowerCase(),
            password: adminForm.password.trim(), phone: adminForm.phone.trim()
        };

        try {
            await api.post('/super-admin/admins', { ...trimmedAdminForm, societyId: selectedSociety._id });
            Alert.alert('Success', 'Admin added successfully');
            handleCloseAdminModal();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add admin');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/super-admin/societies/${id}/status`);
            fetchSocieties();
            Alert.alert('Success', `Society marked as ${!currentStatus ? 'Active' : 'Blocked'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update society status');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const renderError = (msg: string) => msg ? <Text style={styles.errorText}>{msg}</Text> : null;

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{item.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.city}, {item.state}</Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>Units: {item.numberOfUnits}</Text>

                <TouchableOpacity style={styles.addAdminLink} onPress={() => { setSelectedSociety(item); setAdminModalVisible(true); }}>
                    <MaterialIcons name="person-add" size={16} color={theme.colors.primary} />
                    <Text style={[styles.addAdminText, { color: theme.colors.primary }]}>Add Admin</Text>
                </TouchableOpacity>
            </View>
            <Button
                mode="contained"
                buttonColor={item.isActive ? '#28a745' : theme.colors.error}
                textColor="#fff"
                labelStyle={{ fontSize: 12, marginHorizontal: 10, marginVertical: 4 }}
                style={{ borderRadius: 20 }}
                onPress={() => toggleStatus(item._id, item.isActive)}
            >
                {item.isActive ? 'Active' : 'Blocked'}
            </Button>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>All Societies</Text>
                <Button mode="contained" icon="plus" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    Add Society
                </Button>
            </View>

            <FlatList
                data={societies}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {error ? (
                            <>
                                <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
                                <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 10, textAlign: 'center' }}>
                                    {error}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                                    Your session might have expired. Please try logout and login.
                                </Text>
                            </>
                        ) : (
                            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>No societies created yet.</Text>
                        )}
                    </View>
                }
            />

            {/* Create Society Modal */}
            <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={handleCloseSocietyModal}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            NEW SOCIETY
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Onboard a new community.
                                        </Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={handleCloseSocietyModal} />
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Society Name *"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={[styles.input, formErrors.name && styles.inputError]}
                                        outlineStyle={styles.inputOutline}
                                        value={form.name}
                                        onChangeText={t => setForm({ ...form, name: t })}
                                        left={<PaperInput.Icon icon="office-building" color={formErrors.name ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        outlineColor={formErrors.name ? theme.colors.error : theme.colors.surfaceVariant}
                                        activeOutlineColor={formErrors.name ? theme.colors.error : theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                        error={!!formErrors.name}
                                    />
                                    {renderError(formErrors.name)}

                                    <PaperInput
                                        placeholder="Full Address"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={2}
                                        style={[styles.input, { height: 80, paddingTop: 8 }]}
                                        outlineStyle={styles.inputOutline}
                                        value={form.address}
                                        onChangeText={t => setForm({ ...form, address: t })}
                                        left={<PaperInput.Icon icon="map-marker-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <View style={styles.rowPremium}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <PaperInput
                                                placeholder="City *"
                                                mode="outlined"
                                                style={[styles.input, formErrors.city && styles.inputError]}
                                                outlineStyle={styles.inputOutline}
                                                value={form.city}
                                                onChangeText={t => setForm({ ...form, city: t })}
                                                outlineColor={formErrors.city ? theme.colors.error : theme.colors.surfaceVariant}
                                                activeOutlineColor={formErrors.city ? theme.colors.error : theme.colors.primary}
                                                error={!!formErrors.city}
                                            />
                                            {renderError(formErrors.city)}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <PaperInput
                                                placeholder="State *"
                                                mode="outlined"
                                                style={[styles.input, formErrors.state && styles.inputError]}
                                                outlineStyle={styles.inputOutline}
                                                value={form.state}
                                                onChangeText={t => setForm({ ...form, state: t })}
                                                outlineColor={formErrors.state ? theme.colors.error : theme.colors.surfaceVariant}
                                                activeOutlineColor={formErrors.state ? theme.colors.error : theme.colors.primary}
                                                error={!!formErrors.state}
                                            />
                                            {renderError(formErrors.state)}
                                        </View>
                                    </View>

                                    <View style={styles.rowPremium}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <PaperInput
                                                placeholder="Zip Code"
                                                keyboardType="numeric"
                                                mode="outlined"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                                value={form.zipCode}
                                                onChangeText={t => setForm({ ...form, zipCode: t })}
                                                outlineColor={theme.colors.surfaceVariant}
                                                activeOutlineColor={theme.colors.primary}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <PaperInput
                                                placeholder="Units *"
                                                keyboardType="numeric"
                                                mode="outlined"
                                                style={[styles.input, formErrors.numberOfUnits && styles.inputError]}
                                                outlineStyle={styles.inputOutline}
                                                value={form.numberOfUnits}
                                                onChangeText={t => setForm({ ...form, numberOfUnits: t })}
                                                outlineColor={formErrors.numberOfUnits ? theme.colors.error : theme.colors.surfaceVariant}
                                                activeOutlineColor={formErrors.numberOfUnits ? theme.colors.error : theme.colors.primary}
                                                error={!!formErrors.numberOfUnits}
                                            />
                                            {renderError(formErrors.numberOfUnits)}
                                        </View>
                                    </View>

                                    <Button
                                        mode="contained"
                                        onPress={handleCreateSociety}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        CREATE SOCIETY
                                    </Button>

                                    <TouchableOpacity
                                        style={{ alignSelf: 'center', marginTop: 20 }}
                                        onPress={handleCloseSocietyModal}
                                    >
                                        <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Surface>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Add Admin Modal */}
            <Modal visible={adminModalVisible} animationType="fade" transparent={true} onRequestClose={handleCloseAdminModal}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            SOCIETY ADMIN
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Assign manager for {selectedSociety?.name}.
                                        </Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={handleCloseAdminModal} />
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Admin Full Name *"
                                        mode="outlined"
                                        style={[styles.input, adminFormErrors.name && styles.inputError]}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.name}
                                        onChangeText={t => setAdminForm({ ...adminForm, name: t })}
                                        left={<PaperInput.Icon icon="account" color={adminFormErrors.name ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        error={!!adminFormErrors.name}
                                    />
                                    {renderError(adminFormErrors.name)}

                                    <PaperInput
                                        placeholder="Email Address *"
                                        mode="outlined"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        textContentType="none"
                                        importantForAutofill="noExcludeDescendants"
                                        style={[styles.input, adminFormErrors.email && styles.inputError]}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.email}
                                        onChangeText={t => setAdminForm({ ...adminForm, email: t })}
                                        left={<PaperInput.Icon icon="email" color={adminFormErrors.email ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        error={!!adminFormErrors.email}
                                    />
                                    {renderError(adminFormErrors.email)}

                                    <PaperInput
                                        placeholder="Phone Number"
                                        mode="outlined"
                                        keyboardType="phone-pad"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.phone}
                                        onChangeText={t => setAdminForm({ ...adminForm, phone: t })}
                                        left={<PaperInput.Icon icon="phone" color={theme.colors.onSurfaceVariant} />}
                                    />

                                    <PaperInput
                                        placeholder="Secure Password *"
                                        mode="outlined"
                                        secureTextEntry
                                        autoComplete="new-password"
                                        textContentType="none"
                                        importantForAutofill="noExcludeDescendants"
                                        style={[styles.input, adminFormErrors.password && styles.inputError]}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.password}
                                        onChangeText={t => setAdminForm({ ...adminForm, password: t })}
                                        left={<PaperInput.Icon icon="lock" color={adminFormErrors.password ? theme.colors.error : theme.colors.onSurfaceVariant} />}
                                        error={!!adminFormErrors.password}
                                    />
                                    {renderError(adminFormErrors.password)}

                                    <Button
                                        mode="contained"
                                        onPress={handleAddAdmin}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        Add Admin
                                    </Button>

                                    <TouchableOpacity
                                        style={{ alignSelf: 'center', marginTop: 20 }}
                                        onPress={handleCloseAdminModal}
                                    >
                                        <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Surface>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addAdminLink: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    addAdminText: { fontWeight: 'bold', marginLeft: 4, fontSize: 13 },

    // Premium Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 20 },
    modalContent: { borderRadius: 24, overflow: 'hidden', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    input: {
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
    rowPremium: { flexDirection: 'row' },
    postButton: {
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
    emptyContainer: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20 },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 4,
        fontWeight: '600'
    },
    inputError: {
        marginBottom: 16,
    }
});

export default ManageSocieties;
