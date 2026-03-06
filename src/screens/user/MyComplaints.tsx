import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Chip } from 'react-native-paper';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const MyComplaints = () => {
    const { user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: 'General' });
    const theme = useTheme();

    const categories = ['General', 'Maintenance', 'Security', 'Noise', 'Water', 'Electricity', 'Other'];

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/user/complaints');
            setComplaints(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitComplaint = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            Alert.alert('Validation', 'Title and description are required');
            return;
        }
        try {
            await api.post('/user/complaints', form);
            setModalVisible(false);
            setForm({ title: '', description: '', category: 'General' });
            fetchComplaints();
            Alert.alert('Success', 'Complaint submitted successfully');
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to submit complaint');
        }
    };

    const getStatusColor = (s: string) => {
        if (s === 'Open') return theme.colors.error;
        if (s === 'In Progress') return '#f59e0b';
        return '#22c55e';
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
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>My Complaints</Text>
                <Button
                    mode="contained"
                    buttonColor={!user?.society ? theme.colors.surfaceDisabled : theme.colors.primary}
                    textColor={!user?.society ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary}
                    onPress={() => {
                        if (!user?.society) {
                            Alert.alert('Access Denied', 'You must be linked to a society to raise complaints.');
                        } else {
                            setModalVisible(true);
                        }
                    }}
                >
                    + Raise
                </Button>
            </View>

            <FlatList
                data={complaints}
                keyExtractor={item => item._id}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No complaints raised yet.</Text>}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.cardTop}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, flex: 1 }}>{item.title}</Text>
                            <Surface style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]} elevation={0}>
                                <Text style={styles.badgeText}>{item.status}</Text>
                            </Surface>
                        </View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>{item.description}</Text>
                        {item.adminResponse ? (
                            <Surface style={[styles.responseBox, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                                <Text variant="labelMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>Admin Response:</Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{item.adminResponse}</Text>
                            </Surface>
                        ) : null}
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>{new Date(item.createdAt).toDateString()}</Text>
                    </Surface>
                )}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modal, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Raise Complaint</Text>

                        <PaperInput
                            label="Title"
                            mode="outlined"
                            style={styles.input}
                            value={form.title}
                            onChangeText={v => setForm({ ...form, title: v })}
                            theme={{ colors: { background: 'transparent' } }}
                        />
                        <PaperInput
                            label="Describe the issue..."
                            mode="outlined"
                            style={[styles.input, { height: 90 }]}
                            multiline
                            numberOfLines={3}
                            value={form.description}
                            onChangeText={v => setForm({ ...form, description: v })}
                            theme={{ colors: { background: 'transparent' } }}
                        />

                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>Category</Text>
                        <View style={styles.categoryRow}>
                            {categories.map(c => (
                                <Chip
                                    key={c}
                                    mode="outlined"
                                    selected={form.category === c}
                                    onPress={() => setForm({ ...form, category: c })}
                                    style={{ backgroundColor: form.category === c ? theme.colors.primaryContainer : 'transparent', borderColor: form.category === c ? theme.colors.primary : theme.colors.surfaceVariant }}
                                    textStyle={{ color: form.category === c ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
                                >
                                    {c}
                                </Chip>
                            ))}
                        </View>

                        <View style={styles.modalBtns}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={submitComplaint}>Submit</Button>
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
    card: { padding: 15, borderRadius: 10, marginBottom: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    responseBox: { padding: 10, borderRadius: 8, marginTop: 6 },
    backdrop: { flex: 1, justifyContent: 'center', padding: 20 },
    modal: { borderRadius: 16, padding: 24 },
    modalTitle: { fontWeight: 'bold', marginBottom: 12 },
    input: { marginBottom: 12 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});

export default MyComplaints;
