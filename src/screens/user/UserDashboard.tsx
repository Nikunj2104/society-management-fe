import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, ActivityIndicator, useTheme, Surface, Avatar, IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const UserDashboard = () => {
    const { user, signOut } = useContext(AuthContext);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        if (user?.society) {
            fetchDashboard();
        } else {
            setLoading(false);
        }
    }, [user?.society]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/dashboard');
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
            {!user?.society && (
                <Surface style={[styles.warningBanner, { backgroundColor: '#331010', borderLeftColor: theme.colors.error }]} elevation={2}>
                    <Text style={[styles.warningText, { color: theme.colors.error }]}>⚠️ Your account is not linked to a society. Please contact your administrator.</Text>
                </Surface>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        Hello, {user?.name} 👋
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Resident Dashboard
                    </Text>
                </View>
                <IconButton
                    icon="logout"
                    mode="contained"
                    containerColor={theme.colors.error}
                    iconColor={theme.colors.onError}
                    size={20}
                    onPress={signOut}
                />
            </View>

            {user?.society ? (
                <>
                    {/* Summary Cards */}
                    <View style={styles.grid}>
                        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.error, borderLeftWidth: 4 }]}>
                            <Card.Content>
                                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Active Complaints</Text>
                                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                    {data?.activeComplaints || 0}
                                </Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderLeftColor: '#f59e0b', borderLeftWidth: 4 }]}>
                            <Card.Content>
                                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Pending Dues</Text>
                                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                    {data?.unpaidMaintenance?.length || 0}
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Pending Maintenance */}
                    {data?.unpaidMaintenance?.length > 0 && (
                        <>
                            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>💰 Pending Maintenance</Text>
                            {data.unpaidMaintenance.map((m: any) => (
                                <Card key={m._id} style={[styles.listCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
                                    <Card.Title
                                        title={`${m.month} ${m.year}`}
                                        titleStyle={{ color: theme.colors.onSurface }}
                                        subtitle={`Due: ${new Date(m.dueDate).toDateString()}`}
                                        subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                                        left={(props) => <Avatar.Icon {...props} icon="cash" style={{ backgroundColor: '#453115' }} color="#f59e0b" />}
                                        right={(props) => <Text {...props} style={styles.dueAmount}>₹{m.amount}</Text>}
                                        rightStyle={{ marginRight: 16 }}
                                    />
                                </Card>
                            ))}
                        </>
                    )}

                    {/* Upcoming Events */}
                    {data?.upcomingEvents?.length > 0 && (
                        <>
                            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>📅 Upcoming Events</Text>
                            {data.upcomingEvents.map((event: any) => (
                                <Card key={event._id} style={[styles.listCard, { backgroundColor: event.isFestival ? '#2A2012' : theme.colors.surface }]} mode="elevated">
                                    <Card.Title
                                        title={`${event.isFestival ? '🎉 ' : ''}${event.title}`}
                                        titleStyle={{ color: theme.colors.onSurface }}
                                        subtitle={new Date(event.eventDate).toDateString()}
                                        subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                                        left={(props) => <Avatar.Icon {...props} icon="calendar" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />}
                                    />
                                </Card>
                            ))}
                        </>
                    )}

                    {/* Latest Announcements */}
                    {data?.latestAnnouncements?.length > 0 && (
                        <>
                            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>📢 Latest Announcements</Text>
                            {data.latestAnnouncements.map((a: any) => (
                                <Card key={a._id} style={[styles.listCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
                                    <Card.Content>
                                        <Title style={{ fontSize: 16, color: theme.colors.onSurface }}>{a.title}</Title>
                                        <Paragraph numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>{a.content}</Paragraph>
                                        <Text variant="labelSmall" style={{ color: '#888', marginTop: 8 }}>
                                            {new Date(a.createdAt).toDateString()}
                                        </Text>
                                    </Card.Content>
                                </Card>
                            ))}
                        </>
                    )}
                </>
            ) : (
                <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineSmall" style={[styles.emptyText, { color: theme.colors.onSurface }]}>Welcome to Society Management!</Text>
                    <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                        Once your administrator assigns you to a society, your dashboard will come to life with complaints, dues, and announcements.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    warningBanner: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 5,
    },
    warningText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 40
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    summaryCard: {
        width: '48%',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    listCard: {
        marginBottom: 12,
    },
    dueAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b'
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        elevation: 1
    },
    emptyText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
});

export default UserDashboard;
