/**
 * ResearchDetailsScreen Component
 *
 * Displays detailed information about a specific research project with tabbed content.
 * Matches the Figma prototype with 5 tabs:
 * - Pesquisadores (Researchers)
 * - Voluntários (Volunteers)
 * - Aplicações (Applications)
 * - Dispositivos (Devices)
 * - Sensores (Sensors)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Button } from '../../design-system/components/button';
import { TabbedTable, TabbedTableTab } from '../../design-system/components/tabbed-table';
import { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { Research } from '@iris/domain';
import { researchService } from '../../services/middleware';

export interface ResearchDetailsScreenProps {
    handleNavigation: (path: string) => void;
    researchId: string;
}

type ResearchDetailsTabs = 'researchers' | 'volunteers' | 'applications' | 'devices' | 'sensors';

// Placeholder types for tab data
interface ResearcherItem {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface VolunteerItem {
    id: string;
    name: string;
    birthDate: string;
    gender: string;
}

interface ApplicationItem {
    id: string;
    name: string;
    date: string;
    status: string;
}

interface DeviceItem {
    id: string;
    name: string;
    type: string;
    status: string;
}

interface SensorItem {
    id: string;
    name: string;
    type: string;
    status: string;
}

export function ResearchDetailsScreen({ handleNavigation, researchId }: ResearchDetailsScreenProps) {
    const [research, setResearch] = useState<Research | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ResearchDetailsTabs>('researchers');

    // Placeholder data for tabs (will be replaced with actual API calls)
    const [researchers] = useState<ResearcherItem[]>([]);
    const [volunteers] = useState<VolunteerItem[]>([]);
    const [applications] = useState<ApplicationItem[]>([]);
    const [devices] = useState<DeviceItem[]>([]);
    const [sensors] = useState<SensorItem[]>([]);

    useEffect(() => {
        loadResearchDetails();
    }, [researchId]);

    const loadResearchDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch research details
            const response = await researchService.getResearchPaginated(1, 100);
            const found = response.data.find((r: Research) => r.id === researchId);

            if (found) {
                setResearch(found);
                // TODO: Load actual data for each tab from API
            } else {
                setError('Projeto de pesquisa não encontrado');
            }
        } catch (err) {
            console.error('Failed to load research details:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
        } finally {
            setLoading(false);
        }
    };

    // Column definitions for each tab
    const researcherColumns: DataTableColumn<ResearcherItem>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '35%',
        },
        {
            id: 'email',
            label: 'Email',
            accessor: 'email',
            sortable: true,
            width: '35%',
        },
        {
            id: 'role',
            label: 'Função',
            accessor: 'role',
            sortable: true,
            width: '20%',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: () => (
                <div className="flex justify-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Remover">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const volunteerColumns: DataTableColumn<VolunteerItem>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '40%',
        },
        {
            id: 'birthDate',
            label: 'Data de nascimento',
            accessor: 'birthDate',
            sortable: true,
            width: '30%',
        },
        {
            id: 'gender',
            label: 'Gênero',
            accessor: 'gender',
            sortable: true,
            width: '20%',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: () => (
                <div className="flex justify-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Remover">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const applicationColumns: DataTableColumn<ApplicationItem>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '40%',
        },
        {
            id: 'date',
            label: 'Data',
            accessor: 'date',
            sortable: true,
            width: '30%',
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '20%',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: () => (
                <div className="flex justify-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Remover">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const deviceColumns: DataTableColumn<DeviceItem>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '40%',
        },
        {
            id: 'type',
            label: 'Tipo',
            accessor: 'type',
            sortable: true,
            width: '30%',
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '20%',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: () => (
                <div className="flex justify-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Remover">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const sensorColumns: DataTableColumn<SensorItem>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '40%',
        },
        {
            id: 'type',
            label: 'Tipo',
            accessor: 'type',
            sortable: true,
            width: '30%',
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '20%',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: () => (
                <div className="flex justify-center gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Remover">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    // Tab configuration matching Figma design
    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'researchers',
            label: 'Pesquisadores',
            title: research?.title || 'Pesquisa',
            data: researchers,
            columns: researcherColumns as DataTableColumn<unknown>[],
        },
        {
            value: 'volunteers',
            label: 'Voluntários',
            title: research?.title || 'Pesquisa',
            data: volunteers,
            columns: volunteerColumns as DataTableColumn<unknown>[],
        },
        {
            value: 'applications',
            label: 'Aplicações',
            title: research?.title || 'Pesquisa',
            data: applications,
            columns: applicationColumns as DataTableColumn<unknown>[],
        },
        {
            value: 'devices',
            label: 'Dispositivos',
            title: research?.title || 'Pesquisa',
            data: devices,
            columns: deviceColumns as DataTableColumn<unknown>[],
        },
        {
            value: 'sensors',
            label: 'Sensores',
            title: research?.title || 'Pesquisa',
            data: sensors,
            columns: sensorColumns as DataTableColumn<unknown>[],
        },
    ], [research, researchers, volunteers, applications, devices, sensors,
        researcherColumns, volunteerColumns, applicationColumns, deviceColumns, sensorColumns]);

    const getActionButtons = () => {
        // Different actions based on active tab - matching Figma design
        if (activeTab === 'volunteers') {
            return (
                <div className="flex gap-3 mb-4 justify-end">
                    <Button
                        variant="primary"
                        size="medium"
                        icon={<PlusIcon className="w-5 h-5" />}
                        iconPosition="left"
                        onClick={() => console.log('Add new volunteer')}
                    >
                        Adicionar novo
                    </Button>
                    <Button
                        variant="outline"
                        size="medium"
                        icon={<PlusIcon className="w-5 h-5" />}
                        iconPosition="left"
                        onClick={() => console.log('Add existing volunteer')}
                    >
                        Adicionar existente
                    </Button>
                </div>
            );
        }
        return (
            <div className="flex gap-3 mb-4 justify-end">
                <Button
                    variant="primary"
                    size="medium"
                    icon={<PlusIcon className="w-5 h-5" />}
                    iconPosition="left"
                    onClick={() => console.log('Add new', activeTab)}
                >
                    Adicionar
                </Button>
            </div>
        );
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
                {/* Error state */}
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

                {/* Action buttons */}
                {!loading && !error && getActionButtons()}

                {/* Tabbed content */}
                <TabbedTable
                    tabs={tabs}
                    selectedTab={activeTab}
                    onTabChange={(tab) => setActiveTab(tab as ResearchDetailsTabs)}
                    loading={loading}
                    emptyMessage="Nenhum registro encontrado."
                    striped
                    hoverable
                />
            </div>
        </AppLayout>
    );
}

export default ResearchDetailsScreen;
