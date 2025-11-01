/**
 * AddBodyStructureForm Component
 *
 * Form for adding a new SNOMED body structure.
 * Based on Figma design node 6910-2612
 *
 * Features:
 * - SNOMED code input
 * - Structure type dropdown
 * - Display name input
 * - Description input
 * - Body region selection (dropdown)
 * - Parent structure selection (dropdown)
 * - Form validation
 */

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { SnomedBodyStructure } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface AddBodyStructureFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (structureData: Partial<SnomedBodyStructure>) => void;
    onCancel?: () => void;
}

// Mock structure types - Replace with real API call
const mockStructureTypeOptions = [
    { value: 'Órgão', label: 'Órgão' },
    { value: 'Tecido', label: 'Tecido' },
    { value: 'Músculo', label: 'Músculo' },
    { value: 'Osso', label: 'Osso' },
    { value: 'Articulação', label: 'Articulação' },
];

// Mock body regions - Replace with real API call
const mockBodyRegionOptions = [
    { value: '123037004', label: 'Estrutura da cabeça' },
    { value: '302509004', label: 'Estrutura do tronco' },
    { value: '362874006', label: 'Membro superior' },
    { value: '362875007', label: 'Membro inferior' },
];

// Mock parent structures - Replace with real API call
const mockParentStructureOptions = [
    { value: '21483005', label: 'Estrutura do coração' },
    { value: '39607008', label: 'Estrutura do pulmão' },
    { value: '113257007', label: 'Estrutura do fígado' },
];

export function AddBodyStructureForm({ handleNavigation, onSave, onCancel }: AddBodyStructureFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [structureType, setStructureType] = useState<string>('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [bodyRegionCode, setBodyRegionCode] = useState<string>('');
    const [parentStructureCode, setParentStructureCode] = useState<string>('');

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

        if (!structureType) {
            newErrors.structureType = 'Tipo é obrigatório';
        }

        if (!displayName.trim()) {
            newErrors.displayName = 'Nome é obrigatório';
        }

        if (!description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }

        if (!bodyRegionCode) {
            newErrors.bodyRegionCode = 'Região do corpo é obrigatória';
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
            structureType: true,
            displayName: true,
            description: true,
            bodyRegionCode: true,
        });

        if (!validateForm()) {
            return;
        }

        const structureData: Partial<SnomedBodyStructure> = {
            snomedCode,
            structureType,
            displayName,
            description,
            bodyRegionCode,
            parentStructureCode: parentStructureCode || undefined,
            isActive: true,
        };

        if (onSave) {
            onSave(structureData);
        } else {
            console.log('Body structure data to save:', structureData);
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
                title: 'Nova estrutura do corpo',
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

                        {/* Type */}
                        <Dropdown
                            label="Tipo"
                            placeholder="Input placeholder"
                            options={mockStructureTypeOptions}
                            value={structureType}
                            onChange={(value) => setStructureType(value as string)}
                            onBlur={() => handleBlur('structureType')}
                            validation={touched.structureType && errors.structureType ? 'error' : 'none'}
                            errorMessage={touched.structureType ? errors.structureType : undefined}
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

                        {/* Body Region */}
                        <Dropdown
                            label="Região do corpo"
                            placeholder="Input placeholder"
                            options={mockBodyRegionOptions}
                            value={bodyRegionCode}
                            onChange={(value) => setBodyRegionCode(value as string)}
                            onBlur={() => handleBlur('bodyRegionCode')}
                            validation={touched.bodyRegionCode && errors.bodyRegionCode ? 'error' : 'none'}
                            errorMessage={touched.bodyRegionCode ? errors.bodyRegionCode : undefined}
                            searchable
                            required
                        />

                        {/* Parent Structure */}
                        <Dropdown
                            label="Pertence a"
                            placeholder="Input placeholder"
                            options={mockParentStructureOptions}
                            value={parentStructureCode}
                            onChange={(value) => setParentStructureCode(value as string)}
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
                            Salvar estrutura do corpo
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddBodyStructureForm;
