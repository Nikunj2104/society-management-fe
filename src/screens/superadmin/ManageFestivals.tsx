import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Surface, useTheme, Button, TextInput, IconButton, Divider, Switch, ActivityIndicator, Portal, Dialog, Snackbar } from 'react-native-paper';
import { Festival } from '../../utils/festivals';
import api from '../../services/api';

const ManageFestivals = () => {
    const paperTheme = useTheme();
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [newFestival, setNewFestival] = useState<Partial<Festival>>({});
    const [loading, setLoading] = useState(true);

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    React.useEffect(() => {
        fetchFestivals();
    }, []);

    const fetchFestivals = async () => {
        try {
            const response = await api.get('/notifications');
            setFestivals(response.data);
        } catch (error) {
            console.error('Failed to load festivals', error);
            setFestivals([]); // fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!newFestival.name?.trim()) errors.name = 'Festival name is required';
        if (!newFestival.theme?.trim()) errors.theme = 'Theme key is required';
        if (!newFestival.message?.trim()) errors.message = 'Message content is required';
        if (!newFestival.date?.trim()) errors.date = 'Date/Timing is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showSnackbar('Please fill all required fields');
            return;
        }

        try {
            // Transform emojis string into array for saving
            const payload = {
                ...newFestival,
                emojis: typeof newFestival.emojis === 'string'
                    ? (newFestival.emojis as string).split(',').map(e => e.trim())
                    : newFestival.emojis
            };

            if (isEditing === -1) {
                // Create securely via backend first
                const response = await api.post('/notifications', payload);
                setFestivals([...festivals, response.data]);
                showSnackbar('Notification created successfully!');
            } else if (isEditing !== null) {
                // Update securely via backend first
                const id = festivals[isEditing]._id;
                if (!id || id.startsWith('mock_')) throw new Error("Item cannot be edited yet.");

                const response = await api.put(`/notifications/${id}`, payload);
                const updated = [...festivals];
                updated[isEditing] = response.data;
                setFestivals(updated);
                showSnackbar('Notification updated successfully!');
            }

            setIsEditing(null);
            setNewFestival({});
        } catch (error: any) {
            console.error('Save error:', error.response?.data || error.message);
            Alert.alert('Error Saving', error.response?.data?.message || error.message || "Could not connect to database.");
        }
    };

    const handleDeleteClick = (index: number) => {
        setItemToDelete(index);
        setDeleteDialogVisible(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete === null) return;
        const fest = festivals[itemToDelete];
        setDeleteDialogVisible(false); // Hide dialog immediately

        try {
            if (!fest._id || fest._id.startsWith('mock_')) {
                throw new Error("Invalid Item - Please refresh.");
            }

            await api.delete(`/notifications/${fest._id}`);

            const updated = [...festivals];
            updated.splice(itemToDelete, 1);
            setFestivals(updated);

            showSnackbar("Notification successfully removed.");
        } catch (error: any) {
            console.error("Delete error:", error.response?.data || error.message);
            Alert.alert("Error Deleting", error.response?.data?.message || error.message || "Failed to remove item.");
        } finally {
            setItemToDelete(null);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            {isEditing === null ? (
                <Surface style={[styles.card, { backgroundColor: paperTheme.colors.surface }]} elevation={2}>
                    <Text variant="titleLarge" style={{ color: paperTheme.colors.onSurface, marginBottom: 15, fontWeight: 'bold' }}>
                        Active Notifications
                    </Text>

                    {festivals.map((fest, index) => (
                        <View key={index} style={[styles.festivalItem, { borderBottomColor: paperTheme.colors.surfaceVariant }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold' }}>
                                    {fest.emojis.join(' ')} {fest.name}
                                </Text>
                                <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 12 }}>
                                    Theme: {fest.theme} • Date: {fest.date}
                                    {fest.startTime ? ` • ${fest.startTime} - ${fest.endTime}` : ''}
                                </Text>
                                <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
                                    "{fest.message}"
                                </Text>
                            </View>
                            <IconButton
                                icon="pencil"
                                size={20}
                                iconColor={paperTheme.colors.primary}
                                onPress={() => {
                                    setIsEditing(index);
                                    setNewFestival(JSON.parse(JSON.stringify(fest)));
                                }}
                            />
                            <IconButton
                                icon="delete"
                                size={20}
                                iconColor={paperTheme.colors.error}
                                onPress={() => handleDeleteClick(index)}
                            />
                        </View>
                    ))}

                    <Button mode="outlined" icon="plus" style={{ marginTop: 15 }} onPress={() => {
                        setIsEditing(-1);
                        setNewFestival({});
                    }}>
                        Add New Notification
                    </Button>
                </Surface>
            ) : (
                <Surface style={[styles.card, { backgroundColor: paperTheme.colors.surface }]} elevation={3}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            iconColor={paperTheme.colors.onSurface}
                            onPress={() => setIsEditing(null)}
                            style={{ margin: 0, marginRight: 8, marginLeft: -8 }}
                        />
                        <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface }}>
                            {isEditing === -1 ? 'Create New Notification' : 'Edit Notification'}
                        </Text>
                    </View>

                    <TextInput
                        label="Name (e.g., Diwali)"
                        mode="outlined"
                        style={styles.input}
                        value={newFestival.name || ''}
                        onChangeText={(text) => {
                            setNewFestival({ ...newFestival, name: text });
                            if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                        }}
                        error={!!formErrors.name}
                    />
                    {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}
                    <TextInput
                        label="Theme Key (e.g., diwali, ocean, neon)"
                        mode="outlined"
                        style={styles.input}
                        value={newFestival.theme || ''}
                        onChangeText={(text) => {
                            setNewFestival({ ...newFestival, theme: text });
                            if (formErrors.theme) setFormErrors({ ...formErrors, theme: '' });
                        }}
                        error={!!formErrors.theme}
                    />
                    {formErrors.theme ? <Text style={styles.errorText}>{formErrors.theme}</Text> : null}
                    <TextInput
                        label="Message"
                        mode="outlined"
                        style={styles.input}
                        value={newFestival.message || ''}
                        onChangeText={(text) => {
                            setNewFestival({ ...newFestival, message: text });
                            if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                        }}
                        error={!!formErrors.message}
                    />
                    {formErrors.message ? <Text style={styles.errorText}>{formErrors.message}</Text> : null}
                    <TextInput
                        label="Emojis (comma separated)"
                        mode="outlined"
                        style={styles.input}
                        value={typeof newFestival.emojis === 'string' ? newFestival.emojis : newFestival.emojis?.join(',')}
                        onChangeText={(text) => setNewFestival({ ...newFestival, emojis: text as any })}
                    />

                    <Divider style={{ marginVertical: 15 }} />

                    <TextInput
                        label="Date (MM-DD or 'always')"
                        mode="outlined"
                        style={styles.input}
                        value={newFestival.date || ''}
                        onChangeText={(text) => {
                            setNewFestival({ ...newFestival, date: text });
                            if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                        }}
                        error={!!formErrors.date}
                    />
                    {formErrors.date ? <Text style={styles.errorText}>{formErrors.date}</Text> : null}

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            label="Start Time (HH:mm)"
                            mode="outlined"
                            style={[styles.input, { flex: 1 }]}
                            value={newFestival.startTime || ''}
                            onChangeText={(text) => setNewFestival({ ...newFestival, startTime: text })}
                        />
                        <TextInput
                            label="End Time (HH:mm)"
                            mode="outlined"
                            style={[styles.input, { flex: 1 }]}
                            value={newFestival.endTime || ''}
                            onChangeText={(text) => setNewFestival({ ...newFestival, endTime: text })}
                        />
                    </View>


                    <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 10, marginBottom: 5 }}>Notification Type</Text>
                    <View style={{ flexDirection: 'column', gap: 8, marginBottom: 15 }}>
                        <Button
                            mode={newFestival.notificationType === 'auto-dismiss' ? 'contained' : 'outlined'}
                            onPress={() => setNewFestival({ ...newFestival, notificationType: 'auto-dismiss' })}
                        >
                            Auto Dismiss
                        </Button>
                        <Button
                            mode={newFestival.notificationType === 'dismissible' ? 'contained' : 'outlined'}
                            onPress={() => setNewFestival({ ...newFestival, notificationType: 'dismissible' })}
                        >
                            User Dismissible
                        </Button>
                        <Button
                            mode={newFestival.notificationType === 'persistent' ? 'contained' : 'outlined'}
                            onPress={() => setNewFestival({ ...newFestival, notificationType: 'persistent' })}
                        >
                            Persistent
                        </Button>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 }}>
                        <Button mode="contained" onPress={handleSave}>Save</Button>
                    </View>
                </Surface>
            )}



            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={{ backgroundColor: paperTheme.colors.surface }}>
                    <Dialog.Title style={{ color: paperTheme.colors.onSurface }}>Delete Theme?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                            Are you sure you want to permanently delete this theme? It will be removed from all users' devices immediately.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)} textColor={paperTheme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button onPress={confirmDelete} textColor={paperTheme.colors.error} mode="contained" buttonColor={paperTheme.colors.errorContainer}>Delete</Button>
                    </Dialog.Actions>
                </Dialog>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'Close',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40 },
    header: { marginBottom: 10 },
    title: { fontWeight: 'bold' },
    card: { padding: 20, borderRadius: 12 },
    festivalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1
    },
    input: { marginBottom: 12, backgroundColor: 'transparent' },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 4,
        fontWeight: '600'
    }
});

export default ManageFestivals;
