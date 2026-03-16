import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl, KeyboardAvoidingView, ScrollView, Platform, Modal as RNModal } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button, Switch, IconButton, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const ManageEvents = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', eventDate: '', isFestival: false, festivalName: '' });
    const [errors, setErrors] = useState<any>({});
    const theme = useTheme();

    const handleCloseModal = () => {
        setModalVisible(false);
        setTimeout(() => {
            setForm({ title: '', description: '', eventDate: '', isFestival: false, festivalName: '' });
            setErrors({});
        }, 300);
    };

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
        } catch (error: any) {
            console.error('Fetch events error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const newErrors: any = {};
        if (!form.title.trim()) newErrors.title = 'Event title is required';
        if (!form.eventDate.trim()) newErrors.eventDate = 'Event date is required';
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            await api.post('/admin/events', form);
            handleCloseModal();
            fetchEvents();
            Alert.alert('Success', 'Event created');
        } catch (error: any) {
            console.error('Create event error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create event';
            Alert.alert('Error', errorMsg);
        }
    };

    const renderError = (msg: string) => msg ? <Text style={styles.errorText}>{msg}</Text> : null;

    const handleDeleteClick = (item: any) => {
        setItemToDelete(item);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/admin/events/${itemToDelete._id}`);
            setDeleteModalVisible(false);
            setItemToDelete(null);
            fetchEvents();
        } catch (error: any) {
            console.error(`Delete event ${itemToDelete._id} error:`, error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to delete';
            Alert.alert('Error', errorMsg);
        } finally {
            setIsDeleting(false);
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
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, flex: 1 }}>
                                {item.isFestival ? `🎉 ${item.title}` : `📅 ${item.title}`}
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleDeleteClick(item)}
                                style={{ padding: 8, zIndex: 999 }}
                            >
                                <IconButton
                                    icon="delete-outline"
                                    iconColor={theme.colors.error}
                                    size={24}
                                    style={{ margin: 0 }}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>{item.description}</Text>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>Date: {new Date(item.eventDate).toDateString()}</Text>
                        {item.isFestival && <Text variant="labelSmall" style={[styles.festName, { color: theme.colors.primary }]}>Festival: {item.festivalName}</Text>}
                    </Surface>
                )}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No events yet.</Text>}
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
                                            NEW EVENT
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                            Organize a community gathering.
                                        </Text>
                                    </View>
                                        <IconButton icon="close" size={24} iconColor={theme.colors.onSurfaceVariant} onPress={handleCloseModal} />
                                    </View>

                                    <View style={{ marginTop: 30 }}>
                                        <PaperInput
                                            label="Event Title *"
                                            placeholder="Event Title"
                                            placeholderTextColor={theme.colors.onSurfaceVariant}
                                            mode="outlined"
                                            style={styles.input}
                                            outlineStyle={styles.inputOutline}
                                            value={form.title}
                                            onChangeText={(text) => {
                                                setForm({ ...form, title: text });
                                                if (text.trim()) setErrors({ ...errors, title: false });
                                            }}
                                            error={!!errors.title}
                                            left={<PaperInput.Icon icon="calendar-check-outline" color={theme.colors.onSurfaceVariant} />}
                                            outlineColor={theme.colors.surfaceVariant}
                                            activeOutlineColor={theme.colors.primary}
                                            textColor={theme.colors.onSurface}
                                        />
                                        {renderError(errors.title)}

                                        <PaperInput
                                            label="Description"
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

                                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                            <PaperInput
                                                label="Date *"
                                                placeholder="Select Date"
                                                placeholderTextColor={theme.colors.onSurfaceVariant}
                                                mode="outlined"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                                value={form.eventDate}
                                                editable={false}
                                                error={!!errors.eventDate}
                                                left={<PaperInput.Icon icon="clock-outline" color={theme.colors.onSurfaceVariant} />}
                                                outlineColor={theme.colors.surfaceVariant}
                                                activeOutlineColor={theme.colors.primary}
                                                textColor={theme.colors.onSurface}
                                                pointerEvents="none"
                                            />
                                        </TouchableOpacity>
                                        {renderError(errors.eventDate)}

                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={form.eventDate ? new Date(form.eventDate) : new Date()}
                                                mode="date"
                                                display="default"
                                                onChange={(event, selectedDate) => {
                                                    setShowDatePicker(false);
                                                    if (selectedDate) {
                                                        const dateString = selectedDate.toISOString().split('T')[0];
                                                        setForm({ ...form, eventDate: dateString });
                                                    }
                                                }}
                                            />
                                        )}

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
                                        onPress={handleCloseModal}
                                    >
                                        <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Surface>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Custom Deletion Modal */}
            <Portal>
                <RNModal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.deleteModalOverlay}>
                        <Surface style={[styles.deleteModalContent, { backgroundColor: theme.colors.elevation.level3 }]} elevation={5}>
                            <View style={styles.deleteModalIconContainer}>
                                <MaterialIcons name="report-problem" size={40} color={theme.colors.error} />
                            </View>
                            
                            <Text variant="headlineSmall" style={styles.deleteModalTitle}>Confirm Delete</Text>
                            <Text variant="bodyMedium" style={styles.deleteModalSubtitle}>
                                Are you sure you want to remove <Text style={{fontWeight: 'bold', color: theme.colors.onSurface}}>{itemToDelete?.title}</Text>? 
                                This action cannot be undone.
                            </Text>

                            <View style={styles.deleteModalFooter}>
                                <Button 
                                    mode="text" 
                                    onPress={() => setDeleteModalVisible(false)} 
                                    textColor={theme.colors.onSurfaceVariant}
                                    style={{ flex: 1, marginRight: 8 }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    mode="contained" 
                                    onPress={confirmDelete} 
                                    buttonColor={theme.colors.error}
                                    textColor="#fff"
                                    loading={isDeleting}
                                    style={{ flex: 1 }}
                                    contentStyle={{ paddingVertical: 4 }}
                                >
                                    Delete
                                </Button>
                            </View>
                        </Surface>
                    </View>
                </RNModal>
            </Portal>
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
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 4,
        fontWeight: '600'
    },
    // Custom Deletion Modal Styles
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    deleteModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
    },
    deleteModalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    deleteModalTitle: {
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center'
    },
    deleteModalSubtitle: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 32,
        lineHeight: 20
    },
    deleteModalFooter: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    }
});

export default ManageEvents;
