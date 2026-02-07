/**
 * CreateResearchForm Component
 *
 * Form for creating and editing research projects.
 * Uses the ResearchService to manage projects in the IRN backend.
 *
 * Modes:
 * - add: Create a new research project
 * - edit: Update an existing research project (includes status field)
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { ResearchStatus } from '@iris/domain';
import type { NewResearchData, UpdateResearchData, Research, ResearchNodeConnection } from '@iris/domain';
import { researchService, nodeConnectionService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'edit';

export interface CreateResearchFormProps {
    handleNavigation: (path: string) => void;
    onCancel?: () => void;
    mode?: FormMode;
    research?: Research;
}

const statusOptions = [
    { value: ResearchStatus.PLANNING, label: 'Planejamento' },
    { value: ResearchStatus.ACTIVE, label: 'Ativo' },
    { value: ResearchStatus.COMPLETED, label: 'Concluído' },
    { value: ResearchStatus.SUSPENDED, label: 'Suspenso' },
    { value: ResearchStatus.CANCELLED, label: 'Cancelado' },
];

export function CreateResearchForm({
    handleNavigation,
    onCancel,
    mode = 'add',
    research
}: CreateResearchFormProps) {
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [researchNodeId, setResearchNodeId] = useState<string>('');
    const [status, setStatus] = useState<string>(ResearchStatus.PLANNING);
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

    // Pre-populate form in edit mode
    useEffect(() => {
        if (mode === 'edit' && research) {
            setTitle(research.title);
            setDescription(research.description);
            setStatus(research.status);
            if (research.researchNode) {
                setResearchNodeId(research.researchNode.id);
            }
        }
    }, [mode, research]);

    const loadNodeOptions = async () => {
        try {
            const response = await nodeConnectionService.getActiveNodeConnectionsPaginated(1, 100);
            const options = (response.data ?? []).map((node: ResearchNodeConnection) => ({
                value: node.id,
                label: `${node.nodeName} (${node.nodeUrl})`,
            }));
            setNodeOptions(options);
        } catch (error) {
            console.error('Failed to fetch research nodes for dropdown:', error);
            setNodeOptions([
                { value: 'mock-node-1', label: 'Mock Node 1 (https://mock-node-1.com)' },
                { value: 'mock-node-2', label: 'Mock Node 2 (https://mock-node-2.com)' },
            ]);
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

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

        if (mode === 'add') {
            if (!startDate) {
                newErrors.startDate = 'Data de início é obrigatória';
            }
            if (!researchNodeId) {
                newErrors.researchNodeId = 'Nó de pesquisa é obrigatório';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const touchedFields: Record<string, boolean> = {
            title: true,
            description: true,
            status: true,
        };
        if (mode === 'add') {
            touchedFields.startDate = true;
            touchedFields.researchNodeId = true;
        }
        setTouched(touchedFields);

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            if (mode === 'edit' && research) {
                const updateData: UpdateResearchData = {
                    title: title.trim(),
                    description: description.trim(),
                    status: status as ResearchStatus,
                };
                await researchService.updateResearch(research.id, updateData);
            } else {
                const createData: NewResearchData = {
                    title: title.trim(),
                    description: description.trim(),
                    researchNodeId,
                    startDate,
                };
                await researchService.createResearch(createData);
            }

            handleNavigation('/research');
        } catch (err) {
            console.error(`Failed to ${mode} research project:`, err);
            const errorMessage = err instanceof Error ? err.message : `Falha ao ${mode === 'edit' ? 'atualizar' : 'criar'} projeto de pesquisa`;
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleNavigation('/research');
        }
    };

    const headerTitle = mode === 'edit' ? 'Editar Projeto de Pesquisa' : 'Novo Projeto de Pesquisa';

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/research',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: headerTitle,
                showUserMenu: true,
            }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
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

                        {/* Status - only in edit mode */}
                        {mode === 'edit' && (
                            <Dropdown
                                label="Status"
                                placeholder="Selecione o status"
                                options={statusOptions}
                                value={status}
                                onChange={(value) => setStatus(value as string)}
                                fullWidth
                                required
                            />
                        )}

                        {/* Start Date - only in add mode */}
                        {mode === 'add' && (
                            <Input
                                label="Data de Início"
                                type="date"
                                placeholder="Selecione a data de início"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                onBlur={() => handleBlur('startDate')}
                                validationStatus={touched.startDate && errors.startDate ? 'error' : 'none'}
                                errorMessage={touched.startDate ? errors.startDate : undefined}
                                required
                            />
                        )}

                        {/* Research Node - only in add mode */}
                        {mode === 'add' && (
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
                        )}
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
                            {submitting ? 'Salvando...' : (mode === 'edit' ? 'Atualizar Projeto' : 'Salvar Projeto')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateResearchForm;
