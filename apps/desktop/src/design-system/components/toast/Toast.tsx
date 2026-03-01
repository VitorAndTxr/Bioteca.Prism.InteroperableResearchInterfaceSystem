/**
 * Toast Component
 *
 * Simple notification component for transient feedback messages.
 */

import React, { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
    /** Auto-dismiss delay in ms. Default: 4000 */
    duration?: number;
}

const variantStyles: Record<ToastVariant, React.CSSProperties> = {
    success: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' },
    error: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
    info: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
};

export function Toast({ toast, onDismiss, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), duration);
        return () => clearTimeout(timer);
    }, [toast.id, duration, onDismiss]);

    return (
        <div
            role="alert"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                minWidth: '280px',
                maxWidth: '480px',
                ...variantStyles[toast.variant],
            }}
        >
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: 'inherit',
                    padding: '0 2px',
                    lineHeight: 1,
                }}
                aria-label="Fechar notificação"
            >
                ×
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 9999,
            }}
        >
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
