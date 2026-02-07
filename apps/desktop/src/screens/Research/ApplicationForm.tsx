/**
 * ApplicationForm Component
 *
 * Combined view/edit form for application details linked to a research project.
 * View mode: all fields read-only. Edit mode: fields editable, submit updates via API.
 */

import { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Input } from '@/design-system/components/input';
import { Button } from '@/design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import type { Application, UpdateApplicationData } from '@iris/domain';
import { researchService } from '@/services/middleware';
import '@/styles/shared/AddForm.css';

type FormMode = 'view' | 'edit';

export interface ApplicationFormProps {
    handleNavigation: (path: string) => void;
    mode: FormMode;
    researchId: string;
    applicationId: string;
}

export function ApplicationForm({ handleNavigation, mode, researchId, applicationId }: ApplicationFormProps) {
    const isReadOnly = mode === 'view';

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const loadApplication = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                const apps = await researchService.getResearchApplications(researchId);
                const app = apps.find((a: Application) => a.id === applicationId);
                if (!app) {
                    setLoadError('Aplicação não encontrada');
                    return;
                }
                if (!cancelled) {
                    setName(app.name);
                    setUrl(app.url);
                    setDescription(app.description);
                    setAdditionalInfo(app.additionalInfo || '');
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Erro ao carregar aplicação');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadApplication();
        return () => { cancelled = true; };
    }, [researchId, applicationId]);

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
        if (isReadOnly) return;

        setTouched({
            name: true,
            url: true,
            description: true,
            additionalInfo: true,
        });

        if (!validateForm()) return;

        const data: UpdateApplicationData = {
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            additionalInfo: additionalInfo.trim() || undefined,
        };

        try {
            setSubmitting(true);
            setSubmitError(null);
            await researchService.updateApplication(researchId, applicationId, data);
            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to update application:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao atualizar aplicação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        handleNavigation(`/research/view/${researchId}`);
    };

    const getHeaderTitle = (): string => {
        return mode === 'view' ? 'Detalhes da Aplicação' : 'Editar Aplicação';
    };

    if (loading) {
        return (
            <AppLayout
                sidebar={{ items: mainMenuItems, activePath: '/research', onNavigate: handleNavigation, logo: 'I.R.I.S.' }}
                header={{ title: getHeaderTitle(), showUserMenu: true }}
            >
                <div className="add-form">
                    <div className="add-form__container">
                        <p>Carregando...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (loadError) {
        return (
            <AppLayout
                sidebar={{ items: mainMenuItems, activePath: '/research', onNavigate: handleNavigation, logo: 'I.R.I.S.' }}
                header={{ title: getHeaderTitle(), showUserMenu: true }}
            >
                <div className="add-form">
                    <div className="add-form__container">
                        <div style={{ padding: '12px 16px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '20px', border: '1px solid #fcc' }}>
                            <strong>Erro:</strong> {loadError}
                        </div>
                        <Button variant="outline" size="medium" onClick={handleBack} icon={<ArrowLeftIcon className="w-5 h-5" />} iconPosition="left">
                            Voltar
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            sidebar={{ items: mainMenuItems, activePath: '/research', onNavigate: handleNavigation, logo: 'I.R.I.S.' }}
            header={{ title: getHeaderTitle(), showUserMenu: true }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
                    {submitError && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '20px', border: '1px solid #fcc' }}>
                            <strong>Erro:</strong> {submitError}
                        </div>
                    )}

                    <div className="add-form__fields">
                        <Input
                            label="Nome"
                            placeholder="Nome da aplicação"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={!isReadOnly ? `${name.length}/200 caracteres` : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="URL"
                            placeholder="URL da aplicação"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onBlur={() => handleBlur('url')}
                            validationStatus={touched.url && errors.url ? 'error' : 'none'}
                            errorMessage={touched.url ? errors.url : undefined}
                            helperText={!isReadOnly ? `${url.length}/500 caracteres` : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <div className="add-form__full-width">
                            <label className="input-label">
                                Descrição {!isReadOnly && <span className="required">*</span>}
                            </label>
                            <textarea
                                className={`input-textarea ${touched.description && errors.description ? 'error' : ''}`}
                                placeholder="Descrição da aplicação"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleBlur('description')}
                                rows={4}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${touched.description && errors.description ? '#ef4444' : '#e5e7eb'}`,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '100px',
                                    backgroundColor: isReadOnly ? '#f9fafb' : undefined,
                                }}
                            />
                            {touched.description && errors.description && (
                                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description}
                                </span>
                            )}
                            {!isReadOnly && (
                                <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {description.length}/2000 caracteres
                                </span>
                            )}
                        </div>

                        <div className="add-form__full-width">
                            <label className="input-label">Informação Adicional</label>
                            <textarea
                                className={`input-textarea ${touched.additionalInfo && errors.additionalInfo ? 'error' : ''}`}
                                placeholder="Informações adicionais (opcional)"
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                onBlur={() => handleBlur('additionalInfo')}
                                rows={4}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${touched.additionalInfo && errors.additionalInfo ? '#ef4444' : '#e5e7eb'}`,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '100px',
                                    backgroundColor: isReadOnly ? '#f9fafb' : undefined,
                                }}
                            />
                            {touched.additionalInfo && errors.additionalInfo && (
                                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.additionalInfo}
                                </span>
                            )}
                            {!isReadOnly && (
                                <span style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {additionalInfo.length}/2000 caracteres
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="add-form__actions">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleBack}
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
                                {submitting ? 'Salvando...' : 'Atualizar Aplicação'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default ApplicationForm;
