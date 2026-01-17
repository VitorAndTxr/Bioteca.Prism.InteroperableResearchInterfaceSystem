/**
 * Modal Component
 *
 * A reusable modal dialog component following the IRIS design system.
 *
 * Features:
 * - Backdrop overlay with click-to-close
 * - Keyboard accessibility (Escape to close)
 * - Focus trapping
 * - Customizable header, content, and footer
 * - Multiple sizes
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 *   <div className="modal-actions">
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *     <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
 *   </div>
 * </Modal>
 * ```
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './Modal.css';

export interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title displayed in header */
    title?: string;
    /** Modal content */
    children: React.ReactNode;
    /** Size variant */
    size?: 'small' | 'medium' | 'large';
    /** Whether to show close button in header */
    showCloseButton?: boolean;
    /** Whether clicking backdrop closes modal */
    closeOnBackdropClick?: boolean;
    /** Whether pressing Escape closes modal */
    closeOnEscape?: boolean;
    /** Additional CSS class for modal container */
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    className = '',
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle Escape key
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) {
            onClose();
        }
    };

    // Add/remove event listeners
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            if (firstElement) {
                firstElement.focus();
            }
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="iris-modal-backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                ref={modalRef}
                className={`iris-modal iris-modal--${size} ${className}`}
            >
                {(title || showCloseButton) && (
                    <div className="iris-modal__header">
                        {title && (
                            <h2 id="modal-title" className="iris-modal__title">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                className="iris-modal__close"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
                <div className="iris-modal__content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
