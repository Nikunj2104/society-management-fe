import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Chip } from 'react-native-paper';
import api from '../../services/api';

const ManageMaintenance = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ userId: '', amount: '', month: '', year: '', dueDate: '', description: '' });
    const theme = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recRes, resRes] = await Promise.all([
                api.get('/admin/maintenance'),
                api.get('/admin/residents')
            ]);
            setRecords(recRes.data);
            setResidents(resRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            await api.patch(`/admin/maintenance/${id}/pay`, { paymentMode: 'Cash' });
            fetchData();
            Alert.alert('Success', 'Marked as paid and resident notified via email');
        } catch (error) {
            Alert.alert('Error', 'Failed to update record');
        }
    };

    const handleSendReminder = async (id: string) => {
        try {
            await api.post(`/admin/maintenance/${id}/remind`);
            Alert.alert('Success', 'Reminder sent via email');
        } catch (error) {
            Alert.alert('Error', 'Failed to send reminder');
        }
    };

    const handleCreate = async () => {
        if (!form.userId || !form.amount || !form.month || !form.year || !form.dueDate) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            await api.post('/admin/maintenance', form);
            setModalVisible(false);
            setForm({ userId: '', amount: '', month: '', year: '', dueDate: '', description: '' });
            fetchData();
            Alert.alert('Success', 'Maintenance record created');
        } catch (error) {
            Alert.alert('Error', 'Failed to create record');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Society Maintenance</Text>
                <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    + Add Bill
                </Button>
            </View>

            <FlatList
                data={records}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.user?.name} ({item.user?.flatNumber})</Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.month} {item.year}</Text>
                            </View>
                            <Surface style={[styles.statusBadge, { backgroundColor: item.isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(220, 53, 69, 0.2)' }]} elevation={0}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', color: item.isPaid ? '#10b981' : theme.colors.error }}>
                                    {item.isPaid ? 'PAID' : 'UNPAID'}
                                </Text>
                            </Surface>
                        </View>
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 5 }}>₹{item.amount}</Text>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 3 }}>Due: {new Date(item.dueDate).toDateString()}</Text>

                        {!item.isPaid && (
                            <View style={styles.actions}>
                                <Button mode="contained" buttonColor="#f59e0b" onPress={() => handleSendReminder(item._id)} style={styles.actionBtn}>
                                    Remind
                                </Button>
                                <Button mode="contained" buttonColor="#10b981" onPress={() => handleMarkAsPaid(item._id)} style={styles.actionBtn}>
                                    Mark Paid
                                </Button>
                            </View>
                        )}
                    </Surface>
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceVariant }}>No records yet.</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>New Maintenance Record</Text>

                            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>Select Resident</Text>
                            <View style={styles.selectionGrid}>
                                {residents.map((r: any) => (
                                    <Chip
                                        key={r._id}
                                        mode="outlined"
                                        selected={form.userId === r._id}
                                        onPress={() => setForm({ ...form, userId: r._id })}
                                        style={{ backgroundColor: form.userId === r._id ? theme.colors.primaryContainer : 'transparent', borderColor: form.userId === r._id ? theme.colors.primary : theme.colors.surfaceVariant }}
                                        textStyle={{ color: form.userId === r._id ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
                                    >
                                        {r.name} ({r.flatNumber})
                                    </Chip>
                                ))}
                            </View>

                            <PaperInput
                                mode="outlined"
                                label="Amount (₹)"
                                keyboardType="numeric"
                                style={styles.input}
                                value={form.amount}
                                onChangeText={(text) => setForm({ ...form, amount: text })}
                                theme={{ colors: { background: 'transparent' } }}
                            />
                            <View style={styles.row}>
                                <PaperInput
                                    mode="outlined"
                                    label="Month (e.g. October)"
                                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                                    value={form.month}
                                    onChangeText={(text) => setForm({ ...form, month: text })}
                                    theme={{ colors: { background: 'transparent' } }}
                                />
                                <PaperInput
                                    mode="outlined"
                                    label="Year (e.g. 2023)"
                                    keyboardType="numeric"
                                    style={[styles.input, { flex: 1 }]}
                                    value={form.year}
                                    onChangeText={(text) => setForm({ ...form, year: text })}
                                    theme={{ colors: { background: 'transparent' } }}
                                />
                            </View>
                            <PaperInput
                                mode="outlined"
                                label="Due Date (YYYY-MM-DD)"
                                style={styles.input}
                                value={form.dueDate}
                                onChangeText={(text) => setForm({ ...form, dueDate: text })}
                                theme={{ colors: { background: 'transparent' } }}
                            />
                            <PaperInput
                                mode="outlined"
                                label="Description (optional)"
                                style={styles.input}
                                value={form.description}
                                onChangeText={(text) => setForm({ ...form, description: text })}
                                theme={{ colors: { background: 'transparent' } }}
                            />

                            <View style={styles.modalButtons}>
                                <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                                <Button mode="contained" onPress={handleCreate}>Create Bill</Button>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: { padding: 15, borderRadius: 12, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 15 },
    actionBtn: { flex: 1, borderRadius: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 15, padding: 20, maxHeight: '85%' },
    modalTitle: { fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    selectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 15 },
    input: { marginBottom: 15 },
    row: { flexDirection: 'row' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});

export default ManageMaintenance;
