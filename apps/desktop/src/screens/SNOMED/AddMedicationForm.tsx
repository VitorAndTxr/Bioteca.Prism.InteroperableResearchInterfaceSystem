/**
 * AddMedicationForm Component
 *
 * Form for adding a new medication.
 * Based on Figma design node 6910-3052
 *
 * Features:
 * - SNOMED code input
 * - Medication name input
 * - Active ingredient input
 * - ANVISA code input
 * - Form validation
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedMedication, UpdateSnomedMedicationPayload } from '@iris/domain';
import '../../styles/shared/AddForm.css';
import { snomedService } from '../../services/middleware';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddMedicationFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (medicationData: Partial<SnomedMedication>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    medication?: SnomedMedication;
}

export function AddMedicationForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    medication
}: AddMedicationFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [medicationName, setMedicationName] = useState('');
    const [activeIngredient, setActiveIngredient] = useState('');
    const [anvisaCode, setAnvisaCode] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isReadOnly = mode === 'view';

    // Initialize form state from medication prop
    useEffect(() => {
        console.log('[AddMedicationForm] useEffect triggered');
        console.log('[AddMedicationForm] mode:', mode);
        console.log('[AddMedicationForm] medication:', medication);

        if (medication && (mode === 'view' || mode === 'edit')) {
            console.log('[AddMedicationForm] Initializing form with:', {
                snomedCode: medication.snomedCode,
                medicationName: medication.medicationName,
                activeIngredient: medication.activeIngredient,
                anvisaCode: medication.anvisaCode
            });
            setSnomedCode(medication.snomedCode || '');
            setMedicationName(medication.medicationName || '');
            setActiveIngredient(medication.activeIngredient || '');
            setAnvisaCode(medication.anvisaCode || '');
        }
    }, [medication, mode]);

    // Get header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes da medicação';
            case 'edit':
                return 'Editar medicação';
            case 'add':
            default:
                return 'Nova medicação';
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

        if (!medicationName.trim()) {
            newErrors.medicationName = 'Nome da medicação é obrigatório';
        }

        if (!activeIngredient.trim()) {
            newErrors.activeIngredient = 'Princípio ativo é obrigatório';
        }

        if (!anvisaCode.trim()) {
            newErrors.anvisaCode = 'Código ANVISA é obrigatório';
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
            medicationName: true,
            activeIngredient: true,
            anvisaCode: true,
        });

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            if (mode === 'edit' && medication) {
                const updatePayload: UpdateSnomedMedicationPayload = {
                    medicationName,
                    activeIngredient,
                    anvisaCode
                };
                console.log('Updating medication:', updatePayload);
                const updatedMedication = await snomedService.updateMedication(medication.snomedCode, updatePayload);
                console.log('Medication updated successfully:', updatedMedication);
            } else {
                const medicationData: SnomedMedication = {
                    snomedCode,
                    medicationName,
                    activeIngredient,
                    anvisaCode
                };
                console.log('Creating medication:', medicationData);
                const createdMedication = await snomedService.createMedication(medicationData);
                console.log('Medication created successfully:', createdMedication);
            }

            handleNavigation('/snomed');
        } catch (error) {
            console.error('Failed to save medication:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to save medication');
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
                            placeholder="Ex: 387207008"
                            value={snomedCode}
                            onChange={(e) => setSnomedCode(e.target.value)}
                            onBlur={() => handleBlur('snomedCode')}
                            validationStatus={touched.snomedCode && errors.snomedCode ? 'error' : 'none'}
                            errorMessage={touched.snomedCode ? errors.snomedCode : undefined}
                            required
                            disabled={isReadOnly || mode === 'edit'}
                        />

                        {/* Medication Name */}
                        <Input
                            label="Nome da Medicação"
                            placeholder="Ex: Paracetamol"
                            value={medicationName}
                            onChange={(e) => setMedicationName(e.target.value)}
                            onBlur={() => handleBlur('medicationName')}
                            validationStatus={touched.medicationName && errors.medicationName ? 'error' : 'none'}
                            errorMessage={touched.medicationName ? errors.medicationName : undefined}
                            required
                            disabled={isReadOnly}
                        />

                        {/* Active Ingredient */}
                        <Input
                            label="Princípio Ativo"
                            placeholder="Ex: Paracetamol 500mg"
                            value={activeIngredient}
                            onChange={(e) => setActiveIngredient(e.target.value)}
                            onBlur={() => handleBlur('activeIngredient')}
                            validationStatus={touched.activeIngredient && errors.activeIngredient ? 'error' : 'none'}
                            errorMessage={touched.activeIngredient ? errors.activeIngredient : undefined}
                            required
                            disabled={isReadOnly}
                        />

                        {/* ANVISA Code */}
                        <Input
                            label="Código ANVISA"
                            placeholder="Ex: 1.0573.0123.001-1"
                            value={anvisaCode}
                            onChange={(e) => setAnvisaCode(e.target.value)}
                            onBlur={() => handleBlur('anvisaCode')}
                            validationStatus={touched.anvisaCode && errors.anvisaCode ? 'error' : 'none'}
                            errorMessage={touched.anvisaCode ? errors.anvisaCode : undefined}
                            required
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
                                        ? 'Atualizar Medicação'
                                        : 'Salvar medicação'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddMedicationForm;
