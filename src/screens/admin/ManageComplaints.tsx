import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Chip } from 'react-native-paper';
import api from '../../services/api';

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('In Progress');
    const theme = useTheme();

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/admin/complaints');
            setComplaints(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitResponse = async () => {
        try {
            await api.patch(`/admin/complaints/${selected._id}/respond`, { adminResponse: response, status });
            Alert.alert('Success', 'Response sent to resident');
            setSelected(null);
            fetchComplaints();
        } catch (e) {
            Alert.alert('Error', 'Failed to respond');
        }
    };

    const getStatusColor = (s: string) => {
        if (s === 'Open') return theme.colors.error;
        if (s === 'In Progress') return '#f59e0b';
        return '#22c55e';
    };

    if (loading) return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>Complaints</Text>
            <FlatList
                data={complaints}
                keyExtractor={item => item._id}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No complaints raised.</Text>}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <TouchableOpacity onPress={() => { setSelected(item); setResponse(item.adminResponse || ''); setStatus(item.status); }}>
                            <View style={styles.cardTop}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, flex: 1 }}>{item.title}</Text>
                                <Surface style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]} elevation={0}>
                                    <Text style={styles.badgeText}>{item.status}</Text>
                                </Surface>
                            </View>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 4 }}>{item.description}</Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 4 }}>By: {item.user?.name} | Flat {item.user?.flatNumber}</Text>
                        </TouchableOpacity>
                    </Surface>
                )}
            />

            <Modal visible={!!selected} animationType="fade" transparent>
                <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modal, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Respond to Complaint</Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{selected?.title}</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 15 }}>{selected?.description}</Text>

                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Status Update</Text>
                        <View style={styles.statusRow}>
                            {['Open', 'In Progress', 'Resolved'].map(s => (
                                <Chip
                                    key={s}
                                    mode="outlined"
                                    selected={status === s}
                                    onPress={() => setStatus(s)}
                                    style={{
                                        backgroundColor: status === s ? theme.colors.primaryContainer : 'transparent',
                                        borderColor: status === s ? theme.colors.primary : theme.colors.surfaceVariant
                                    }}
                                    textStyle={{
                                        color: status === s ? theme.colors.onPrimaryContainer : theme.colors.onSurface
                                    }}
                                >
                                    {s}
                                </Chip>
                            ))}
                        </View>

                        <PaperInput
                            label="Your Response"
                            mode="outlined"
                            style={[styles.input, { height: 90, marginBottom: 15 }]}
                            placeholder="Write your response..."
                            multiline
                            numberOfLines={3}
                            value={response}
                            onChangeText={setResponse}
                            theme={{ colors: { background: 'transparent' } }}
                        />

                        <View style={styles.modalBtns}>
                            <Button mode="outlined" onPress={() => setSelected(null)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={submitResponse}>Send Response</Button>
                        </View>
                    </Surface>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontWeight: 'bold', marginBottom: 20 },
    card: { padding: 15, borderRadius: 10, marginBottom: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20 },
    modal: { borderRadius: 16, padding: 24 },
    modalTitle: { fontWeight: 'bold', marginBottom: 12 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    input: { fontSize: 15 },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
});

export default ManageComplaints;
