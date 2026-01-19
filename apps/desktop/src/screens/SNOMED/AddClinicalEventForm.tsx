/**
 * AddClinicalEventForm Component
 *
 * Form for adding a new clinical event.
 * Based on Figma design node 6910-2905
 *
 * Features:
 * - SNOMED code input
 * - Display name input
 * - Description input
 * - Form validation
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedClinicalEvent, UpdateSnomedClinicalEventPayload } from '@iris/domain';
import '../../styles/shared/AddForm.css';
import { snomedService } from '../../services/middleware';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddClinicalEventFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (eventData: Partial<SnomedClinicalEvent>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    clinicalEvent?: SnomedClinicalEvent;
}

export function AddClinicalEventForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    clinicalEvent
}: AddClinicalEventFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isReadOnly = mode === 'view';

    // Initialize form state from clinicalEvent prop
    useEffect(() => {
        console.log('[AddClinicalEventForm] useEffect triggered');
        console.log('[AddClinicalEventForm] mode:', mode);
        console.log('[AddClinicalEventForm] clinicalEvent:', clinicalEvent);

        if (clinicalEvent && (mode === 'view' || mode === 'edit')) {
            console.log('[AddClinicalEventForm] Initializing form with:', {
                snomedCode: clinicalEvent.snomedCode,
                displayName: clinicalEvent.displayName,
                description: clinicalEvent.description
            });
            setSnomedCode(clinicalEvent.snomedCode || '');
            setDisplayName(clinicalEvent.displayName || '');
            setDescription(clinicalEvent.description || '');
        }
    }, [clinicalEvent, mode]);

    // Get header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes do evento clínico';
            case 'edit':
                return 'Editar evento clínico';
            case 'add':
            default:
                return 'Novo evento clínico';
        }
    };

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!snomedCode.trim()) {
            newErrors.snomedCode = 'Código SNOMED é obrigatório';
        }

        if (!displayName.trim()) {
            newErrors.displayName = 'Nome é obrigatório';
        }

        if (!description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark all required fields as touched
        setTouched({
            snomedCode: true,
            displayName: true,
            description: true,
        });

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            if (mode === 'edit' && clinicalEvent) {
                const updatePayload: UpdateSnomedClinicalEventPayload = {
                    displayName,
                    description
                };
                console.log('Updating clinical event:', updatePayload);
                const updatedEvent = await snomedService.updateClinicalEvent(clinicalEvent.snomedCode, updatePayload);
                console.log('Clinical event updated successfully:', updatedEvent);
            } else {
                const eventData: SnomedClinicalEvent = {
                    snomedCode,
                    displayName,
                    description
                };
                console.log('Creating clinical event:', eventData);
                const createdClinicalEvent = await snomedService.createClinicalEvent(eventData);
                console.log('Clinical event created successfully:', createdClinicalEvent);
            }

            handleNavigation('/snomed');
        } catch (error) {
            console.error('Failed to save clinical event:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to save clinical event');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle cancel/back
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleNavigation('/snomed');
        }
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/snomed',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: getHeaderTitle(),
                showUserMenu: true,
            }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
                    <div className="add-form__fields">
                        {/* SNOMED Code */}
                        <Input
                            label="Código SNOMED"
                            placeholder="Input placeholder"
                            value={snomedCode}
                            onChange={(e) => setSnomedCode(e.target.value)}
                            onBlur={() => handleBlur('snomedCode')}
                            validationStatus={touched.snomedCode && errors.snomedCode ? 'error' : 'none'}
                            errorMessage={touched.snomedCode ? errors.snomedCode : undefined}
                            required
                            disabled={isReadOnly || mode === 'edit'}
                        />

                        {/* Name */}
                        <Input
                            label="Nome"
                            placeholder="Input placeholder"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            onBlur={() => handleBlur('displayName')}
                            validationStatus={touched.displayName && errors.displayName ? 'error' : 'none'}
                            errorMessage={touched.displayName ? errors.displayName : undefined}
                            required
                            disabled={isReadOnly}
                        />

                        {/* Description - Full width */}
                        <Input
                            label="Descrição"
                            placeholder="Input placeholder"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => handleBlur('description')}
                            validationStatus={touched.description && errors.description ? 'error' : 'none'}
                            errorMessage={touched.description ? errors.description : undefined}
                            required
                            fullWidth
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="add-form__actions">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleCancel}
                            icon={<ArrowLeftIcon className="w-5 h-5" />}
                            iconPosition="left"
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        {!isReadOnly && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="big"
                                icon={<CheckCircleIcon className="w-5 h-5" />}
                                iconPosition="left"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Salvando...'
                                    : mode === 'edit'
                                        ? 'Atualizar Evento Clínico'
                                        : 'Salvar evento clínico'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddClinicalEventForm;
