import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useTheme, TextInput as PaperInput, Surface, Button } from 'react-native-paper';
import api from '../../services/api';

const ManageSocieties = () => {
    const [societies, setSocieties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        try {
            const response = await api.get('/super-admin/societies');
            setSocieties(response.data);
        } catch (error) {
            console.error('Failed to load societies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSociety = async () => {
        const trimmedForm = {
            name: form.name.trim(), address: form.address.trim(), city: form.city.trim(),
            state: form.state.trim(), zipCode: form.zipCode.trim(), numberOfUnits: form.numberOfUnits.trim(),
        };

        if (!trimmedForm.name || !trimmedForm.city || !trimmedForm.state || !trimmedForm.numberOfUnits) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            await api.post('/super-admin/societies', { ...trimmedForm, numberOfUnits: parseInt(trimmedForm.numberOfUnits) });
            Alert.alert('Success', 'Society created successfully');
            setModalVisible(false);
            setForm({ name: '', address: '', city: '', state: '', zipCode: '', numberOfUnits: '' });
            fetchSocieties();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create society');
        }
    };

    const handleAddAdmin = async () => {
        const trimmedAdminForm = {
            name: adminForm.name.trim(), email: adminForm.email.trim().toLowerCase(),
            password: adminForm.password.trim(), phone: adminForm.phone.trim()
        };

        if (!trimmedAdminForm.name || !trimmedAdminForm.email || !trimmedAdminForm.password || !selectedSociety) {
            Alert.alert('Error', 'Please fill all required fields (Name, Email, Password)');
            return;
        }

        try {
            await api.post('/super-admin/admins', { ...trimmedAdminForm, societyId: selectedSociety._id });
            Alert.alert('Success', 'Admin added successfully');
            setAdminModalVisible(false);
            setAdminForm({ name: '', email: '', password: '', phone: '' });
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
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceVariant }}>No societies created yet.</Text>}
            />

            {/* Create Society Modal */}
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
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
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <PaperInput.Icon icon="close" color={theme.colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Society Name"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.name}
                                        onChangeText={t => setForm({ ...form, name: t })}
                                        left={<PaperInput.Icon icon="office-building" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />
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
                                        <PaperInput
                                            placeholder="City"
                                            mode="outlined"
                                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.city}
                                            onChangeText={t => setForm({ ...form, city: t })}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                        <PaperInput
                                            placeholder="State"
                                            mode="outlined"
                                            style={[styles.input, { flex: 1 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.state}
                                            onChangeText={t => setForm({ ...form, state: t })}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                    </View>
                                    <View style={styles.rowPremium}>
                                        <PaperInput
                                            placeholder="Zip"
                                            keyboardType="numeric"
                                            mode="outlined"
                                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.zipCode}
                                            onChangeText={t => setForm({ ...form, zipCode: t })}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                        <PaperInput
                                            placeholder="Units"
                                            keyboardType="numeric"
                                            mode="outlined"
                                            style={[styles.input, { flex: 1 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.numberOfUnits}
                                            onChangeText={t => setForm({ ...form, numberOfUnits: t })}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                        />
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

            {/* Add Admin Modal */}
            <Modal visible={adminModalVisible} animationType="fade" transparent={true}>
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
                                    <TouchableOpacity onPress={() => setAdminModalVisible(false)}>
                                        <PaperInput.Icon icon="close" color={theme.colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Admin Full Name"
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.name}
                                        onChangeText={t => setAdminForm({ ...adminForm, name: t })}
                                        left={<PaperInput.Icon icon="account" color={theme.colors.onSurfaceVariant} />}
                                    />
                                    <PaperInput
                                        placeholder="Email Address"
                                        mode="outlined"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.email}
                                        onChangeText={t => setAdminForm({ ...adminForm, email: t })}
                                        left={<PaperInput.Icon icon="email" color={theme.colors.onSurfaceVariant} />}
                                    />
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
                                        placeholder="Secure Password"
                                        mode="outlined"
                                        secureTextEntry
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={adminForm.password}
                                        onChangeText={t => setAdminForm({ ...adminForm, password: t })}
                                        left={<PaperInput.Icon icon="lock" color={theme.colors.onSurfaceVariant} />}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleAddAdmin}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        APPOINT ADMIN
                                    </Button>

                                    <TouchableOpacity
                                        style={{ alignSelf: 'center', marginTop: 20 }}
                                        onPress={() => setAdminModalVisible(false)}
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
});

export default ManageSocieties;
