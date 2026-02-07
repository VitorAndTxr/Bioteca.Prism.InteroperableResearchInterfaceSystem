/**
 * ResearchDetailsScreen Component
 *
 * Displays detailed information about a specific research project with tabbed content.
 * 5 tabs with lazy loading: Pesquisadores, Voluntarios, Aplicacoes, Dispositivos, Sensores.
 * Each tab fetches real data from backend via ResearchService on first activation.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Button } from '@/design-system/components/button';
import { TabbedTable, TabbedTableTab } from '@/design-system/components/tabbed-table';
import { DataTableColumn } from '@/design-system/components/data-table/DataTable.types';
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import {
    type ResearchDetail,
    type ResearchResearcher,
    type ResearchVolunteer,
    type Application,
    type ResearchDevice,
    type Sensor,
    EnrollmentStatus,
    CalibrationStatus,
} from '@iris/domain';
import { researchService } from '@/services/middleware';
import VolunteerSelectionModal from './VolunteerSelectionModal';

export interface ResearchDetailsScreenProps {
    handleNavigation: (path: string) => void;
    researchId: string;
}

type ResearchDetailsTabs = 'researchers' | 'volunteers' | 'applications' | 'devices' | 'sensors';

function StatusBadge({ label, color }: { label: string; color: 'green' | 'blue' | 'yellow' | 'red' | 'gray' }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {label}
        </span>
    );
}

function getEnrollmentBadge(status: EnrollmentStatus) {
    const config: Record<EnrollmentStatus, { label: string; color: 'green' | 'blue' | 'gray' | 'red' }> = {
        [EnrollmentStatus.ENROLLED]: { label: 'Enrolled', color: 'green' },
        [EnrollmentStatus.ACTIVE]: { label: 'Active', color: 'blue' },
        [EnrollmentStatus.COMPLETED]: { label: 'Completed', color: 'blue' },
        [EnrollmentStatus.WITHDRAWN]: { label: 'Withdrawn', color: 'gray' },
        [EnrollmentStatus.EXCLUDED]: { label: 'Excluded', color: 'red' },
    };
    const c = config[status] || { label: status, color: 'gray' as const };
    return <StatusBadge label={c.label} color={c.color} />;
}

function getCalibrationBadge(status: CalibrationStatus) {
    const config: Record<CalibrationStatus, { label: string; color: 'green' | 'blue' | 'yellow' | 'red' }> = {
        [CalibrationStatus.CALIBRATED]: { label: 'Calibrado', color: 'green' },
        [CalibrationStatus.NOT_CALIBRATED]: { label: 'Nao calibrado', color: 'yellow' },
        [CalibrationStatus.IN_PROGRESS]: { label: 'Em progresso', color: 'blue' },
        [CalibrationStatus.EXPIRED]: { label: 'Expirado', color: 'red' },
    };
    const c = config[status] || { label: status, color: 'yellow' as const };
    return <StatusBadge label={c.label} color={c.color} />;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
        return dateStr;
    }
}

export function ResearchDetailsScreen({ handleNavigation, researchId }: ResearchDetailsScreenProps) {
    const [research, setResearch] = useState<ResearchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ResearchDetailsTabs>('researchers');

    const [researchers, setResearchers] = useState<ResearchResearcher[]>([]);
    const [volunteers, setVolunteers] = useState<ResearchVolunteer[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [devices, setDevices] = useState<ResearchDevice[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);

    const [tabDataLoaded, setTabDataLoaded] = useState<Record<string, boolean>>({});
    const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({});
    const [tabErrors, setTabErrors] = useState<Record<string, string | null>>({});

    const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);

    const loadResearchDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const detail = await researchService.getResearchById(researchId);
            setResearch(detail);
        } catch (err) {
            console.error('Failed to load research details:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
        } finally {
            setLoading(false);
        }
    }, [researchId]);

    useEffect(() => {
        loadResearchDetails();
    }, [loadResearchDetails]);

    const loadTabData = useCallback(async (tab: ResearchDetailsTabs) => {
        if (!researchId || tabDataLoaded[tab]) return;

        setTabLoading(prev => ({ ...prev, [tab]: true }));
        setTabErrors(prev => ({ ...prev, [tab]: null }));

        try {
            switch (tab) {
                case 'researchers':
                    setResearchers(await researchService.getResearchResearchers(researchId));
                    break;
                case 'volunteers':
                    setVolunteers(await researchService.getResearchVolunteers(researchId));
                    break;
                case 'applications':
                    setApplications(await researchService.getResearchApplications(researchId));
                    break;
                case 'devices':
                    setDevices(await researchService.getResearchDevices(researchId));
                    break;
                case 'sensors':
                    setSensors(await researchService.getAllResearchSensors(researchId));
                    break;
            }
            setTabDataLoaded(prev => ({ ...prev, [tab]: true }));
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                [tab]: err instanceof Error ? err.message : 'Failed to load tab data'
            }));
        } finally {
            setTabLoading(prev => ({ ...prev, [tab]: false }));
        }
    }, [researchId, tabDataLoaded]);

    useEffect(() => {
        if (!loading && research) {
            loadTabData(activeTab);
        }
    }, [activeTab, loading, research, loadTabData]);

    const invalidateTab = useCallback((tab: ResearchDetailsTabs) => {
        setTabDataLoaded(prev => ({ ...prev, [tab]: false }));
    }, []);

    // ── Action Handlers ──────────────────────────────────────────────

    const handleRemoveResearcher = async (researcherId: string) => {
        if (!window.confirm('Remover pesquisador desta pesquisa?')) return;
        try {
            await researchService.removeResearchResearcher(researchId, researcherId);
            invalidateTab('researchers');
            loadResearchDetails();
            loadTabData('researchers');
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                researchers: err instanceof Error ? err.message : 'Failed to remove researcher'
            }));
        }
    };

    const handleTogglePrincipal = async (r: ResearchResearcher) => {
        try {
            await researchService.updateResearchResearcher(researchId, r.researcherId, {
                isPrincipal: !r.isPrincipal
            });
            invalidateTab('researchers');
            loadTabData('researchers');
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                researchers: err instanceof Error ? err.message : 'Failed to update researcher'
            }));
        }
    };

    const handleRemoveVolunteer = async (volunteerId: string) => {
        if (!window.confirm('Remover voluntario desta pesquisa?')) return;
        try {
            await researchService.removeResearchVolunteer(researchId, volunteerId);
            invalidateTab('volunteers');
            loadResearchDetails();
            loadTabData('volunteers');
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                volunteers: err instanceof Error ? err.message : 'Failed to remove volunteer'
            }));
        }
    };

    const handleDeleteApplication = async (applicationId: string) => {
        if (!window.confirm('Remover aplicacao desta pesquisa?')) return;
        try {
            await researchService.deleteApplication(researchId, applicationId);
            invalidateTab('applications');
            loadResearchDetails();
            loadTabData('applications');
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                applications: err instanceof Error ? err.message : 'Failed to delete application'
            }));
        }
    };

    const handleRemoveDevice = async (deviceId: string) => {
        if (!window.confirm('Remover dispositivo desta pesquisa?')) return;
        try {
            await researchService.removeResearchDevice(researchId, deviceId);
            invalidateTab('devices');
            invalidateTab('sensors');
            loadResearchDetails();
            loadTabData('devices');
        } catch (err) {
            setTabErrors(prev => ({
                ...prev,
                devices: err instanceof Error ? err.message : 'Failed to remove device'
            }));
        }
    };

    const handleVolunteerEnrollmentComplete = () => {
        setVolunteerModalOpen(false);
        invalidateTab('volunteers');
        loadResearchDetails();
        loadTabData('volunteers');
    };

    // ── Column Definitions ───────────────────────────────────────────

    const researcherColumns: DataTableColumn<ResearchResearcher>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'researcherId',
            sortable: true,
            width: '25%',
            render: (_val: unknown, row: ResearchResearcher) => row.researcher?.name || '-',
        },
        {
            id: 'email',
            label: 'Email',
            accessor: 'researcherId',
            sortable: true,
            width: '20%',
            render: (_val: unknown, row: ResearchResearcher) => row.researcher?.email || '-',
        },
        {
            id: 'institution',
            label: 'Instituicao',
            accessor: 'researcherId',
            width: '15%',
            render: (_val: unknown, row: ResearchResearcher) => row.researcher?.institution || '-',
        },
        {
            id: 'orcid',
            label: 'ORCID',
            accessor: 'researcherId',
            width: '15%',
            render: (_val: unknown, row: ResearchResearcher) => row.researcher?.orcid || '-',
        },
        {
            id: 'principal',
            label: 'Principal',
            accessor: 'isPrincipal',
            width: '10%',
            render: (_val: unknown, row: ResearchResearcher) =>
                row.isPrincipal ? <StatusBadge label="Principal" color="blue" /> : null,
        },
        {
            id: 'actions',
            label: 'Acoes',
            accessor: 'researcherId',
            width: '15%',
            align: 'center',
            render: (_val: unknown, row: ResearchResearcher) => (
                <div className="flex justify-center gap-2">
                    <button
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title={row.isPrincipal ? 'Remover principal' : 'Tornar principal'}
                        onClick={() => handleTogglePrincipal(row)}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remover"
                        onClick={() => handleRemoveResearcher(row.researcherId)}
                    >
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const volunteerColumns: DataTableColumn<ResearchVolunteer>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'volunteerId',
            sortable: true,
            width: '25%',
            render: (_val: unknown, row: ResearchVolunteer) => row.volunteer?.name || '-',
        },
        {
            id: 'email',
            label: 'Email',
            accessor: 'volunteerId',
            sortable: true,
            width: '20%',
            render: (_val: unknown, row: ResearchVolunteer) => row.volunteer?.email || '-',
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'enrollmentStatus',
            width: '15%',
            render: (_val: unknown, row: ResearchVolunteer) => getEnrollmentBadge(row.enrollmentStatus),
        },
        {
            id: 'consentDate',
            label: 'Data Consentimento',
            accessor: 'consentDate',
            width: '15%',
            render: (_val: unknown, row: ResearchVolunteer) => formatDate(row.consentDate),
        },
        {
            id: 'consentVersion',
            label: 'Versao',
            accessor: 'consentVersion',
            width: '10%',
            render: (_val: unknown, row: ResearchVolunteer) => row.consentVersion || '-',
        },
        {
            id: 'actions',
            label: 'Acoes',
            accessor: 'volunteerId',
            width: '15%',
            align: 'center',
            render: (_val: unknown, row: ResearchVolunteer) => (
                <div className="flex justify-center gap-2">
                    <button
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remover"
                        onClick={() => handleRemoveVolunteer(row.volunteerId)}
                    >
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const applicationColumns: DataTableColumn<Application>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '25%',
        },
        {
            id: 'url',
            label: 'URL',
            accessor: 'url',
            width: '25%',
            render: (val: unknown) => (
                <a
                    href={val as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate block"
                >
                    {val as string}
                </a>
            ),
        },
        {
            id: 'description',
            label: 'Descricao',
            accessor: 'description',
            width: '25%',
            render: (val: unknown) => (
                <span className="truncate block max-w-xs" title={val as string}>
                    {val as string}
                </span>
            ),
        },
        {
            id: 'createdAt',
            label: 'Criado em',
            accessor: 'createdAt',
            width: '15%',
            render: (val: unknown) => formatDate(val instanceof Date ? val.toISOString() : val as string),
        },
        {
            id: 'actions',
            label: 'Acoes',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: (_val: unknown, row: Application) => (
                <div className="flex justify-center gap-2">
                    <button
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remover"
                        onClick={() => handleDeleteApplication(row.id)}
                    >
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const deviceColumns: DataTableColumn<ResearchDevice>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'deviceName',
            sortable: true,
            width: '20%',
            render: (_val: unknown, row: ResearchDevice) => row.deviceName || '-',
        },
        {
            id: 'role',
            label: 'Funcao',
            accessor: 'role',
            width: '15%',
        },
        {
            id: 'calibration',
            label: 'Calibracao',
            accessor: 'calibrationStatus',
            width: '15%',
            render: (_val: unknown, row: ResearchDevice) => getCalibrationBadge(row.calibrationStatus),
        },
        {
            id: 'lastCalibration',
            label: 'Ultima Calibracao',
            accessor: 'lastCalibrationDate',
            width: '15%',
            render: (_val: unknown, row: ResearchDevice) => formatDate(row.lastCalibrationDate),
        },
        {
            id: 'sensorCount',
            label: 'Sensores',
            accessor: 'sensorCount',
            width: '10%',
            render: (_val: unknown, row: ResearchDevice) => row.sensorCount ?? 0,
        },
        {
            id: 'actions',
            label: 'Acoes',
            accessor: 'deviceId',
            width: '15%',
            align: 'center',
            render: (_val: unknown, row: ResearchDevice) => (
                <div className="flex justify-center gap-2">
                    <button
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remover"
                        onClick={() => handleRemoveDevice(row.deviceId)}
                    >
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const sensorColumns: DataTableColumn<Sensor>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '20%',
        },
        {
            id: 'maxSamplingRate',
            label: 'Taxa Max',
            accessor: 'maxSamplingRate',
            width: '15%',
            render: (val: unknown) => `${val} Hz`,
        },
        {
            id: 'unit',
            label: 'Unidade',
            accessor: 'unit',
            width: '10%',
        },
        {
            id: 'range',
            label: 'Faixa',
            accessor: 'minRange',
            width: '15%',
            render: (_val: unknown, row: Sensor) => `${row.minRange} - ${row.maxRange}`,
        },
        {
            id: 'accuracy',
            label: 'Precisao',
            accessor: 'accuracy',
            width: '10%',
        },
        {
            id: 'additionalInfo',
            label: 'Info Adicional',
            accessor: 'additionalInfo',
            width: '20%',
            render: (val: unknown) => (
                <span className="truncate block max-w-xs" title={val as string}>
                    {val as string || '-'}
                </span>
            ),
        },
    ], []);

    // ── Tab Configuration ────────────────────────────────────────────

    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'researchers',
            label: `Pesquisadores (${research?.researcherCount ?? 0})`,
            title: research?.title || 'Pesquisa',
            data: researchers,
            columns: researcherColumns as DataTableColumn<unknown>[],
            action: {
                label: 'Adicionar',
                icon: <PlusIcon />,
                onClick: () => handleNavigation(`/research/add-researcher/${researchId}`),
                variant: 'primary',
            },
        },
        {
            value: 'volunteers',
            label: `Voluntarios (${research?.volunteerCount ?? 0})`,
            title: research?.title || 'Pesquisa',
            data: volunteers,
            columns: volunteerColumns as DataTableColumn<unknown>[],
            action: {
                label: 'Adicionar',
                icon: <PlusIcon />,
                onClick: () => handleNavigation('/volunteers/add'),
                variant: 'primary',
            },
            secondaryAction: {
                label: 'Adicionar existente',
                icon: <PlusIcon />,
                onClick: () => setVolunteerModalOpen(true),
                variant: 'secondary',
            },
        },
        {
            value: 'applications',
            label: `Aplicacoes (${research?.applicationCount ?? 0})`,
            title: research?.title || 'Pesquisa',
            data: applications,
            columns: applicationColumns as DataTableColumn<unknown>[],
            action: {
                label: 'Adicionar',
                icon: <PlusIcon />,
                onClick: () => handleNavigation(`/research/add-application/${researchId}`),
                variant: 'primary',
            },
        },
        {
            value: 'devices',
            label: `Dispositivos (${research?.deviceCount ?? 0})`,
            title: research?.title || 'Pesquisa',
            data: devices,
            columns: deviceColumns as DataTableColumn<unknown>[],
            action: {
                label: 'Adicionar',
                icon: <PlusIcon />,
                onClick: () => handleNavigation(`/research/add-device/${researchId}`),
                variant: 'primary',
            },
        },
        {
            value: 'sensors',
            label: 'Sensores',
            title: research?.title || 'Pesquisa',
            data: sensors,
            columns: sensorColumns as DataTableColumn<unknown>[],
            action: {
                label: 'Adicionar',
                icon: <PlusIcon />,
                onClick: () => handleNavigation(`/research/add-sensor/${researchId}`),
                variant: 'primary',
            },
        },
    ], [research, researchers, volunteers, applications, devices, sensors,
        researcherColumns, volunteerColumns, applicationColumns, deviceColumns, sensorColumns,
        researchId, handleNavigation]);

    const isTabLoading = loading || (tabLoading[activeTab] ?? false);

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/research',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: research?.title || 'Detalhes da Pesquisa',
                showUserMenu: true,
                primaryAction: {
                    label: 'Voltar',
                    onClick: () => handleNavigation('/research'),
                    icon: <ArrowLeftIcon className="w-5 h-5" />,
                },
            }}
        >
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                        {error}
                        <button
                            onClick={loadResearchDetails}
                            className="ml-4 text-sm underline hover:text-red-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {tabErrors[activeTab] && (
                    <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                        {tabErrors[activeTab]}
                        <button
                            onClick={() => {
                                invalidateTab(activeTab);
                                loadTabData(activeTab);
                            }}
                            className="ml-4 text-sm underline hover:text-yellow-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                <TabbedTable
                    tabs={tabs}
                    selectedTab={activeTab}
                    onTabChange={(tab: string) => setActiveTab(tab as ResearchDetailsTabs)}
                    loading={isTabLoading}
                    emptyMessage="Nenhum registro encontrado."
                    striped
                    hoverable
                />
            </div>

            <VolunteerSelectionModal
                isOpen={volunteerModalOpen}
                onClose={() => setVolunteerModalOpen(false)}
                researchId={researchId}
                currentVolunteerIds={volunteers.map(v => v.volunteerId)}
                onEnrollmentComplete={handleVolunteerEnrollmentComplete}
            />
        </AppLayout>
    );
}

export default ResearchDetailsScreen;
