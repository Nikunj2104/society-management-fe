import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Card, Surface } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const AdminDashboard = () => {
    const { signOut, user } = useContext(AuthContext);
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error(err);
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
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Admin Dashboard</Text>
                    <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Welcome, {user?.name}</Text>
                </View>
                <Button mode="contained" onPress={signOut} buttonColor={theme.colors.error} textColor={theme.colors.onError}>
                    Logout
                </Button>
            </View>

            <View style={styles.grid}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.primary }]}>
                    <Card.Content>
                        <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Total Residents</Text>
                        <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{stats?.totalResidents || 0}</Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.error }]}>
                    <Card.Content>
                        <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Open Complaints</Text>
                        <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{stats?.pendingComplaints || 0}</Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: '#22c55e' }]}>
                    <Card.Content>
                        <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Maintenance Paid</Text>
                        <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{stats?.maintenance?.paid || 0}</Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: '#f59e0b' }]}>
                    <Card.Content>
                        <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Maintenance Unpaid</Text>
                        <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{stats?.maintenance?.unpaid || 0}</Text>
                    </Card.Content>
                </Card>
            </View>

            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quick Actions</Text>
            <View style={styles.grid}>
                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('ManageMails')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
                        <MaterialIcons name="email" size={28} color="#00C853" />
                    </View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Send Email</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>To anyone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Announcements')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                        <MaterialIcons name="campaign" size={28} color="#2196F3" />
                    </View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Broadcast</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>To residents</Text>
                </TouchableOpacity>
            </View>

            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Upcoming Events</Text>
            {stats?.upcomingEvents?.length === 0
                ? <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No upcoming events</Text>
                : stats?.upcomingEvents?.map((event: any) => (
                    <Surface key={event._id} style={[styles.eventCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={[styles.festivalDot, { backgroundColor: event.isFestival ? '#f59e0b' : theme.colors.primary }]} />
                        <View>
                            <Text style={[styles.eventTitle, { color: theme.colors.onSurface }]}>{event.title}</Text>
                            <Text style={[styles.eventDate, { color: theme.colors.onSurfaceVariant }]}>{new Date(event.eventDate).toDateString()}</Text>
                        </View>
                    </Surface>
                ))
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60 },
    centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    title: { fontWeight: 'bold' },
    subtitle: { marginTop: 3 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        width: '48%',
        marginBottom: 15,
        borderLeftWidth: 5,
        borderRadius: 12
    },
    cardLabel: { fontSize: 13, fontWeight: '600' },
    cardValue: { fontSize: 30, fontWeight: 'bold', marginTop: 8 },
    actionCard: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: { fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
    emptyText: { textAlign: 'center', marginTop: 10 },
    eventCard: {
        padding: 14, borderRadius: 10, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center'
    },
    festivalDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    eventTitle: { fontSize: 16, fontWeight: 'bold' },
    eventDate: { marginTop: 3 },
});

export default AdminDashboard;
