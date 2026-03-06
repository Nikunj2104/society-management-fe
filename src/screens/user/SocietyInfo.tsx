import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import api from '../../services/api';

const SocietyInfo = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        try {
            const [annRes, eveRes] = await Promise.all([
                api.get('/user/announcements'),
                api.get('/user/events')
            ]);
            setAnnouncements(annRes.data);
            setEvents(eveRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>Society Info</Text>

            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>📅 Upcoming Events</Text>
            {events.length > 0 ? (
                events.map((event: any) => (
                    <Surface key={event._id} style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{event.isFestival ? `🎉 ${event.title}` : `📅 ${event.title}`}</Text>
                        <Text variant="labelMedium" style={[styles.eventDate, { color: theme.colors.primary }]}>{new Date(event.eventDate).toDateString()}</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{event.description}</Text>
                    </Surface>
                ))
            ) : (
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No upcoming events found.</Text>
            )}

            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.primary, marginTop: 30 }]}>📢 Announcements</Text>
            {announcements.length > 0 ? (
                announcements.map((a: any) => (
                    <Surface key={a._id} style={[styles.announcement, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.primary }]} elevation={1}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{a.title}</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 5 }}>{a.content}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>{new Date(a.createdAt).toDateString()}</Text>
                    </Surface>
                ))
            ) : (
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No announcements yet.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingTop: 60 },
    title: { fontWeight: 'bold', marginBottom: 20 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
    card: { padding: 15, borderRadius: 12, marginBottom: 15 },
    eventDate: { fontWeight: 'bold', marginVertical: 5 },
    announcement: { padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4 },
    emptyText: { textAlign: 'center', marginTop: 10 }
});

export default SocietyInfo;
