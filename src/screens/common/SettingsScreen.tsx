import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Text, TouchableRipple, useTheme, Button, Title, Divider } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../services/api';

const THEME_OPTIONS = [
    { label: 'Neon Cyber', value: 'neon' },
    { label: 'Ocean Light', value: 'ocean' },
    { label: 'Sunset Dark', value: 'sunset' },
    { label: 'Holi (Vibrant)', value: 'holi' },
    { label: 'Diwali (Festive)', value: 'diwali' },
    { label: 'Uttarayan (Kite)', value: 'uttarayan' },
    { label: 'Raksha Bandhan', value: 'rakshabandhan' },
    { label: 'Janmashtami (Krishna)', value: 'janmashtami' },
    { label: 'Ganesh Chaturthi', value: 'ganeshChaturthi' }
];

const SettingsScreen = () => {
    const { user, signOut, updateUser } = useContext(AuthContext);
    const { themeName, changeTheme } = useContext(ThemeContext);

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const paperTheme = useTheme();

    const handleUpdateProfile = async () => {
        try {
            const response = await api.patch('/auth/profile', { name, phone });
            await updateUser(response.data);
            Alert.alert('Success', 'Profile updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleThemeChange = (newTheme: string) => {
        changeTheme(newTheme);
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <Title style={[styles.title, { color: paperTheme.colors.onSurface }]}>Settings</Title>

            <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}>Profile</Text>
                <TextInput
                    style={[styles.input, { color: paperTheme.colors.onSurface, borderBottomColor: paperTheme.colors.surfaceVariant }]}
                    placeholder="Name"
                    placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, { color: paperTheme.colors.onSurface, borderBottomColor: paperTheme.colors.surfaceVariant }]}
                    placeholder="Phone"
                    placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                    value={phone}
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                />
                <Button mode="contained" onPress={handleUpdateProfile} style={styles.saveButton}>
                    Update Profile
                </Button>
            </View>

            {user?.society && (
                <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}>Society Details</Text>
                    <View style={styles.infoRow}>
                        <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontWeight: '500' }}>Flat Number:</Text>
                        <Text style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold' }}>{user.flatNumber || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontWeight: '500' }}>Role:</Text>
                        <Text style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold' }}>{user.role}</Text>
                    </View>
                </View>
            )}

            <View style={[styles.section, { backgroundColor: paperTheme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant }]}>Theme Preferences</Text>

                {THEME_OPTIONS.map((opt) => (
                    <TouchableRipple
                        key={opt.value}
                        onPress={() => handleThemeChange(opt.value)}
                        style={[
                            styles.themeBtn,
                            {
                                borderColor: themeName === opt.value ? paperTheme.colors.primary : paperTheme.colors.surfaceVariant,
                                backgroundColor: themeName === opt.value ? paperTheme.colors.primaryContainer : 'transparent'
                            }
                        ]}
                    >
                        <Text style={{
                            color: themeName === opt.value ? paperTheme.colors.onPrimaryContainer : paperTheme.colors.onSurface,
                            fontWeight: themeName === opt.value ? 'bold' : 'normal'
                        }}>
                            {opt.label}
                        </Text>
                    </TouchableRipple>
                ))}
            </View>

            <View style={[styles.section, { backgroundColor: 'transparent', elevation: 0, padding: 0 }]}>
                <Button mode="contained" buttonColor={paperTheme.colors.error} onPress={signOut}>
                    Sign Out
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    section: { padding: 15, borderRadius: 10, marginBottom: 20, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    input: { borderBottomWidth: 1, padding: 10, marginBottom: 15 },
    saveButton: { marginTop: 10, borderRadius: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    themeBtn: { padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 10, alignItems: 'center' }
});

export default SettingsScreen;
