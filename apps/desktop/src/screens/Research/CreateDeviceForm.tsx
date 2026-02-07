/**
 * CreateDeviceForm Component
 *
 * Form for creating a new device.
 * Fields match the backend Device entity and Figma design.
 */

import { useState, FormEvent } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Input } from '@/design-system/components/input';
import { Button } from '@/design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import type { NewDeviceData } from '@iris/domain';
import { researchService } from '@/services/middleware';
import '@/styles/shared/AddForm.css';

export interface CreateDeviceFormProps {
    handleNavigation: (path: string) => void;
    researchId: string;
    onSave?: (data: NewDeviceData) => void;
    onCancel?: () => void;
}

export function CreateDeviceForm({ handleNavigation, researchId, onSave, onCancel }: CreateDeviceFormProps) {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
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

        if (!manufacturer.trim()) {
            newErrors.manufacturer = 'Fabricante é obrigatório';
        } else if (manufacturer.length > 200) {
            newErrors.manufacturer = 'Fabricante deve ter no máximo 200 caracteres';
        }

        if (!model.trim()) {
            newErrors.model = 'Modelo é obrigatório';
        } else if (model.length > 200) {
            newErrors.model = 'Modelo deve ter no máximo 200 caracteres';
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
            manufacturer: true,
            model: true,
            additionalInfo: true,
        });

        if (!validateForm()) return;

        const data: NewDeviceData = {
            name: name.trim(),
            manufacturer: manufacturer.trim(),
            model: model.trim(),
            additionalInfo: additionalInfo.trim() || undefined,
        };

        if (onSave) {
            onSave(data);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            await researchService.createDeviceAndAssign(researchId, data);

            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to create device:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao criar dispositivo');
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
                title: 'Novo Dispositivo',
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
                        <div className="add-form__full-width">
                            <Input
                                label="Nome"
                                placeholder="Digite o nome do dispositivo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => handleBlur('name')}
                                validationStatus={touched.name && errors.name ? 'error' : 'none'}
                                errorMessage={touched.name ? errors.name : undefined}
                                helperText={`${name.length}/200 caracteres`}
                                required
                            />
                        </div>

                        <Input
                            label="Fabricante"
                            placeholder="Digite o fabricante"
                            value={manufacturer}
                            onChange={(e) => setManufacturer(e.target.value)}
                            onBlur={() => handleBlur('manufacturer')}
                            validationStatus={touched.manufacturer && errors.manufacturer ? 'error' : 'none'}
                            errorMessage={touched.manufacturer ? errors.manufacturer : undefined}
                            helperText={`${manufacturer.length}/200 caracteres`}
                            required
                        />

                        <Input
                            label="Modelo"
                            placeholder="Digite o modelo"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            onBlur={() => handleBlur('model')}
                            validationStatus={touched.model && errors.model ? 'error' : 'none'}
                            errorMessage={touched.model ? errors.model : undefined}
                            helperText={`${model.length}/200 caracteres`}
                            required
                        />

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
                            {submitting ? 'Salvando...' : 'Salvar Dispositivo'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateDeviceForm;
