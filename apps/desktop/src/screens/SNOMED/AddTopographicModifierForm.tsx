/**
 * AddTopographicModifierForm Component
 *
 * Form for adding a new SNOMED topographic modifier.
 * Based on Figma design node 6910-2719
 *
 * Features:
 * - SNOMED code input
 * - Category dropdown
 * - Display name input
 * - Description input
 * - Form validation
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedTopographicalModifier } from '@iris/domain';
import { snomedService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddTopographicModifierFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (modifierData: Partial<SnomedTopographicalModifier>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    topographicModifier?: SnomedTopographicalModifier;
}

// Mock categories - Replace with real API call
const mockCategoryOptions = [
    { value: 'Lateralidade', label: 'Lateralidade' },
    { value: 'Localização', label: 'Localização' },
    { value: 'Distribuição', label: 'Distribuição' },
    { value: 'Orientação', label: 'Orientação' },
];

export function AddTopographicModifierForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    topographicModifier
}: AddTopographicModifierFormProps) {
    // Form state
    const [code, setCode] = useState('');
    const [category, setCategory] = useState<string>('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isReadOnly = mode === 'view';

    // Initialize form state from topographicModifier prop
    useEffect(() => {
        if (topographicModifier) {
            setCode(topographicModifier.snomedCode);
            setCategory(topographicModifier.category);
            setDisplayName(topographicModifier.displayName);
            setDescription(topographicModifier.description);
        }
    }, [topographicModifier]);

    // Dynamic header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes do modificador topográfico';
            case 'edit':
                return 'Editar modificador topográfico';
            case 'add':
            default:
                return 'Novo modificador topográfico';
        }
    };

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!code.trim()) {
            newErrors.code = 'Código SNOMED é obrigatório';
        }

        if (!category) {
            newErrors.category = 'Categoria é obrigatória';
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
            code: true,
            category: true,
            displayName: true,
            description: true,
        });

        if (!validateForm()) {
            return;
        }

        const modifierData: SnomedTopographicalModifier = {
            snomedCode: code,
            category,
            displayName,
            description
        };

        try{
            setSubmitting(true);
            setSubmitError(null);

            const createdModifier = await snomedService.createTopographicalModifier(modifierData);

            console.log('Created Topographical Modifier:', createdModifier);

            handleNavigation('/snomed');
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to save topographical modifier');
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
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onBlur={() => handleBlur('code')}
                            validationStatus={touched.code && errors.code ? 'error' : 'none'}
                            errorMessage={touched.code ? errors.code : undefined}
                            required
                            disabled={isReadOnly}
                        />

                        {/* Category */}
                        <Dropdown
                            label="Categoria"
                            placeholder="Input placeholder"
                            options={mockCategoryOptions}
                            value={category}
                            onChange={(value) => setCategory(Array.isArray(value) ? value[0] ?? '' : value)}
                            onBlur={() => handleBlur('category')}
                            validation={touched.category && errors.category ? 'error' : 'none'}
                            errorMessage={touched.category ? errors.category : undefined}
                            required
                            disabled={isReadOnly}
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

                        {/* Description */}
                        <Input
                            label="Descrição"
                            placeholder="Input placeholder"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => handleBlur('description')}
                            validationStatus={touched.description && errors.description ? 'error' : 'none'}
                            errorMessage={touched.description ? errors.description : undefined}
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
                        {mode !== 'view' && (
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
                                        ? 'Atualizar Modificador Topográfico'
                                        : 'Salvar modificador topográfico'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddTopographicModifierForm;
