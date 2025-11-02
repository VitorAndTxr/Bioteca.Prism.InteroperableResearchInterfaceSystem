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

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedTopographicalModifier } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface AddTopographicModifierFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (modifierData: Partial<SnomedTopographicalModifier>) => void;
    onCancel?: () => void;
}

// Mock categories - Replace with real API call
const mockCategoryOptions = [
    { value: 'Lateralidade', label: 'Lateralidade' },
    { value: 'Localização', label: 'Localização' },
    { value: 'Distribuição', label: 'Distribuição' },
    { value: 'Orientação', label: 'Orientação' },
];

export function AddTopographicModifierForm({ handleNavigation, onSave, onCancel }: AddTopographicModifierFormProps) {
    // Form state
    const [code, setCode] = useState('');
    const [category, setCategory] = useState<string>('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    const handleSubmit = (e: FormEvent) => {
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

        const modifierData: Partial<SnomedTopographicalModifier> = {
            code,
            category,
            displayName,
            description,
            isActive: true,
        };

        if (onSave) {
            onSave(modifierData);
        } else {
            console.log('Topographic modifier data to save:', modifierData);
            // Navigate back to SNOMED list
            handleNavigation('/snomed');
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
                title: 'Novo modificador topográfico',
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
                        />

                        {/* Category */}
                        <Dropdown
                            label="Categoria"
                            placeholder="Input placeholder"
                            options={mockCategoryOptions}
                            value={category}
                            onChange={(value) => setCategory(value as string)}
                            onBlur={() => handleBlur('category')}
                            validation={touched.category && errors.category ? 'error' : 'none'}
                            errorMessage={touched.category ? errors.category : undefined}
                            required
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
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                            icon={<CheckCircleIcon className="w-5 h-5" />}
                            iconPosition="left"
                        >
                            Salvar modificador topográfico
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddTopographicModifierForm;
