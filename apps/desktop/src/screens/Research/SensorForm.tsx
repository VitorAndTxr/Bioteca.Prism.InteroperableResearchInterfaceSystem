/**
 * SensorForm Component
 *
 * Combined view/edit form for sensor details.
 * View mode: all fields read-only. Edit mode: fields editable, submit updates via API.
 */

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Input } from '@/design-system/components/input';
import { Button } from '@/design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import type { Sensor, UpdateSensorData } from '@iris/domain';
import { researchService } from '@/services/middleware';
import '@/styles/shared/AddForm.css';

type FormMode = 'view' | 'edit';

export interface SensorFormProps {
    handleNavigation: (path: string) => void;
    mode: FormMode;
    researchId: string;
    sensorId: string;
}

export function SensorForm({ handleNavigation, mode, researchId, sensorId }: SensorFormProps) {
    const isReadOnly = mode === 'view';

    const [name, setName] = useState('');
    const [maxSamplingRate, setMaxSamplingRate] = useState('');
    const [unit, setUnit] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [minRange, setMinRange] = useState('');
    const [maxRange, setMaxRange] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const loadSensor = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                const sensors = await researchService.getAllResearchSensors(researchId);
                const sensor = sensors.find((s: Sensor) => s.id === sensorId);
                if (!sensor) {
                    setLoadError('Sensor não encontrado');
                    return;
                }
                if (!cancelled) {
                    setName(sensor.name);
                    setMaxSamplingRate(String(sensor.maxSamplingRate));
                    setUnit(sensor.unit);
                    setAccuracy(String(sensor.accuracy));
                    setMinRange(String(sensor.minRange));
                    setMaxRange(String(sensor.maxRange));
                    setAdditionalInfo(sensor.additionalInfo || '');
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Erro ao carregar sensor');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadSensor();
        return () => { cancelled = true; };
    }, [researchId, sensorId]);

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

        if (!unit.trim()) {
            newErrors.unit = 'Unidade é obrigatória';
        }

        const rate = parseFloat(maxSamplingRate);
        if (isNaN(rate) || rate <= 0) {
            newErrors.maxSamplingRate = 'Taxa de amostragem deve ser um número positivo';
        }

        const acc = parseFloat(accuracy);
        if (isNaN(acc)) {
            newErrors.accuracy = 'Precisão deve ser um número válido';
        }

        const min = parseFloat(minRange);
        if (isNaN(min)) {
            newErrors.minRange = 'Alcance mínimo deve ser um número válido';
        }

        const max = parseFloat(maxRange);
        if (isNaN(max)) {
            newErrors.maxRange = 'Alcance máximo deve ser um número válido';
        }

        if (!isNaN(min) && !isNaN(max) && min >= max) {
            newErrors.maxRange = 'Alcance máximo deve ser maior que o mínimo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        setTouched({
            name: true,
            unit: true,
            maxSamplingRate: true,
            accuracy: true,
            minRange: true,
            maxRange: true,
            additionalInfo: true,
        });

        if (!validateForm()) return;

        const data: UpdateSensorData = {
            name: name.trim(),
            maxSamplingRate: parseFloat(maxSamplingRate),
            unit: unit.trim(),
            accuracy: parseFloat(accuracy),
            minRange: parseFloat(minRange),
            maxRange: parseFloat(maxRange),
            additionalInfo: additionalInfo.trim() || undefined,
        };

        try {
            setSubmitting(true);
            setSubmitError(null);
            await researchService.updateSensor(sensorId, data);
            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to update sensor:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao atualizar sensor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        handleNavigation(`/research/view/${researchId}`);
    };

    const getHeaderTitle = (): string => {
        return mode === 'view' ? 'Detalhes do Sensor' : 'Editar Sensor';
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
                            placeholder="Nome do sensor"
                            value={name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={!isReadOnly ? `${name.length}/200 caracteres` : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Taxa Máxima de Amostragem (Hz)"
                            placeholder="Ex: 215"
                            value={isReadOnly ? `${maxSamplingRate} Hz` : maxSamplingRate}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxSamplingRate(e.target.value)}
                            onBlur={() => handleBlur('maxSamplingRate')}
                            validationStatus={touched.maxSamplingRate && errors.maxSamplingRate ? 'error' : 'none'}
                            errorMessage={touched.maxSamplingRate ? errors.maxSamplingRate : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Unidade"
                            placeholder="Ex: mV, g, Hz"
                            value={unit}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)}
                            onBlur={() => handleBlur('unit')}
                            validationStatus={touched.unit && errors.unit ? 'error' : 'none'}
                            errorMessage={touched.unit ? errors.unit : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Precisão"
                            placeholder="Ex: 0.01"
                            value={accuracy}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAccuracy(e.target.value)}
                            onBlur={() => handleBlur('accuracy')}
                            validationStatus={touched.accuracy && errors.accuracy ? 'error' : 'none'}
                            errorMessage={touched.accuracy ? errors.accuracy : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Alcance Mínimo"
                            placeholder="Ex: -5"
                            value={minRange}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setMinRange(e.target.value)}
                            onBlur={() => handleBlur('minRange')}
                            validationStatus={touched.minRange && errors.minRange ? 'error' : 'none'}
                            errorMessage={touched.minRange ? errors.minRange : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Alcance Máximo"
                            placeholder="Ex: 5"
                            value={maxRange}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxRange(e.target.value)}
                            onBlur={() => handleBlur('maxRange')}
                            validationStatus={touched.maxRange && errors.maxRange ? 'error' : 'none'}
                            errorMessage={touched.maxRange ? errors.maxRange : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <div className="add-form__full-width">
                            <label className="input-label">Informação Adicional</label>
                            <textarea
                                className={`input-textarea ${touched.additionalInfo && errors.additionalInfo ? 'error' : ''}`}
                                placeholder="Informações adicionais (opcional)"
                                value={additionalInfo}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAdditionalInfo(e.target.value)}
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
                                {submitting ? 'Salvando...' : 'Atualizar Sensor'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default SensorForm;
