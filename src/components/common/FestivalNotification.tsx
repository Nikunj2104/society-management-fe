import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Festival } from '../../utils/festivals';

interface Props {
    festival: Festival | null;
}

export const FestivalNotification = ({ festival }: Props) => {
    const paperTheme = useTheme();
    const insets = useSafeAreaInsets();
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (festival) {
            setVisible(true);

            // Animate growing height and fading in so it pushes content down gracefully
            Animated.parallel([
                Animated.spring(heightAnim, {
                    toValue: 1, // Will map to a max-height
                    useNativeDriver: false, // height animation doesn't support native driver
                    tension: 40,
                    friction: 6,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                })
            ]).start();

            // Auto dismiss the notification after 5 seconds if condition matched
            if (!festival.notificationType || festival.notificationType === 'auto-dismiss') {
                const timer = setTimeout(() => {
                    hideNotification();
                }, 5000); // 5 seconds

                return () => clearTimeout(timer);
            }
        }
    }, [festival]);

    const hideNotification = () => {
        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start(() => {
            setVisible(false);
        });
    };

    if (!festival || !visible) return null;

    const maxHeight = heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 160] // Allows plenty of room for natural height + status bar
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: paperTheme.colors.background,
                    maxHeight: maxHeight,
                    opacity: opacityAnim,
                    overflow: 'hidden',
                    paddingTop: Math.max(insets.top, 8) + 8 // Safe Area + custom spacing
                }
            ]}
            pointerEvents="box-none"
        >
            <Surface
                style={[
                    styles.notificationCard,
                    {
                        backgroundColor: paperTheme.colors.surface,
                        borderLeftColor: paperTheme.colors.primary,
                    }
                ]}
                elevation={5}
            >
                <Text style={styles.emoji}>{festival.emojis[0]}</Text>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: paperTheme.colors.primary }]}>
                        {festival.name}
                    </Text>
                    <Text style={[styles.message, { color: paperTheme.colors.onSurfaceVariant }]}>
                        {festival.message}
                    </Text>
                </View>

                {(!festival.notificationType || festival.notificationType !== 'persistent') && (
                    <IconButton
                        icon="close"
                        size={20}
                        iconColor={paperTheme.colors.onSurfaceVariant}
                        onPress={hideNotification}
                        style={styles.closeBtn}
                    />
                )}
            </Surface>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingRight: 4,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        borderLeftWidth: 4, // Stylish accent border
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
    },
    closeBtn: {
        margin: 0,
    }
});
