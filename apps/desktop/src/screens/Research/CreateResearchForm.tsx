/**
 * CreateResearchForm Component
 *
 * Form for creating a new research project.
 * Uses the ResearchService to create projects in the IRN backend.
 *
 * Features:
 * - Title input
 * - Description textarea
 * - Research Node selection
 * - Form validation
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { NewResearchData, ResearchNodeConnection } from '@iris/domain';
import { researchService, nodeConnectionService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export interface CreateResearchFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (researchData: NewResearchData) => void;
    onCancel?: () => void;
}

export function CreateResearchForm({ handleNavigation, onSave, onCancel }: CreateResearchFormProps) {
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [researchNodeId, setResearchNodeId] = useState<string>('');
    const [nodeOptions, setNodeOptions] = useState<{ value: string; label: string }[]>([]);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Load research nodes for dropdown
    useEffect(() => {
        loadNodeOptions();
    }, []);

    const loadNodeOptions = async () => {
        try {
            const response = await nodeConnectionService.getActiveNodeConnectionsPaginated(1, 100);
            const options = response.data.map((node: ResearchNodeConnection) => ({
                value: node.id,
                label: `${node.nodeName} (${node.nodeUrl})`,
            }));
            setNodeOptions(options);
        } catch (error) {
            console.error('Failed to fetch research nodes for dropdown:', error);
            // Set a default mock option for development
            setNodeOptions([
                { value: 'mock-node-1', label: 'Mock Node 1 (https://mock-node-1.com)' },
                { value: 'mock-node-2', label: 'Mock Node 2 (https://mock-node-2.com)' },
            ]);
        }
    };

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Título é obrigatório';
        } else if (title.length > 500) {
            newErrors.title = 'Título deve ter no máximo 500 caracteres';
        }

        if (!description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        } else if (description.length > 2000) {
            newErrors.description = 'Descrição deve ter no máximo 2000 caracteres';
        }

        if (!researchNodeId) {
            newErrors.researchNodeId = 'Nó de pesquisa é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            title: true,
            description: true,
            researchNodeId: true,
        });

        if (!validateForm()) {
            return;
        }

        const researchData: NewResearchData = {
            title: title.trim(),
            description: description.trim(),
            researchNodeId,
        };

        // If custom save handler provided, use it
        if (onSave) {
            onSave(researchData);
            return;
        }

        // Otherwise, save via ResearchService
        try {
            setSubmitting(true);
            setSubmitError(null);

            console.log('Creating research project:', researchData);
            const createdResearch = await researchService.createResearch(researchData);
            console.log('Research project created successfully:', createdResearch);

            // Navigate back to research list
            handleNavigation('/research');
        } catch (err) {
            console.error('Failed to create research project:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create research project';
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
            handleNavigation('/research');
        }
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/research',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Novo Projeto de Pesquisa',
                showUserMenu: true,
            }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
                    {/* Error message */}
                    {submitError && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee',
                            color: '#c33',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            border: '1px solid #fcc'
                        }}>
                            <strong>Erro:</strong> {submitError}
                        </div>
                    )}

                    <div className="add-form__fields">
                        {/* Title */}
                        <Input
                            label="Título"
                            placeholder="Digite o título do projeto de pesquisa"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => handleBlur('title')}
                            validationStatus={touched.title && errors.title ? 'error' : 'none'}
                            errorMessage={touched.title ? errors.title : undefined}
                            helperText={`${title.length}/500 caracteres`}
                            required
                        />

                        {/* Description */}
                        <div className="add-form__field">
                            <label className="input-label">
                                Descrição <span className="required">*</span>
                            </label>
                            <textarea
                                className={`input-textarea ${touched.description && errors.description ? 'error' : ''}`}
                                placeholder="Digite a descrição do projeto de pesquisa"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleBlur('description')}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${touched.description && errors.description ? '#ef4444' : '#e5e7eb'}`,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '100px'
                                }}
                            />
                            {touched.description && errors.description && (
                                <span className="input-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description}
                                </span>
                            )}
                            <span className="input-helper" style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {description.length}/2000 caracteres
                            </span>
                        </div>

                        {/* Research Node */}
                        <Dropdown
                            label="Nó de Pesquisa"
                            placeholder="Selecione o nó de pesquisa"
                            options={nodeOptions}
                            value={researchNodeId}
                            onChange={(value) => setResearchNodeId(value as string)}
                            onBlur={() => handleBlur('researchNodeId')}
                            validation={touched.researchNodeId && errors.researchNodeId ? 'error' : 'none'}
                            errorMessage={touched.researchNodeId ? errors.researchNodeId : undefined}
                            searchable
                            fullWidth
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
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                            disabled={submitting}
                        >
                            {submitting ? 'Salvando...' : 'Salvar Projeto'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateResearchForm;
