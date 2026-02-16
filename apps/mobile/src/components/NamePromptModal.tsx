/**
 * Name Prompt Modal
 *
 * Cross-platform modal with TextInput for entering a name.
 * Used by SessionConfigScreen (save favorite) and FavoritesManageScreen (rename).
 * Alert.prompt is iOS-only; this component works on both platforms.
 */

import React, { FC, useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { theme } from '@/theme';

interface NamePromptModalProps {
    visible: boolean;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
}

export const NamePromptModal: FC<NamePromptModalProps> = ({
    visible,
    title,
    placeholder,
    defaultValue = '',
    onConfirm,
    onCancel,
}) => {
    const [value, setValue] = useState(defaultValue);

    // Reset value when modal opens with a new defaultValue
    useEffect(() => {
        if (visible) {
            setValue(defaultValue);
        }
    }, [visible, defaultValue]);

    const handleConfirm = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onConfirm(trimmed);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>

                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder={placeholder ?? 'Enter a name...'}
                        placeholderTextColor={theme.colors.textMuted}
                        autoFocus
                        selectTextOnFocus
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, !value.trim() && styles.confirmButtonDisabled]}
                            onPress={handleConfirm}
                            disabled={!value.trim()}
                        >
                            <Text style={[styles.confirmText, !value.trim() && styles.confirmTextDisabled]}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    container: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        ...theme.shadow.md,
    },
    title: {
        ...theme.typography.title3,
        color: theme.colors.textTitle,
        marginBottom: theme.spacing.lg,
    },
    input: {
        ...theme.typography.bodyBase,
        color: theme.colors.textBody,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.md,
    },
    cancelButton: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
    },
    cancelText: {
        ...theme.typography.uiBase,
        color: theme.colors.textMuted,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmText: {
        ...theme.typography.uiBase,
        color: theme.colors.surface,
        fontWeight: '600',
    },
    confirmTextDisabled: {
        color: theme.colors.surface,
    },
});
