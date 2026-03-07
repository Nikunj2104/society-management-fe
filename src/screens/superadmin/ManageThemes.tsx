import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, useTheme, Button, TextInput, IconButton, Switch, ActivityIndicator, Portal, Dialog, Snackbar, SegmentedButtons } from 'react-native-paper';
import api from '../../services/api';

interface AppTheme {
    _id?: string;
    name: string;
    themeKey: string;
    type: 'regular' | 'festival';
    isActiveFestival: boolean;
    isPublished: boolean;
    colors: {
        primary: string;
        background: string;
        surface: string;
        surfaceVariant: string;
        text: string;
    };
    backgroundImageUrl?: string;
}

const defaultTheme: Partial<AppTheme> = {
    type: 'regular',
    isActiveFestival: false,
    isPublished: true,
    colors: {
        primary: '#6200ea',
        background: '#ffffff',
        surface: '#f6f6f6',
        surfaceVariant: '#e0e0e0',
        text: '#000000'
    }
};

const ManageThemes = () => {
    const paperTheme = useTheme();
    const [themes, setThemes] = useState<AppTheme[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [newTheme, setNewTheme] = useState<Partial<AppTheme>>(defaultTheme);
    const [loading, setLoading] = useState(true);

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            const response = await api.get('/themes');
            setThemes(response.data);
        } catch (error) {
            console.error('Failed to load themes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing === -1) {
                const response = await api.post('/themes', newTheme);
                setThemes([...themes, response.data]);
                showSnackbar('Theme created successfully!');
            } else if (isEditing !== null) {
                const id = themes[isEditing]._id;
                const response = await api.put(`/themes/${id}`, newTheme);
                const updated = [...themes];
                updated[isEditing] = response.data;

                // If this is set to active festival, we need to re-fetch or clear others locally
                if (newTheme.type === 'festival' && newTheme.isActiveFestival) {
                    fetchThemes(); // Easiest way to sync state
                } else {
                    setThemes(updated);
                }

                showSnackbar('Theme updated successfully!');
            }

            setIsEditing(null);
            setNewTheme(defaultTheme);
        } catch (error: any) {
            console.error('Save error:', error.response?.data || error.message);
            Alert.alert('Error Saving', error.response?.data?.message || "Could not connect to database.");
        }
    };

    const handleDeleteClick = (index: number) => {
        setItemToDelete(index);
        setDeleteDialogVisible(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete === null) return;
        const theme = themes[itemToDelete];
        setDeleteDialogVisible(false);

        try {
            if (!theme._id) throw new Error("Invalid Item");
            await api.delete(`/themes/${theme._id}`);

            const updated = [...themes];
            updated.splice(itemToDelete, 1);
            setThemes(updated);

            showSnackbar("Theme removed.");
        } catch (error: any) {
            Alert.alert("Error Deleting", error.message);
        } finally {
            setItemToDelete(null);
        }
    };

    const updateColor = (key: keyof AppTheme['colors'], val: string) => {
        setNewTheme({
            ...newTheme,
            colors: {
                ...newTheme.colors,
                [key]: val
            } as AppTheme['colors']
        });
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
                        Manage UI Themes
                    </Text>

                    {themes.map((theme, index) => (
                        <View key={theme._id || index} style={[styles.festivalItem, { borderBottomColor: paperTheme.colors.surfaceVariant }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold', fontSize: 16 }}>
                                    {theme.name}
                                    {theme.type === 'festival' && theme.isActiveFestival && ' ⭐ (Active)'}
                                </Text>
                                <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 12 }}>
                                    Key: {theme.themeKey} • Type: {theme.type === 'festival' ? 'Festival' : 'Regular'} • {theme.isPublished ? 'Published' : 'Hidden'}
                                </Text>
                                {/* Color Swatches */}
                                <View style={{ flexDirection: 'row', marginTop: 6, gap: 4 }}>
                                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
                                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.background }]} />
                                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.surface }]} />
                                </View>
                            </View>
                            <IconButton
                                icon="pencil"
                                size={20}
                                iconColor={paperTheme.colors.primary}
                                onPress={() => {
                                    setIsEditing(index);
                                    setNewTheme(JSON.parse(JSON.stringify(theme)));
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
                        setNewTheme(JSON.parse(JSON.stringify(defaultTheme)));
                    }}>
                        Add New Theme
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
                        <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold' }}>
                            {isEditing === -1 ? 'Create New Theme' : 'Edit Theme Formulation'}
                        </Text>
                    </View>

                    <TextInput
                        label="Friendly Name (e.g., Deep Ocean)"
                        mode="outlined"
                        style={styles.input}
                        value={newTheme.name || ''}
                        onChangeText={(text) => setNewTheme({ ...newTheme, name: text })}
                    />
                    <TextInput
                        label="Internal Key (e.g., ocean)"
                        mode="outlined"
                        style={styles.input}
                        value={newTheme.themeKey || ''}
                        onChangeText={(text) => setNewTheme({ ...newTheme, themeKey: text })}
                    />

                    <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 8, marginTop: 8 }}>Theme Type</Text>
                    <SegmentedButtons
                        value={newTheme.type || 'regular'}
                        onValueChange={(val) => setNewTheme({ ...newTheme, type: val as any })}
                        buttons={[
                            { value: 'regular', label: 'Regular (User Choice)' },
                            { value: 'festival', label: 'Festival (Global Overwrite)' },
                        ]}
                        style={{ marginBottom: 15 }}
                    />

                    <View style={styles.settingRow}>
                        <Text style={{ color: paperTheme.colors.onSurface }}>Published (Show to Users)</Text>
                        <Switch
                            value={!!newTheme.isPublished}
                            onValueChange={(val) => setNewTheme({ ...newTheme, isPublished: val })}
                            color={paperTheme.colors.primary}
                        />
                    </View>

                    {newTheme.type === 'festival' && (
                        <View style={styles.settingRow}>
                            <Text style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>Set as LIVE Festival Theme</Text>
                            <Switch
                                value={!!newTheme.isActiveFestival}
                                onValueChange={(val) => setNewTheme({ ...newTheme, isActiveFestival: val })}
                                color={paperTheme.colors.primary}
                            />
                        </View>
                    )}

                    <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 20, marginBottom: 8, fontWeight: 'bold' }}>Colors (Hex codes)</Text>

                    <TextInput label="Primary Accent (Buttons/Icons)" mode="outlined" style={styles.input}
                        value={newTheme.colors?.primary || ''} onChangeText={(val) => updateColor('primary', val)} />
                    <TextInput label="App Background" mode="outlined" style={styles.input}
                        value={newTheme.colors?.background || ''} onChangeText={(val) => updateColor('background', val)} />
                    <TextInput label="Card Surface" mode="outlined" style={styles.input}
                        value={newTheme.colors?.surface || ''} onChangeText={(val) => updateColor('surface', val)} />
                    <TextInput label="Surface Variant (Dividers/Inputs)" mode="outlined" style={styles.input}
                        value={newTheme.colors?.surfaceVariant || ''} onChangeText={(val) => updateColor('surfaceVariant', val)} />
                    <TextInput label="Main Text Color" mode="outlined" style={styles.input}
                        value={newTheme.colors?.text || ''} onChangeText={(val) => updateColor('text', val)} />

                    {newTheme.type === 'festival' && (
                        <>
                            <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 15, marginBottom: 8, fontWeight: 'bold' }}>Advanced Visuals</Text>
                            <TextInput
                                label="Background Image URL (Kites, Holi Splash)"
                                mode="outlined"
                                style={styles.input}
                                placeholder="https://..."
                                value={newTheme.backgroundImageUrl || ''}
                                onChangeText={(val) => setNewTheme({ ...newTheme, backgroundImageUrl: val })}
                            />
                        </>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                        <Button mode="contained" onPress={handleSave}>Save Theme</Button>
                    </View>
                </Surface>
            )}

            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={{ backgroundColor: paperTheme.colors.surface }}>
                    <Dialog.Title style={{ color: paperTheme.colors.onSurface }}>Delete Theme?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                            Are you sure you want to permanently delete this theme?
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
                    action={{ label: 'Close', onPress: () => setSnackbarVisible(false) }}
                >
                    {snackbarMessage}
                </Snackbar>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40 },
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
        borderBottomColor: '#ccc'
    },
    colorSwatch: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc'
    }
});

export default ManageThemes;
