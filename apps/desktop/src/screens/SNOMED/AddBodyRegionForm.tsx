import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { AddSnomedBodyRegionPayload, SnomedBodyRegion } from '@iris/domain';
import { snomedService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export interface AddBodyRegionFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (regionData: Partial<AddSnomedBodyRegionPayload>) => void;
    onCancel?: () => void;
}

export function AddBodyRegionForm({ handleNavigation, onSave, onCancel }: AddBodyRegionFormProps) {
    // Form state
    const [snomedCode, setSnomedCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [parentRegionCode, setParentRegionCode] = useState<string | undefined>();
    const [parentRegionOption, setParentRegionOption] = useState<{ value: string; label: string }[]>([]);


    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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

        const regionData:AddSnomedBodyRegionPayload = {
            snomedCode,
            displayName,
            description,
            parentRegionCode
        };

        try {
            setSubmitting(true);
            setSubmitError(null);

            console.log('Creating region:', regionData);
            const createdRegion = await snomedService.createBodyRegion(regionData);
            console.log('✅ Region created successfully:', createdRegion);

            // Navigate back to users list
            handleNavigation('/snomed');
        } catch (err) {
            console.error('Failed to create region:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create region';
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

                        {/* Parent Region */}
                        <Dropdown
                            label="Pertence a"
                            placeholder="Input placeholder"
                            options={parentRegionOption}
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
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                            disabled={submitting}
                        >
                            {submitting ? 'Salvando...' : 'Salvar Região do Corpo'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddBodyRegionForm;
