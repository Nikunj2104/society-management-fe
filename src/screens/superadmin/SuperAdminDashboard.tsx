import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, useTheme, Card, Title, Surface } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const SuperAdminDashboard = () => {
    const { signOut, user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setError(null);
            const response = await api.get('/super-admin/analytics');
            setAnalytics(response.data);
        } catch (err: any) {
            console.error('Failed to load analytics', err);
            setError(err.response?.data?.message || 'Failed to load panel metrics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
            contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.header}>
                <View>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Super Admin Panel</Text>
                    <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Welcome back, {user?.name}</Text>
                </View>
                <Button mode="contained" onPress={signOut} buttonColor={theme.colors.error} textColor={theme.colors.onError}>
                    Logout
                </Button>
            </View>

            {error ? (
                <Surface style={[styles.errorContainer, { backgroundColor: '#331010' }]} elevation={2}>
                    <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: 'bold' }}>Authentication Error</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 4 }}>{error}</Text>
                    <Button mode="outlined" onPress={onRefresh} style={{ marginTop: 15 }} textColor={theme.colors.error}>Retry</Button>
                </Surface>
            ) : (
                <>
                    <View style={styles.cardContainer}>
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.primary }]}>
                            <Card.Content>
                                <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Total Societies</Text>
                                <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{analytics?.totalSocieties || 0}</Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.secondary }]}>
                            <Card.Content>
                                <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Active Societies</Text>
                                <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{analytics?.activeSocieties || 0}</Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: '#17a2b8' }]}>
                            <Card.Content>
                                <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Total Admins</Text>
                                <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{analytics?.totalAdmins || 0}</Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: '#ffc107' }]}>
                            <Card.Content>
                                <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Total Residents</Text>
                                <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{analytics?.totalUsers || 0}</Text>
                            </Card.Content>
                        </Card>
                    </View>
        
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Summary Metrics</Text>
                    </View>
        
                    <Surface style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={[styles.summaryItem, { borderBottomColor: theme.colors.surfaceVariant }]}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Maintenance Pending (₹)</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>{analytics?.maintenanceCollectionSummary?.pending || 0}</Text>
                        </View>
                        <View style={[styles.summaryItem, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Open Complaints</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.onSurface }]}>{analytics?.complaintsSummary?.open || 0}</Text>
                        </View>
                    </Surface>
                </>
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    title: { fontWeight: 'bold' },
    subtitle: { marginTop: 4 },
    cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        width: '48%',
        marginBottom: 15,
        borderLeftWidth: 4,
        borderRadius: 8
    },
    cardTitle: { fontSize: 14, fontWeight: 'bold' },
    cardValue: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
    sectionHeader: { marginTop: 20, marginBottom: 15 },
    sectionTitle: { fontWeight: 'bold' },
    summaryContainer: { borderRadius: 12, padding: 20 },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
    summaryLabel: { fontSize: 16 },
    summaryValue: { fontSize: 16, fontWeight: 'bold' },
    errorContainer: { padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 20 },
});

export default SuperAdminDashboard;
