import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const { signIn } = useContext(AuthContext);
    const theme = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Validation Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await signIn({ email, password });
        } catch (error: any) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.topSpacer} />

                <View style={styles.header}>
                    <Text variant="displayMedium" style={{ color: theme.colors.primary, fontWeight: '900', letterSpacing: -1 }}>
                        SOCIETY
                    </Text>
                    <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 10 }}>
                        Welcome Back.
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                        Login to manage your community effortlessly.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        placeholder="Email Address"
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        onChangeText={setEmail}
                        value={email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        left={<TextInput.Icon icon="email-outline" color={theme.colors.onSurfaceVariant} />}
                        outlineColor={theme.colors.surfaceVariant}
                        activeOutlineColor={theme.colors.primary}
                        textColor={theme.colors.onSurface}
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        secureTextEntry={secureTextEntry}
                        onChangeText={setPassword}
                        value={password}
                        left={<TextInput.Icon icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
                        right={
                            <TextInput.Icon
                                icon={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                                color={theme.colors.onSurfaceVariant}
                            />
                        }
                        outlineColor={theme.colors.surfaceVariant}
                        activeOutlineColor={theme.colors.primary}
                        textColor={theme.colors.onSurface}
                    />

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Forgot password?</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                        loading={loading}
                        disabled={loading}
                        labelStyle={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}
                    >
                        LOGIN
                    </Button>

                    <View style={styles.footer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
                        <TouchableOpacity>
                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Contact Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
    },
    topSpacer: {
        height: 100,
    },
    header: {
        marginBottom: 60,
    },
    formContainer: {
        flex: 1,
    },
    input: {
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#121212',
    },
    inputOutline: {
        borderRadius: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 50,
    },
    button: {
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    buttonContent: {
        paddingVertical: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 50,
        paddingBottom: 40,
    }
});

export default LoginScreen;
