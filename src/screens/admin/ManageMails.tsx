import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput as PaperInput, Button } from 'react-native-paper';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const ManageMails = () => {
    const navigation = useNavigation();
    const [form, setForm] = useState({ to: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleSendEmail = async () => {
        if (!form.to || !form.subject || !form.message) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.to.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/send-email', {
                to: form.to.trim(),
                subject: form.subject,
                message: form.message
            });
            Alert.alert('Success', 'Email sent successfully!');
            setForm({ to: '', subject: '', message: '' });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 }}>←</Text>
                </TouchableOpacity>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Send Email</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.formHeader}>
                            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>Compose Message</Text>
                            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                Send a direct email to any recipient.
                            </Text>
                        </View>

                        <View style={{ marginTop: 24 }}>
                            <PaperInput
                                placeholder="Recipient Email"
                                placeholderTextColor={theme.colors.onSurfaceVariant}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={form.to}
                                onChangeText={t => setForm({ ...form, to: t })}
                                left={<PaperInput.Icon icon="account-circle-outline" color={theme.colors.onSurfaceVariant} />}
                                outlineColor={theme.colors.surfaceVariant}
                                activeOutlineColor={theme.colors.primary}
                                textColor={theme.colors.onSurface}
                            />

                            <PaperInput
                                placeholder="Subject"
                                placeholderTextColor={theme.colors.onSurfaceVariant}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                value={form.subject}
                                onChangeText={t => setForm({ ...form, subject: t })}
                                left={<PaperInput.Icon icon="email-edit-outline" color={theme.colors.onSurfaceVariant} />}
                                outlineColor={theme.colors.surfaceVariant}
                                activeOutlineColor={theme.colors.primary}
                                textColor={theme.colors.onSurface}
                            />

                            <PaperInput
                                placeholder="Write your message here..."
                                placeholderTextColor={theme.colors.onSurfaceVariant}
                                mode="outlined"
                                multiline
                                numberOfLines={10}
                                style={[styles.input, { minHeight: 180, paddingTop: 12 }]}
                                outlineStyle={styles.inputOutline}
                                value={form.message}
                                onChangeText={t => setForm({ ...form, message: t })}
                                left={<PaperInput.Icon icon="text-subject" color={theme.colors.onSurfaceVariant} />}
                                outlineColor={theme.colors.surfaceVariant}
                                activeOutlineColor={theme.colors.primary}
                                textColor={theme.colors.onSurface}
                            />

                            <Button
                                mode="contained"
                                onPress={handleSendEmail}
                                loading={loading}
                                disabled={loading}
                                style={styles.sendButton}
                                contentStyle={styles.buttonContent}
                                buttonColor={theme.colors.primary}
                                textColor={theme.colors.onPrimary}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
                            >
                                SEND EMAIL
                            </Button>
                        </View>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 15, padding: 5 },
    card: { padding: 24, borderRadius: 24, marginTop: 10 },
    formHeader: { borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15 },
    input: {
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
    sendButton: {
        borderRadius: 30,
        elevation: 8,
        marginTop: 20,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    buttonContent: {
        paddingVertical: 12,
    },
});

export default ManageMails;
