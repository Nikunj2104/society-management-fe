import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
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
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Create New Society</Text>

                            <PaperInput label="Society Name" mode="outlined" style={styles.input} value={form.name} onChangeText={t => setForm({ ...form, name: t })} theme={{ colors: { background: 'transparent' } }} />
                            <PaperInput label="Address" mode="outlined" style={styles.input} value={form.address} onChangeText={t => setForm({ ...form, address: t })} theme={{ colors: { background: 'transparent' } }} />

                            <View style={styles.row}>
                                <PaperInput label="City" mode="outlined" style={[styles.input, { flex: 1, marginRight: 10 }]} value={form.city} onChangeText={t => setForm({ ...form, city: t })} theme={{ colors: { background: 'transparent' } }} />
                                <PaperInput label="State" mode="outlined" style={[styles.input, { flex: 1 }]} value={form.state} onChangeText={t => setForm({ ...form, state: t })} theme={{ colors: { background: 'transparent' } }} />
                            </View>
                            <View style={styles.row}>
                                <PaperInput label="Zip Code" mode="outlined" keyboardType="numeric" style={[styles.input, { flex: 1, marginRight: 10 }]} value={form.zipCode} onChangeText={t => setForm({ ...form, zipCode: t })} theme={{ colors: { background: 'transparent' } }} />
                                <PaperInput label="Total Units" mode="outlined" keyboardType="numeric" style={[styles.input, { flex: 1 }]} value={form.numberOfUnits} onChangeText={t => setForm({ ...form, numberOfUnits: t })} theme={{ colors: { background: 'transparent' } }} />
                            </View>

                            <View style={styles.modalButtons}>
                                <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                                <Button mode="contained" onPress={handleCreateSociety}>Create</Button>
                            </View>
                        </ScrollView>
                    </Surface>
                </View>
            </Modal>

            {/* Add Admin Modal */}
            <Modal visible={adminModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAdminModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add Admin to {selectedSociety?.name}</Text>

                            <PaperInput label="Admin Name" mode="outlined" style={styles.input} value={adminForm.name} onChangeText={t => setAdminForm({ ...adminForm, name: t })} theme={{ colors: { background: 'transparent' } }} />
                            <PaperInput label="Admin Email" mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} value={adminForm.email} onChangeText={t => setAdminForm({ ...adminForm, email: t })} theme={{ colors: { background: 'transparent' } }} />
                            <PaperInput label="Admin Phone" mode="outlined" keyboardType="phone-pad" style={styles.input} value={adminForm.phone} onChangeText={t => setAdminForm({ ...adminForm, phone: t })} theme={{ colors: { background: 'transparent' } }} />
                            <PaperInput label="Initial Password" mode="outlined" secureTextEntry style={styles.input} value={adminForm.password} onChangeText={t => setAdminForm({ ...adminForm, password: t })} theme={{ colors: { background: 'transparent' } }} />

                            <View style={styles.modalButtons}>
                                <Button mode="outlined" onPress={() => setAdminModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                                <Button mode="contained" onPress={handleAddAdmin}>Add Admin</Button>
                            </View>
                        </ScrollView>
                    </Surface>
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

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 16, padding: 24, maxHeight: '85%' },
    modalTitle: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 15, fontSize: 16 },
    row: { flexDirection: 'row' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }
});

export default ManageSocieties;
