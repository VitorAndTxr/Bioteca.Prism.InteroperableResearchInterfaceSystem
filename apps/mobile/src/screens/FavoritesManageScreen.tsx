/**
 * Favorites Manage Screen
 *
 * Lists all saved session favorites with rename and delete capabilities.
 * Accessible from the favorites chip strip on SessionConfigScreen
 * and from the Settings screen.
 */

import React, { FC, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { HomeStackParamList } from '@/navigation/types';
import type { SessionFavorite } from '@iris/domain';
import { theme } from '@/theme';
import { favoriteRepository } from '@/data/repositories/FavoriteRepository';
import { Star, Trash2 } from 'lucide-react-native';
import { NamePromptModal } from '@/components/NamePromptModal';

type Props = NativeStackScreenProps<HomeStackParamList, 'FavoritesManage'>;

export const FavoritesManageScreen: FC<Props> = () => {
    const [favorites, setFavorites] = useState<SessionFavorite[]>([]);
    const [renameTarget, setRenameTarget] = useState<SessionFavorite | null>(null);

    useFocusEffect(
        useCallback(() => {
            const loadFavorites = async () => {
                try {
                    const data = await favoriteRepository.getAll();
                    setFavorites(data);
                } catch (error) {
                    console.error('[FavoritesManageScreen] Failed to load favorites:', error);
                }
            };
            loadFavorites();
        }, [])
    );

    const handleDelete = (favorite: SessionFavorite) => {
        Alert.alert(
            `Delete "${favorite.name}"?`,
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await favoriteRepository.delete(favorite.id);
                            const updated = await favoriteRepository.getAll();
                            setFavorites(updated);
                        } catch (error) {
                            console.error('[FavoritesManageScreen] Failed to delete favorite:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleRename = async (newName: string) => {
        if (!renameTarget) return;
        setRenameTarget(null);
        try {
            await favoriteRepository.update(renameTarget.id, { name: newName });
            const updated = await favoriteRepository.getAll();
            setFavorites(updated);
        } catch (error) {
            console.error('[FavoritesManageScreen] Failed to rename favorite:', error);
        }
    };

    const renderItem = ({ item }: { item: SessionFavorite }) => {
        const topographyCount = item.topographyCodes.length;

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => setRenameTarget(item)}
                activeOpacity={0.6}
            >
                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <Star size={16} color={theme.colors.primary} />
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Trash2 size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.itemMeta}>
                        {item.bodyStructureName}  ·  {topographyCount} topograph{topographyCount === 1 ? 'y' : 'ies'}
                    </Text>
                    <Text style={styles.itemResearch}>
                        {item.sensorNames && item.sensorNames.length > 0
                            ? `Sensors: ${item.sensorNames.join(', ')}`
                            : 'No sensors saved'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={favorites}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Star size={48} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No favorites saved yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Save a session configuration as a favorite from the New Session screen to see it here.
                        </Text>
                    </View>
                }
            />

            <NamePromptModal
                visible={!!renameTarget}
                title="Rename Favorite"
                placeholder="Enter a new name..."
                defaultValue={renameTarget?.name ?? ''}
                onConfirm={handleRename}
                onCancel={() => setRenameTarget(null)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing['2xl'],
        flexGrow: 1,
    },
    itemContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    itemContent: {
        gap: theme.spacing.xs,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    itemName: {
        ...theme.typography.bodyBase,
        color: theme.colors.textTitle,
        fontWeight: '600',
        flex: 1,
    },
    deleteButton: {
        padding: theme.spacing.xs,
    },
    itemMeta: {
        ...theme.typography.bodySmall,
        color: theme.colors.textBody,
        marginLeft: theme.spacing.lg + theme.spacing.sm,
    },
    itemResearch: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginLeft: theme.spacing.lg + theme.spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing['2xl'],
        gap: theme.spacing.md,
    },
    emptyTitle: {
        ...theme.typography.title3,
        color: theme.colors.textTitle,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...theme.typography.bodyBase,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});
