/**
 * CreateSensorForm Component
 *
 * Form for creating a new sensor.
 * Fields match the backend Sensor entity and Figma design.
 */

import { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { NewSensorData } from '@iris/domain';
import '../../styles/shared/AddForm.css';

export interface CreateSensorFormProps {
    handleNavigation: (path: string) => void;
    researchId: string;
    onSave?: (data: NewSensorData) => void;
    onCancel?: () => void;
}

export function CreateSensorForm({ handleNavigation, researchId, onSave, onCancel }: CreateSensorFormProps) {
    const [name, setName] = useState('');
    const [maxSamplingRate, setMaxSamplingRate] = useState('');
    const [unit, setUnit] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [minRange, setMinRange] = useState('');
    const [maxRange, setMaxRange] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const isValidNumber = (value: string): boolean => {
        return value.trim() !== '' && !isNaN(Number(value));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (name.length > 200) {
            newErrors.name = 'Nome deve ter no máximo 200 caracteres';
        }

        if (!maxSamplingRate.trim()) {
            newErrors.maxSamplingRate = 'Taxa máxima de amostragem é obrigatória';
        } else if (!isValidNumber(maxSamplingRate)) {
            newErrors.maxSamplingRate = 'Deve ser um valor numérico';
        }

        if (!unit.trim()) {
            newErrors.unit = 'Unidade é obrigatória';
        } else if (unit.length > 50) {
            newErrors.unit = 'Unidade deve ter no máximo 50 caracteres';
        }

        if (!accuracy.trim()) {
            newErrors.accuracy = 'Precisão é obrigatória';
        } else if (!isValidNumber(accuracy)) {
            newErrors.accuracy = 'Deve ser um valor numérico';
        }

        if (!minRange.trim()) {
            newErrors.minRange = 'Alcance mínimo é obrigatório';
        } else if (!isValidNumber(minRange)) {
            newErrors.minRange = 'Deve ser um valor numérico';
        }

        if (!maxRange.trim()) {
            newErrors.maxRange = 'Alcance máximo é obrigatório';
        } else if (!isValidNumber(maxRange)) {
            newErrors.maxRange = 'Deve ser um valor numérico';
        }

        if (isValidNumber(minRange) && isValidNumber(maxRange) && Number(minRange) >= Number(maxRange)) {
            newErrors.maxRange = 'Alcance máximo deve ser maior que o mínimo';
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
            maxSamplingRate: true,
            unit: true,
            accuracy: true,
            minRange: true,
            maxRange: true,
            additionalInfo: true,
        });

        if (!validateForm()) return;

        const data: NewSensorData = {
            deviceId: '', // Will be set when device selection is available
            name: name.trim(),
            maxSamplingRate: maxSamplingRate.trim(),
            unit: unit.trim(),
            accuracy: accuracy.trim(),
            minRange: minRange.trim(),
            maxRange: maxRange.trim(),
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
            console.log('Sensor created (mock):', data);

            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to create sensor:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao criar sensor');
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
                title: 'Novo Sensor',
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
                            placeholder="Digite o nome do sensor"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={`${name.length}/200 caracteres`}
                            required
                        />

                        <Input
                            label="Taxa Máxima de Amostragem"
                            placeholder="Ex: 215"
                            value={maxSamplingRate}
                            onChange={(e) => setMaxSamplingRate(e.target.value)}
                            onBlur={() => handleBlur('maxSamplingRate')}
                            validationStatus={touched.maxSamplingRate && errors.maxSamplingRate ? 'error' : 'none'}
                            errorMessage={touched.maxSamplingRate ? errors.maxSamplingRate : undefined}
                            helperText="Valor em Hz"
                            required
                        />

                        <Input
                            label="Unidade"
                            placeholder="Ex: mV, Hz, °C"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            onBlur={() => handleBlur('unit')}
                            validationStatus={touched.unit && errors.unit ? 'error' : 'none'}
                            errorMessage={touched.unit ? errors.unit : undefined}
                            helperText={`${unit.length}/50 caracteres`}
                            required
                        />

                        <Input
                            label="Precisão"
                            placeholder="Ex: 0.01"
                            value={accuracy}
                            onChange={(e) => setAccuracy(e.target.value)}
                            onBlur={() => handleBlur('accuracy')}
                            validationStatus={touched.accuracy && errors.accuracy ? 'error' : 'none'}
                            errorMessage={touched.accuracy ? errors.accuracy : undefined}
                            required
                        />

                        <Input
                            label="Alcance Mínimo"
                            placeholder="Ex: 0"
                            value={minRange}
                            onChange={(e) => setMinRange(e.target.value)}
                            onBlur={() => handleBlur('minRange')}
                            validationStatus={touched.minRange && errors.minRange ? 'error' : 'none'}
                            errorMessage={touched.minRange ? errors.minRange : undefined}
                            required
                        />

                        <Input
                            label="Alcance Máximo"
                            placeholder="Ex: 3300"
                            value={maxRange}
                            onChange={(e) => setMaxRange(e.target.value)}
                            onBlur={() => handleBlur('maxRange')}
                            validationStatus={touched.maxRange && errors.maxRange ? 'error' : 'none'}
                            errorMessage={touched.maxRange ? errors.maxRange : undefined}
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
                            {submitting ? 'Salvando...' : 'Salvar Sensor'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateSensorForm;
