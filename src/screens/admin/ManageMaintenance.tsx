import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Chip, IconButton } from 'react-native-paper';
import api from '../../services/api';

const ManageMaintenance = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [form, setForm] = useState({ userId: '', amount: '', month: '', year: '', dueDate: '', description: '' });
    const [bulkForm, setBulkForm] = useState({ amount: '', month: '', year: '', dueDate: '', description: '' });
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

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

    const handleBulkGenerate = async () => {
        if (!bulkForm.amount || !bulkForm.month || !bulkForm.year || !bulkForm.dueDate) {
            Alert.alert('Error', 'Amount, Month, Year and Due Date are required');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await api.post('/admin/maintenance/bulk-generate', bulkForm);
            Alert.alert('Success', res.data.message);
            setBulkModalVisible(false);
            setBulkForm({ amount: '', month: '', year: '', dueDate: '', description: '' });
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to generate bulk bills');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkRemind = async () => {
        Alert.alert(
            'Confirm Bulk Reminder',
            'This will send email and in-app notifications to ALL residents with unpaid records. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send to All',
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            const res = await api.post('/admin/maintenance/bulk-remind');
                            Alert.alert('Success', res.data.message);
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to send bulk reminders');
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
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
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <IconButton 
                        icon="bell-ring" 
                        mode="contained" 
                        containerColor="rgba(245, 158, 11, 0.2)" 
                        iconColor="#f59e0b"
                        onPress={handleBulkRemind}
                        disabled={isProcessing}
                    />
                    <Button 
                        mode="contained" 
                        onPress={() => setBulkModalVisible(true)} 
                        buttonColor="rgba(0, 200, 83, 0.2)"
                        textColor="#00C853"
                        style={{ borderWidth: 1, borderColor: '#00C853' }}
                    >
                        Bulk
                    </Button>
                    <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                        + Add
                    </Button>
                </View>
            </View>

            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
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

            <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ width: '100%', flex: 1, justifyContent: 'center' }}
                    >
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            NEW BILL
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Generate maintenance record.
                                        </Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={() => setModalVisible(false)} />
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 15, fontWeight: '700' }}>SELECT RESIDENT</Text>
                                    <View style={styles.selectionGridPremium}>
                                        {residents.map((r: any) => (
                                            <Chip
                                                key={r._id}
                                                mode="outlined"
                                                selected={form.userId === r._id}
                                                onPress={() => setForm({ ...form, userId: r._id })}
                                                style={{
                                                    backgroundColor: form.userId === r._id ? theme.colors.primary : '#1a1a1a',
                                                    borderColor: form.userId === r._id ? theme.colors.primary : '#333'
                                                }}
                                                textStyle={{ color: form.userId === r._id ? theme.colors.onPrimary : theme.colors.onSurface }}
                                            >
                                                {r.name} ({r.flatNumber})
                                            </Chip>
                                        ))}
                                    </View>

                                    <PaperInput
                                        placeholder="Amount (₹)"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.amount}
                                        onChangeText={(text) => setForm({ ...form, amount: text })}
                                        left={<PaperInput.Icon icon="currency-inr" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <View style={styles.rowPremium}>
                                        <PaperInput
                                            placeholder="Month"
                                            placeholderTextColor={theme.colors.onSurfaceVariant}
                                            mode="outlined"
                                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.month}
                                            onChangeText={(text) => setForm({ ...form, month: text })}
                                            left={<PaperInput.Icon icon="calendar-month" color={theme.colors.onSurfaceVariant} />}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                            textColor={theme.colors.onSurface}
                                        />
                                        <PaperInput
                                            placeholder="Year"
                                            placeholderTextColor={theme.colors.onSurfaceVariant}
                                            mode="outlined"
                                            keyboardType="numeric"
                                            style={[styles.input, { flex: 1 }]}
                                            outlineStyle={styles.inputOutline}
                                            value={form.year}
                                            onChangeText={(text) => setForm({ ...form, year: text })}
                                            left={<PaperInput.Icon icon="calendar-range" color={theme.colors.onSurfaceVariant} />}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                            textColor={theme.colors.onSurface}
                                        />
                                    </View>

                                    <PaperInput
                                        placeholder="Due Date (YYYY-MM-DD)"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.dueDate}
                                        onChangeText={(text) => setForm({ ...form, dueDate: text })}
                                        left={<PaperInput.Icon icon="calendar-clock" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <PaperInput
                                        placeholder="Description (optional)"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.description}
                                        onChangeText={(text) => setForm({ ...form, description: text })}
                                        left={<PaperInput.Icon icon="note-text-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleCreate}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        GENERATE BILL
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

            {/* Bulk Bill Modal */}
            <Modal visible={bulkModalVisible} animationType="fade" transparent onRequestClose={() => setBulkModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', flex: 1, justifyContent: 'center' }}>
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }}>
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: '#00C853', fontWeight: '900', letterSpacing: -1 }}>BULK GENERATE</Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>For all society residents.</Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={() => setBulkModalVisible(false)} />
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    <PaperInput
                                        placeholder="Amount (₹)"
                                        mode="outlined"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        value={bulkForm.amount}
                                        onChangeText={(text) => setBulkForm({ ...bulkForm, amount: text })}
                                        left={<PaperInput.Icon icon="currency-inr" />}
                                    />
                                    <View style={styles.rowPremium}>
                                        <PaperInput
                                            placeholder="Month"
                                            mode="outlined"
                                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                                            value={bulkForm.month}
                                            onChangeText={(text) => setBulkForm({ ...bulkForm, month: text })}
                                        />
                                        <PaperInput
                                            placeholder="Year"
                                            mode="outlined"
                                            keyboardType="numeric"
                                            style={[styles.input, { flex: 1 }]}
                                            value={bulkForm.year}
                                            onChangeText={(text) => setBulkForm({ ...bulkForm, year: text })}
                                        />
                                    </View>
                                    <PaperInput
                                        placeholder="Due Date (YYYY-MM-DD)"
                                        mode="outlined"
                                        style={styles.input}
                                        value={bulkForm.dueDate}
                                        onChangeText={(text) => setBulkForm({ ...bulkForm, dueDate: text })}
                                        left={<PaperInput.Icon icon="calendar-clock" />}
                                    />
                                    <PaperInput
                                        placeholder="Description (optional)"
                                        mode="outlined"
                                        style={styles.input}
                                        value={bulkForm.description}
                                        onChangeText={(text) => setBulkForm({ ...bulkForm, description: text })}
                                        left={<PaperInput.Icon icon="note-text-outline" />}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleBulkGenerate}
                                        loading={isProcessing}
                                        style={[styles.postButton, { backgroundColor: '#00C853' }]}
                                        contentStyle={styles.buttonContent}
                                    >
                                        GENERATE FOR ALL
                                    </Button>
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
    card: { padding: 15, borderRadius: 12, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 15 },
    actionBtn: { flex: 1, borderRadius: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 20 },
    modalContent: { borderRadius: 24, overflow: 'hidden', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    selectionGridPremium: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
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
    }
});

export default ManageMaintenance;
