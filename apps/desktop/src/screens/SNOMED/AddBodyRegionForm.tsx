/**
 * AddBodyRegionForm Component
 *
 * Form for adding a new SNOMED body region.
 * Based on Figma design node 6910-2488
 *
 * Features:
 * - SNOMED code input
 * - Display name input
 * - Description input
 * - Parent region selection (dropdown)
 * - Form validation
 */

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedBodyRegion } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface AddBodyRegionFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (regionData: Partial<SnomedBodyRegion>) => void;
    onCancel?: () => void;
}

// Mock parent regions - Replace with real API call
const mockParentRegionOptions = [
    { value: '123037004', label: 'Estrutura da cabeça' },
    { value: '302509004', label: 'Estrutura do tronco' },
    { value: '362874006', label: 'Membro superior' },
    { value: '362875007', label: 'Membro inferior' },
];

export function AddBodyRegionForm({ handleNavigation, onSave, onCancel }: AddBodyRegionFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [parentRegionCode, setParentRegionCode] = useState<string>('');

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

        const regionData: Partial<SnomedBodyRegion> = {
            snomedCode,
            displayName,
            description,
            parentRegionCode: parentRegionCode || undefined,
            isActive: true,
        };

        if (onSave) {
            onSave(regionData);
        } else {
            console.log('Body region data to save:', regionData);
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
                title: 'Nova região do corpo',
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
                            fullWidth
                        />

                        {/* Parent Region */}
                        <Dropdown
                            label="Pertence a"
                            placeholder="Input placeholder"
                            options={mockParentRegionOptions}
                            value={parentRegionCode}
                            onChange={(value) => setParentRegionCode(value as string)}
                            searchable
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
                            Salvar região do corpo
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddBodyRegionForm;
