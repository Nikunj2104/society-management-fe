import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button } from 'react-native-paper';
import api from '../../services/api';

const ManageResidents = () => {
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', flatNumber: '' });
    const theme = useTheme();

    useEffect(() => { fetchResidents(); }, []);

    const fetchResidents = async () => {
        try {
            const res = await api.get('/admin/residents');
            setResidents(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const addResident = async () => {
        try {
            await api.post('/admin/residents', form);
            setModalVisible(false);
            setForm({ name: '', email: '', password: '', phone: '', flatNumber: '' });
            fetchResidents();
            Alert.alert('Success', 'Resident added!');
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to add resident');
        }
    };

    const deleteResident = (id: string) => {
        Alert.alert('Confirm', 'Delete this resident?', [
            { text: 'Cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await api.delete(`/admin/residents/${id}`);
                    fetchResidents();
                }
            }
        ]);
    };

    if (loading) return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Residents</Text>
                <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    + Add
                </Button>
            </View>

            <FlatList
                data={residents}
                keyExtractor={item => item._id}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No residents yet.</Text>}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.name}</Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>Flat: {item.flatNumber || 'N/A'} | {item.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteResident(item._id)}>
                            <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Remove</Text>
                        </TouchableOpacity>
                    </Surface>
                )}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modal, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Add Resident</Text>

                        <PaperInput mode="outlined" label="Name" style={styles.input} value={form.name} onChangeText={val => setForm({ ...form, name: val })} theme={{ colors: { background: 'transparent' } }} />
                        <PaperInput mode="outlined" label="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={val => setForm({ ...form, email: val })} theme={{ colors: { background: 'transparent' } }} />
                        <PaperInput mode="outlined" label="Password" style={styles.input} secureTextEntry value={form.password} onChangeText={val => setForm({ ...form, password: val })} theme={{ colors: { background: 'transparent' } }} />
                        <PaperInput mode="outlined" label="Phone" style={styles.input} keyboardType="phone-pad" value={form.phone} onChangeText={val => setForm({ ...form, phone: val })} theme={{ colors: { background: 'transparent' } }} />
                        <PaperInput mode="outlined" label="Flat Number" style={styles.input} value={form.flatNumber} onChangeText={val => setForm({ ...form, flatNumber: val })} theme={{ colors: { background: 'transparent' } }} />

                        <View style={styles.modalBtns}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={addResident}>Save</Button>
                        </View>
                    </Surface>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: { padding: 15, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20 },
    modal: { borderRadius: 16, padding: 24 },
    modalTitle: { fontWeight: 'bold', marginBottom: 16 },
    input: { marginBottom: 12 },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
});

export default ManageResidents;
