import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button } from 'react-native-paper';
import api from '../../services/api';

const ManageResidents = () => {
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', flatNumber: '' });
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchResidents();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        console.log("ManageResidents mounted, fetching data...");
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        try {
            const res = await api.get('/admin/residents');
            console.log(`Fetched ${res.data?.length || 0} residents.`);
            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Fetch residents error:", e);
            setResidents([]);
        } finally {
            setLoading(false);
        }
    };

    const addResident = async () => {
        if (!form.name || !form.email || !form.password) {
            Alert.alert('Required', 'Name, Email and Password are required');
            return;
        }

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
                        <TouchableOpacity onPress={() => deleteResident(item._id)}>
                            <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Remove</Text>
                        </TouchableOpacity>
                    </Surface>
                )}
            />

            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ width: '100%' }}
                    >
                        <Surface style={[styles.modal, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            NEW RESIDENT
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Add a member to the society.
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <PaperInput.Icon icon="close" color={theme.colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Full Name"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.name}
                                        onChangeText={val => setForm({ ...form, name: val })}
                                        left={<PaperInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />
                                    <PaperInput
                                        placeholder="Email Address"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={form.email}
                                        onChangeText={val => setForm({ ...form, email: val })}
                                        left={<PaperInput.Icon icon="email-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />
                                    <PaperInput
                                        placeholder="Temporary Password"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        secureTextEntry
                                        value={form.password}
                                        onChangeText={val => setForm({ ...form, password: val })}
                                        left={<PaperInput.Icon icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />
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
                                        SAVE RESIDENT
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: { padding: 15, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 20 },
    modal: { borderRadius: 24, overflow: 'hidden', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    input: {
        marginBottom: 16,
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
});

export default ManageResidents;
