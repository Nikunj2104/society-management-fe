import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, Button } from 'react-native-paper';
import api from '../../services/api';

const MaintenanceHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/user/maintenance');
            setHistory(response.data);
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>Maintenance Bills</Text>
            <FlatList
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.month} {item.year}</Text>
                            <Surface style={[styles.status, { backgroundColor: item.isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(220, 53, 69, 0.2)' }]} elevation={0}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isPaid ? '#10b981' : theme.colors.error }}>
                                    {item.isPaid ? 'PAID' : 'UNPAID'}
                                </Text>
                            </Surface>
                        </View>
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>₹{item.amount}</Text>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 5 }}>Due Date: {new Date(item.dueDate).toDateString()}</Text>
                        {item.paidAt && <Text variant="labelSmall" style={{ color: '#10b981', marginTop: 5, fontStyle: 'italic' }}>Paid on: {new Date(item.paidAt).toDateString()}</Text>}

                        {!item.isPaid && (
                            <Button mode="contained" buttonColor={theme.colors.primary} style={styles.payButton}>
                                Pay Now (Soon)
                            </Button>
                        )}
                    </Surface>
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No bills found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontWeight: 'bold', marginBottom: 20 },
    card: { padding: 15, borderRadius: 12, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    payButton: { marginTop: 15, borderRadius: 8 },
});

export default MaintenanceHistory;
