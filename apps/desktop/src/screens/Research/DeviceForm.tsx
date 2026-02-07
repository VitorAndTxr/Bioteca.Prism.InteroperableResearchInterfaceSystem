/**
 * DeviceForm Component
 *
 * Combined view/edit form for research device details.
 * View mode: all fields read-only. Edit mode: role/calibration fields editable.
 * Device name/manufacturer/model are always read-only (belong to the device entity).
 */

import { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Input } from '@/design-system/components/input';
import { Dropdown } from '@/design-system/components/dropdown';
import { Button } from '@/design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import { CalibrationStatus, type ResearchDevice, type UpdateResearchDevicePayload } from '@iris/domain';
import { researchService } from '@/services/middleware';
import '@/styles/shared/AddForm.css';

type FormMode = 'view' | 'edit';

export interface DeviceFormProps {
    handleNavigation: (path: string) => void;
    mode: FormMode;
    researchId: string;
    deviceId: string;
}

const calibrationStatusOptions = [
    { value: CalibrationStatus.CALIBRATED, label: 'Calibrado' },
    { value: CalibrationStatus.NOT_CALIBRATED, label: 'Não calibrado' },
    { value: CalibrationStatus.IN_PROGRESS, label: 'Em progresso' },
    { value: CalibrationStatus.EXPIRED, label: 'Expirado' },
];

function formatDateForInput(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
}

export function DeviceForm({ handleNavigation, mode, researchId, deviceId }: DeviceFormProps) {
    const isReadOnly = mode === 'view';

    const [deviceName, setDeviceName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
    const [role, setRole] = useState('');
    const [calibrationStatus, setCalibrationStatus] = useState<string>('');
    const [lastCalibrationDate, setLastCalibrationDate] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const loadDevice = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                const devices = await researchService.getResearchDevices(researchId);
                const device = devices.find((d: ResearchDevice) => d.deviceId === deviceId);
                if (!device) {
                    setLoadError('Dispositivo não encontrado');
                    return;
                }
                if (!cancelled) {
                    setDeviceName(device.deviceName || '');
                    setManufacturer(device.manufacturer || '');
                    setModel(device.model || '');
                    setRole(device.role || '');
                    setCalibrationStatus(device.calibrationStatus);
                    setLastCalibrationDate(formatDateForInput(device.lastCalibrationDate));
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Erro ao carregar dispositivo');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadDevice();
        return () => { cancelled = true; };
    }, [researchId, deviceId]);

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!role.trim()) {
            newErrors.role = 'Função é obrigatória';
        }

        if (!calibrationStatus) {
            newErrors.calibrationStatus = 'Status de calibração é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        setTouched({
            role: true,
            calibrationStatus: true,
        });

        if (!validateForm()) return;

        const payload: UpdateResearchDevicePayload = {
            role: role.trim(),
            calibrationStatus: calibrationStatus as CalibrationStatus,
            lastCalibrationDate: lastCalibrationDate || undefined,
        };

        try {
            setSubmitting(true);
            setSubmitError(null);
            await researchService.updateResearchDevice(researchId, deviceId, payload);
            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to update device:', err);
            setSubmitError(err instanceof Error ? err.message : 'Erro ao atualizar dispositivo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        handleNavigation(`/research/view/${researchId}`);
    };

    const getHeaderTitle = (): string => {
        return mode === 'view' ? 'Detalhes do Dispositivo' : 'Editar Dispositivo';
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
                            label="Nome do Dispositivo"
                            value={deviceName}
                            onChange={() => {}}
                            disabled
                            helperText="Campo do dispositivo (somente leitura)"
                        />

                        <Input
                            label="Fabricante"
                            value={manufacturer}
                            onChange={() => {}}
                            disabled
                            helperText="Campo do dispositivo (somente leitura)"
                        />

                        <Input
                            label="Modelo"
                            value={model}
                            onChange={() => {}}
                            disabled
                            helperText="Campo do dispositivo (somente leitura)"
                        />

                        <Input
                            label="Função"
                            placeholder="Função do dispositivo na pesquisa"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            onBlur={() => handleBlur('role')}
                            validationStatus={touched.role && errors.role ? 'error' : 'none'}
                            errorMessage={touched.role ? errors.role : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Dropdown
                            label="Status de Calibração"
                            placeholder="Selecione o status"
                            options={calibrationStatusOptions}
                            value={calibrationStatus}
                            onChange={(value) => setCalibrationStatus(value as string)}
                            onBlur={() => handleBlur('calibrationStatus')}
                            validation={touched.calibrationStatus && errors.calibrationStatus ? 'error' : 'none'}
                            errorMessage={touched.calibrationStatus ? errors.calibrationStatus : undefined}
                            fullWidth
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Última Calibração"
                            type="date"
                            value={lastCalibrationDate}
                            onChange={(e) => setLastCalibrationDate(e.target.value)}
                            disabled={isReadOnly}
                        />
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
                                {submitting ? 'Salvando...' : 'Atualizar Dispositivo'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default DeviceForm;
