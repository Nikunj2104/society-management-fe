import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl } from 'react-native';
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

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchComplaints();
        setRefreshing(false);
    }, []);

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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
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
                        <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface, fontWeight: 'bold' }]}>Raise Complaint</Text>

                        <PaperInput
                            placeholder="Title"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            mode="outlined"
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={form.title}
                            onChangeText={v => setForm({ ...form, title: v })}
                            left={<PaperInput.Icon icon="pencil-outline" color={theme.colors.onSurfaceVariant} />}
                            outlineColor={theme.colors.surfaceVariant}
                            activeOutlineColor={theme.colors.primary}
                            textColor={theme.colors.onSurface}
                        />
                        <PaperInput
                            placeholder="Describe the issue..."
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            mode="outlined"
                            style={[styles.input, { height: 90, paddingTop: 4 }]}
                            outlineStyle={styles.inputOutline}
                            multiline
                            numberOfLines={3}
                            value={form.description}
                            onChangeText={v => setForm({ ...form, description: v })}
                            outlineColor={theme.colors.surfaceVariant}
                            activeOutlineColor={theme.colors.primary}
                            textColor={theme.colors.onSurface}
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
                            <Button
                                mode="outlined"
                                onPress={() => setModalVisible(false)}
                                theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }}
                                style={[styles.cancelButton, { marginRight: 10 }]}
                                contentStyle={styles.buttonContent}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={submitComplaint}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                buttonColor={theme.colors.primary}
                                textColor={theme.colors.onPrimary}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                            >
                                SUBMIT
                            </Button>
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
    modal: { borderRadius: 24, padding: 24 },
    modalTitle: { fontWeight: 'bold', marginBottom: 24 },
    input: {
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    cancelButton: {
        flex: 1,
        borderRadius: 30,
        borderColor: '#333',
    },
    button: {
        flex: 1,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});

export default MyComplaints;
