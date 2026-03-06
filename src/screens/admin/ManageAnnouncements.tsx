import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button } from 'react-native-paper';
import api from '../../services/api';

const ManageAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });
    const theme = useTheme();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/admin/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.title || !form.content) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await api.post('/admin/announcements', form);
            setModalVisible(false);
            setForm({ title: '', content: '' });
            fetchAnnouncements();
            Alert.alert('Success', 'Announcement posted and emailed to all residents');
        } catch (error) {
            Alert.alert('Error', 'Failed to create announcement');
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
                        await api.delete(`/admin/announcements/${id}`);
                        fetchAnnouncements();
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
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Announcements</Text>
                <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor={theme.colors.primary}>
                    + New
                </Button>
            </View>

            <FlatList
                data={announcements}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.title}</Text>
                            <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 8 }}>{item.content}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{new Date(item.createdAt).toDateString()}</Text>
                    </Surface>
                )}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No announcements yet.</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={5}>
                        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>New Announcement</Text>
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
                            label="Content"
                            multiline
                            numberOfLines={4}
                            style={styles.textArea}
                            value={form.content}
                            onChangeText={(text) => setForm({ ...form, content: text })}
                            theme={{ colors: { background: 'transparent' } }}
                        />
                        <View style={styles.modalButtons}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} theme={{ colors: { primary: theme.colors.onSurfaceVariant, outline: theme.colors.surfaceVariant } }} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleCreate}>Post</Button>
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    emptyText: { textAlign: 'center', marginTop: 20 },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 15, padding: 20 },
    modalTitle: { fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { marginBottom: 15, fontSize: 16 },
    textArea: { fontSize: 16, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }
});

export default ManageAnnouncements;
