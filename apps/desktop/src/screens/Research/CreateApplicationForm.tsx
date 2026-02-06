/**
 * CreateApplicationForm Component
 *
 * Form for creating a new application linked to a research project.
 * Fields match the backend Application entity and Figma design.
 */

import { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { NewApplicationData } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface CreateApplicationFormProps {
    handleNavigation: (path: string) => void;
    researchId: string;
    onSave?: (data: NewApplicationData) => void;
    onCancel?: () => void;
}

export function CreateApplicationForm({ handleNavigation, researchId, onSave, onCancel }: CreateApplicationFormProps) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (name.length > 200) {
            newErrors.name = 'Nome deve ter no máximo 200 caracteres';
        }

        if (!url.trim()) {
            newErrors.url = 'URL é obrigatória';
        } else if (url.length > 500) {
            newErrors.url = 'URL deve ter no máximo 500 caracteres';
        }

        if (!description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        } else if (description.length > 2000) {
            newErrors.description = 'Descrição deve ter no máximo 2000 caracteres';
        }

        if (additionalInfo.length > 2000) {
            newErrors.additionalInfo = 'Informação adicional deve ter no máximo 2000 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setTouched({
            name: true,
            url: true,
            description: true,
            additionalInfo: true,
        });

        if (!validateForm()) return;

        const data: NewApplicationData = {
            researchId,
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            additionalInfo: additionalInfo.trim() || undefined,
        };

        if (onSave) {
            onSave(data);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            // Mock save until backend controller is implemented
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Application created (mock):', data);

            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to create application:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao criar aplicação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleNavigation(`/research/view/${researchId}`);
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
                title: 'Nova Aplicação',
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
                        <Input
                            label="Nome"
                            placeholder="Digite o nome da aplicação"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={`${name.length}/200 caracteres`}
                            required
                        />

                        <Input
                            label="URL"
                            placeholder="Digite a URL da aplicação"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onBlur={() => handleBlur('url')}
                            validationStatus={touched.url && errors.url ? 'error' : 'none'}
                            errorMessage={touched.url ? errors.url : undefined}
                            helperText={`${url.length}/500 caracteres`}
                            required
                        />

                        <div className="add-form__full-width">
                            <label className="input-label">
                                Descrição <span className="required">*</span>
                            </label>
                            <textarea
                                className={`input-textarea ${touched.description && errors.description ? 'error' : ''}`}
                                placeholder="Digite a descrição da aplicação"
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
                                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description}
                                </span>
                            )}
                            <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {description.length}/2000 caracteres
                            </span>
                        </div>

                        <div className="add-form__full-width">
                            <label className="input-label">Informação Adicional</label>
                            <textarea
                                className={`input-textarea ${touched.additionalInfo && errors.additionalInfo ? 'error' : ''}`}
                                placeholder="Digite informações adicionais (opcional)"
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                onBlur={() => handleBlur('additionalInfo')}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${touched.additionalInfo && errors.additionalInfo ? '#ef4444' : '#e5e7eb'}`,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '100px'
                                }}
                            />
                            {touched.additionalInfo && errors.additionalInfo && (
                                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.additionalInfo}
                                </span>
                            )}
                            <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {additionalInfo.length}/2000 caracteres
                            </span>
                        </div>
                    </div>

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
                            {submitting ? 'Salvando...' : 'Salvar Aplicação'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateApplicationForm;
