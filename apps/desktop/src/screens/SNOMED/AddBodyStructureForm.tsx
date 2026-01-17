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

import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { AddSnomedBodyStructurePayload, SnomedBodyStructure } from '@iris/domain';
import '../../styles/shared/AddForm.css';
import { snomedService } from '../../services/middleware';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddBodyStructureFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (structureData: Partial<SnomedBodyStructure>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    bodyStructure?: SnomedBodyStructure;
}

// Mock structure types - Replace with real API call
const mockStructureTypeOptions = [
    { value: 'Órgão', label: 'Órgão' },
    { value: 'Tecido', label: 'Tecido' },
    { value: 'Músculo', label: 'Músculo' },
    { value: 'Osso', label: 'Osso' },
    { value: 'Articulação', label: 'Articulação' },
];

export function AddBodyStructureForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    bodyStructure
}: AddBodyStructureFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [structureType, setStructureType] = useState<string>('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [bodyRegionCode, setBodyRegionCode] = useState<string>('');
    const [parentStructureCode, setParentStructureCode] = useState<string | undefined>();

    const [parentRegionOption, setParentRegionOption] = useState<{ value: string; label: string }[]>([]);
    const [parentStructureOption, setParentStructureOption] = useState<{ value: string; label: string }[]>([]);

    // Derived state
    const isReadOnly = mode === 'view';

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Initialize form state from bodyStructure prop
    useEffect(() => {
        if (bodyStructure) {
            setSnomedCode(bodyStructure.snomedCode);
            setStructureType(bodyStructure.structureType);
            setDisplayName(bodyStructure.displayName);
            setDescription(bodyStructure.description);
            setBodyRegionCode(bodyStructure.parentRegion?.snomedCode ?? '');
            setParentStructureCode(bodyStructure.parentStructureCode?.snomedCode);
        }
    }, [bodyStructure]);

    useEffect(() => {
        snomedService.getActiveBodyRegions().then(response => {
            const options = response.map(bodyRegion => ({
                value: bodyRegion.snomedCode,
                label: `${bodyRegion.displayName}`,
            }));
            setParentRegionOption(options);
        }).catch(error => {
            console.error('Failed to fetch body regions for dropdown:', error);
        });

        snomedService.getActiveBodyStructures().then(response => {
            const options = response.map(bodyStructure => ({
                value: bodyStructure.snomedCode,
                label: `${bodyStructure.displayName}`,
            }));
            setParentStructureOption(options);
        }).catch(error => {
            console.error('Failed to fetch body structures for dropdown:', error);
        });

    }, []);

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
    const handleSubmit = async (e: FormEvent) => {
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

        const structureData: AddSnomedBodyStructurePayload = {
            snomedCode,
            type: structureType,
            displayName,
            description,
            bodyRegionCode: bodyRegionCode,
            parentStructureCode
        };

        console.log('Submitting structure data:', structureData);

        try {
            setSubmitting(true);
            setSubmitError(null);  

            const createdBodyStructure = await snomedService.createBodyStructure(structureData);

            console.log('✅ Structure created successfully:', createdBodyStructure);

            handleNavigation('/snomed');
        } catch (error) {
            console.error('Failed to create body structure:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create body structure';
            setSubmitError(errorMessage);
        }finally {
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

    // Dynamic header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes da estrutura do corpo';
            case 'edit':
                return 'Editar estrutura do corpo';
            case 'add':
            default:
                return 'Nova estrutura do corpo';
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
                            disabled={isReadOnly}
                            required
                        />

                        {/* Type */}
                        <Dropdown
                            label="Tipo"
                            placeholder="Input placeholder"
                            options={mockStructureTypeOptions}
                            value={structureType}
                            onChange={(value) => setStructureType(Array.isArray(value) ? value[0] : value)}
                            onBlur={() => handleBlur('structureType')}
                            validation={touched.structureType && errors.structureType ? 'error' : 'none'}
                            errorMessage={touched.structureType ? errors.structureType : undefined}
                            disabled={isReadOnly}
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
                            disabled={isReadOnly}
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
                            disabled={isReadOnly}
                            required
                        />

                        {/* Body Region */}
                        <Dropdown
                            label="Região do corpo"
                            placeholder="Input placeholder"
                            options={parentRegionOption}
                            value={bodyRegionCode}
                            onChange={(value) => setBodyRegionCode(Array.isArray(value) ? value[0] : value)}
                            onBlur={() => handleBlur('bodyRegionCode')}
                            validation={touched.bodyRegionCode && errors.bodyRegionCode ? 'error' : 'none'}
                            errorMessage={touched.bodyRegionCode ? errors.bodyRegionCode : undefined}
                            disabled={isReadOnly}
                            searchable
                            required
                        />

                        {/* Parent Structure */}
                        <Dropdown
                            label="Pertence a"
                            placeholder="Input placeholder"
                            options={parentStructureOption}
                            value={parentStructureCode}
                            onChange={(value) => setParentStructureCode(Array.isArray(value) ? value[0] : value)}
                            disabled={isReadOnly}
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
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        {mode !== 'view' && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="big"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Salvando...'
                                    : mode === 'edit'
                                        ? 'Atualizar Estrutura do Corpo'
                                        : 'Salvar Estrutura do Corpo'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddBodyStructureForm;
