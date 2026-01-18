import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { AddSnomedBodyRegionPayload, SnomedBodyRegion, UpdateSnomedBodyRegionPayload } from '@iris/domain';
import { snomedService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddBodyRegionFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (regionData: Partial<AddSnomedBodyRegionPayload>) => void;
    onCancel?: () => void;
    mode?: FormMode;
    bodyRegion?: SnomedBodyRegion;
}

export function AddBodyRegionForm({ handleNavigation, onSave, onCancel, mode = 'add', bodyRegion }: AddBodyRegionFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [parentRegionCode, setParentRegionCode] = useState<string | undefined>();
    const [parentRegionOption, setParentRegionOption] = useState<{ value: string; label: string }[]>([]);

    // Derived state
    const isReadOnly = mode === 'view';

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Initialize form from bodyRegion prop
    useEffect(() => {
        if (bodyRegion) {
            setSnomedCode(bodyRegion.snomedCode);
            setDisplayName(bodyRegion.displayName);
            setDescription(bodyRegion.description);
            setParentRegionCode(bodyRegion.parentRegion?.snomedCode);
        }
    }, [bodyRegion]);

    useEffect(() => {
        snomedService.getActiveBodyRegions().then(response => {
            const options = response.map(region => ({
                value: region.snomedCode,
                label: `${region.displayName}`,
            }));
            setParentRegionOption(options);
        }).catch(error => {
            console.error('Failed to fetch body regions for dropdown:', error);
        });
    }, []);

    // Dynamic header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes da região do corpo';
            case 'edit':
                return 'Editar região do corpo';
            case 'add':
            default:
                return 'Nova região do corpo';
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

            if (mode === 'edit' && bodyRegion) {
                const updatePayload: UpdateSnomedBodyRegionPayload = {
                    displayName,
                    description
                };
                console.log('Updating region:', updatePayload);
                const updatedRegion = await snomedService.updateBodyRegion(bodyRegion.snomedCode, updatePayload);
                console.log('✅ Region updated successfully:', updatedRegion);
            } else {
                const regionData: AddSnomedBodyRegionPayload = {
                    snomedCode,
                    displayName,
                    description,
                    parentRegionCode
                };
                console.log('Creating region:', regionData);
                const createdRegion = await snomedService.createBodyRegion(regionData);
                console.log('✅ Region created successfully:', createdRegion);
            }

            handleNavigation('/snomed');
        } catch (err) {
            console.error('Failed to save region:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save region';
            setSubmitError(errorMessage);
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

                        {/* Parent Region */}
                        <Dropdown
                            label="Pertence a"
                            placeholder="Input placeholder"
                            options={parentRegionOption}
                            value={parentRegionCode}
                            onChange={(value) => setParentRegionCode(Array.isArray(value) ? value[0] : value)}
                            searchable
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
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Salvando...'
                                    : mode === 'edit'
                                        ? 'Atualizar Região do Corpo'
                                        : 'Salvar Região do Corpo'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddBodyRegionForm;
