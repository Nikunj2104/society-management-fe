import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Switch } from 'react-native-paper';
import api from '../../services/api';

const ManageEvents = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', eventDate: '', isFestival: false, festivalName: '' });
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/admin/events');
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.title || !form.eventDate) {
            Alert.alert('Error', 'Please fill standard fields');
            return;
        }

        try {
            await api.post('/admin/events', form);
            setModalVisible(false);
            setForm({ title: '', description: '', eventDate: '', isFestival: false, festivalName: '' });
            fetchEvents();
            Alert.alert('Success', 'Event created');
        } catch (error) {
            Alert.alert('Error', 'Failed to create event');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/events/${id}`);
                        fetchEvents();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
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
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Society Events</Text>
                <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    + New
                </Button>
            </View>

            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
                data={events}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                {item.isFestival ? `🎉 ${item.title}` : `📅 ${item.title}`}
                            </Text>
                            <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>{item.description}</Text>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>Date: {new Date(item.eventDate).toDateString()}</Text>
                        {item.isFestival && <Text variant="labelSmall" style={[styles.festName, { color: theme.colors.primary }]}>Festival: {item.festivalName}</Text>}
                    </Surface>
                )}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No events yet.</Text>}
            />

            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ width: '100%' }}
                    >
                        <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                                            NEW EVENT
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Organize a community gathering.
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <PaperInput.Icon icon="close" color={theme.colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 30 }}>
                                    <PaperInput
                                        placeholder="Event Title"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.title}
                                        onChangeText={(text) => setForm({ ...form, title: text })}
                                        left={<PaperInput.Icon icon="calendar-check-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <PaperInput
                                        placeholder="Description"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={3}
                                        style={[styles.input, { minHeight: 80, paddingTop: 8 }]}
                                        outlineStyle={styles.inputOutline}
                                        value={form.description}
                                        onChangeText={(text) => setForm({ ...form, description: text })}
                                        left={<PaperInput.Icon icon="text-subject" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <PaperInput
                                        placeholder="Date (YYYY-MM-DD)"
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        value={form.eventDate}
                                        onChangeText={(text) => setForm({ ...form, eventDate: text })}
                                        left={<PaperInput.Icon icon="clock-outline" color={theme.colors.onSurfaceVariant} />}
                                        outlineColor={theme.colors.surfaceVariant}
                                        activeOutlineColor={theme.colors.primary}
                                        textColor={theme.colors.onSurface}
                                    />

                                    <View style={styles.switchRowPremium}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <PaperInput.Icon icon="party-popper" color={theme.colors.primary} />
                                            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>Is this a Festival?</Text>
                                        </View>
                                        <Switch
                                            value={form.isFestival}
                                            onValueChange={(val) => setForm({ ...form, isFestival: val })}
                                            color={theme.colors.primary}
                                        />
                                    </View>

                                    {form.isFestival && (
                                        <PaperInput
                                            placeholder="Festival Name (e.g. Holi)"
                                            placeholderTextColor={theme.colors.onSurfaceVariant}
                                            mode="outlined"
                                            style={styles.input}
                                            outlineStyle={styles.inputOutline}
                                            value={form.festivalName}
                                            onChangeText={(text) => setForm({ ...form, festivalName: text })}
                                            left={<PaperInput.Icon icon="star-outline" color={theme.colors.primary} />}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                            textColor={theme.colors.onSurface}
                                        />
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={handleCreate}
                                        style={styles.postButton}
                                        contentStyle={styles.buttonContent}
                                        buttonColor={theme.colors.primary}
                                        textColor={theme.colors.onPrimary}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                                    >
                                        CREATE EVENT
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
    card: { padding: 15, borderRadius: 10, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    festName: { marginTop: 4, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 20 },
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
    switchRowPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
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
    }
});

export default ManageEvents;
