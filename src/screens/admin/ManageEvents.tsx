import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Switch } from 'react-native-paper';
import api from '../../services/api';

const ManageEvents = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', eventDate: '', isFestival: false, festivalName: '' });
    const theme = useTheme();

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

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>New Event</Text>
                        <PaperInput
                            mode="outlined"
                            label="Title"
                            style={styles.input}
                            value={form.title}
                            onChangeText={(text) => setForm({ ...form, title: text })}
                            theme={{ colors: { background: 'transparent' } }}
                        />
                        <PaperInput
                            mode="outlined"
                            label="Description"
                            style={styles.input}
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            theme={{ colors: { background: 'transparent' } }}
                        />
                        <PaperInput
                            mode="outlined"
                            label="Date (YYYY-MM-DD)"
                            style={styles.input}
                            value={form.eventDate}
                            onChangeText={(text) => setForm({ ...form, eventDate: text })}
                            theme={{ colors: { background: 'transparent' } }}
                        />

                        <View style={styles.switchRow}>
                            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Is Festival?</Text>
                            <Switch
                                value={form.isFestival}
                                onValueChange={(val) => setForm({ ...form, isFestival: val })}
                                color={theme.colors.primary}
                            />
                        </View>

                        {form.isFestival && (
                            <PaperInput
                                mode="outlined"
                                label="Festival Name (e.g. Diwali)"
                                style={styles.input}
                                value={form.festivalName}
                                onChangeText={(text) => setForm({ ...form, festivalName: text })}
                                theme={{ colors: { background: 'transparent' } }}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleCreate}>Save</Button>
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
    card: { padding: 15, borderRadius: 10, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    festName: { marginTop: 4, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 20 },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 15, padding: 20 },
    modalTitle: { fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { marginBottom: 15 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});

export default ManageEvents;
