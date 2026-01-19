/**
 * AddAllergyIntoleranceForm Component
 *
 * Form for adding a new allergy/intolerance.
 * Based on Figma design node 6910-3177
 *
 * Features:
 * - SNOMED code input
 * - Category selection
 * - Substance name input
 * - Type selection (allergy/intolerance)
 * - Form validation
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedAllergyIntolerance, UpdateSnomedAllergyIntolerancePayload } from '@iris/domain';
import '../../styles/shared/AddForm.css';
import { snomedService } from '../../services/middleware';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddAllergyIntoleranceFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (allergyData: Partial<SnomedAllergyIntolerance>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    allergyIntolerance?: SnomedAllergyIntolerance;
}

// Category options for allergy/intolerance
const categoryOptions = [
    { value: 'food', label: 'Alimento' },
    { value: 'medication', label: 'Medicamento' },
    { value: 'environment', label: 'Ambiental' },
    { value: 'biologic', label: 'Biológico' },
    { value: 'other', label: 'Outro' },
];

// Type options
const typeOptions = [
    { value: 'allergy', label: 'Alergia' },
    { value: 'intolerance', label: 'Intolerância' },
];

export function AddAllergyIntoleranceForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    allergyIntolerance
}: AddAllergyIntoleranceFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [category, setCategory] = useState('');
    const [substanceName, setSubstanceName] = useState('');
    const [type, setType] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isReadOnly = mode === 'view';

    // Initialize form state from allergyIntolerance prop
    useEffect(() => {
        console.log('[AddAllergyIntoleranceForm] useEffect triggered');
        console.log('[AddAllergyIntoleranceForm] mode:', mode);
        console.log('[AddAllergyIntoleranceForm] allergyIntolerance:', allergyIntolerance);

        if (allergyIntolerance && (mode === 'view' || mode === 'edit')) {
            console.log('[AddAllergyIntoleranceForm] Initializing form with:', {
                snomedCode: allergyIntolerance.snomedCode,
                category: allergyIntolerance.category,
                substanceName: allergyIntolerance.substanceName,
                type: allergyIntolerance.type
            });
            setSnomedCode(allergyIntolerance.snomedCode || '');
            setCategory(allergyIntolerance.category || '');
            setSubstanceName(allergyIntolerance.substanceName || '');
            setType(allergyIntolerance.type || '');
        }
    }, [allergyIntolerance, mode]);

    // Get header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes da alergia/intolerância';
            case 'edit':
                return 'Editar alergia/intolerância';
            case 'add':
            default:
                return 'Nova alergia/intolerância';
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

        if (!category.trim()) {
            newErrors.category = 'Categoria é obrigatória';
        }

        if (!substanceName.trim()) {
            newErrors.substanceName = 'Nome da substância é obrigatório';
        }

        if (!type.trim()) {
            newErrors.type = 'Tipo é obrigatório';
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
            category: true,
            substanceName: true,
            type: true,
        });

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            if (mode === 'edit' && allergyIntolerance) {
                const updatePayload: UpdateSnomedAllergyIntolerancePayload = {
                    category,
                    substanceName,
                    type
                };
                console.log('Updating allergy/intolerance:', updatePayload);
                const updatedAllergy = await snomedService.updateAllergyIntolerance(allergyIntolerance.snomedCode, updatePayload);
                console.log('Allergy/intolerance updated successfully:', updatedAllergy);
            } else {
                const allergyData: SnomedAllergyIntolerance = {
                    snomedCode,
                    category,
                    substanceName,
                    type
                };
                console.log('Creating allergy/intolerance:', allergyData);
                const createdAllergy = await snomedService.createAllergyIntolerance(allergyData);
                console.log('Allergy/intolerance created successfully:', createdAllergy);
            }

            handleNavigation('/snomed');
        } catch (error) {
            console.error('Failed to save allergy/intolerance:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to save allergy/intolerance');
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
                            placeholder="Ex: 91935009"
                            value={snomedCode}
                            onChange={(e) => setSnomedCode(e.target.value)}
                            onBlur={() => handleBlur('snomedCode')}
                            validationStatus={touched.snomedCode && errors.snomedCode ? 'error' : 'none'}
                            errorMessage={touched.snomedCode ? errors.snomedCode : undefined}
                            required
                            disabled={isReadOnly || mode === 'edit'}
                        />

                        {/* Substance Name */}
                        <Input
                            label="Nome da Substância"
                            placeholder="Ex: Penicilina"
                            value={substanceName}
                            onChange={(e) => setSubstanceName(e.target.value)}
                            onBlur={() => handleBlur('substanceName')}
                            validationStatus={touched.substanceName && errors.substanceName ? 'error' : 'none'}
                            errorMessage={touched.substanceName ? errors.substanceName : undefined}
                            required
                            disabled={isReadOnly}
                        />

                        {/* Category */}
                        <Dropdown
                            label="Categoria"
                            placeholder="Selecione a categoria"
                            options={categoryOptions}
                            value={category}
                            onChange={(value) => {
                                setCategory(value);
                                handleBlur('category');
                            }}
                            disabled={isReadOnly}
                            required
                        />

                        {/* Type */}
                        <Dropdown
                            label="Tipo"
                            placeholder="Selecione o tipo"
                            options={typeOptions}
                            value={type}
                            onChange={(value) => {
                                setType(value);
                                handleBlur('type');
                            }}
                            disabled={isReadOnly}
                            required
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
                                        ? 'Atualizar Alergia/Intolerância'
                                        : 'Salvar alergia/intolerância'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddAllergyIntoleranceForm;
