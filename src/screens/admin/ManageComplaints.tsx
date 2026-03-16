import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, RefreshControl, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Chip, IconButton } from 'react-native-paper';
import api from '../../services/api';

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('In Progress');
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchComplaints();
        setRefreshing(false);
    }, []);

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
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Complaints</Text>
            </View>
            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
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

            <Modal visible={!!selected} animationType="fade" transparent onRequestClose={() => setSelected(null)}>
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
                                            RESPOND
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Address resident concerns.
                                        </Text>
                                    </View>
                                    <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={() => setSelected(null)} />
                                </View>

                                <View style={styles.complaintDetails}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{selected?.title}</Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{selected?.description}</Text>
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 15, fontWeight: '700' }}>UPDATE STATUS</Text>
                                    <View style={styles.statusGridPremium}>
                                        {['Open', 'In Progress', 'Resolved'].map(s => (
                                            <Chip
                                                key={s}
                                                mode="outlined"
                                                selected={status === s}
                                                onPress={() => setStatus(s)}
                                                style={{
                                                    backgroundColor: status === s ? theme.colors.primary : '#1a1a1a',
                                                    borderColor: status === s ? theme.colors.primary : '#333'
                                                }}
                                                textStyle={{
                                                    color: status === s ? theme.colors.onPrimary : theme.colors.onSurface
                                                }}
                                            >
                                                {s}
                                            </Chip>
                                        ))}
                                    </View>

                                    <PaperInput
                                        placeholder="Write your response to the resident..."
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={5}
                                        style={[styles.input, { height: 120, paddingTop: 10 }]}
                                        outlineStyle={styles.inputOutline}
                                        value={response}
                                        onChangeText={setResponse}
                                        left={<PaperInput.Icon icon="comment-text-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={submitResponse}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        SEND RESPONSE
                                    </Button>

                                    <TouchableOpacity
                                        style={{ alignSelf: 'center', marginTop: 20 }}
                                        onPress={() => setSelected(null)}
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
    header: { marginBottom: 20 },
    card: { padding: 15, borderRadius: 10, marginBottom: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 20 },
    modalContent: { borderRadius: 24, overflow: 'hidden', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    complaintDetails: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    statusGridPremium: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    input: {
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
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

export default ManageComplaints;
