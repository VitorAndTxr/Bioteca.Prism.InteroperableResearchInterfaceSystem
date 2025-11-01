/**
 * AddClinicalConditionForm Component
 *
 * Form for adding a new clinical condition.
 * Based on Figma design node 6910-2825
 *
 * Features:
 * - SNOMED code input
 * - Display name input
 * - Description input
 * - Form validation
 */

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { ClinicalCondition } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface AddClinicalConditionFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (conditionData: Partial<ClinicalCondition>) => void;
    onCancel?: () => void;
}

export function AddClinicalConditionForm({ handleNavigation, onSave, onCancel }: AddClinicalConditionFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
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
    const handleSubmit = (e: FormEvent) => {
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

        const conditionData: Partial<ClinicalCondition> = {
            snomedCode,
            displayName,
            description,
            isActive: true,
        };

        if (onSave) {
            onSave(conditionData);
        } else {
            console.log('Clinical condition data to save:', conditionData);
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
                title: 'Nova condição clínica',
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
                            fullWidth
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
                            fullWidth
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
                            Salvar condição clínica
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddClinicalConditionForm;
