/**
 * ResearchList Component
 *
 * Displays a list of research projects with pagination and CRUD operations.
 * Uses TabbedTable with single tab for consistency with application style.
 * Integrated with ResearchService to fetch data from IRN backend.
 */

import { useMemo, useState, useEffect } from 'react';
import { Research, ResearchStatus } from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { researchService } from '../../services/middleware';
import Pagination from '@/design-system/components/pagination/Pagination';
import '../../styles/shared/List.css';

export interface ResearchListProps {
    onResearchAdd?: () => void;
    onResearchEdit?: (research: Research) => void;
    onResearchView?: (research: Research) => void;
}

export function ResearchList({
    onResearchAdd,
    onResearchEdit,
    onResearchView,
}: ResearchListProps) {
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalRecords: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for research data
    const [researches, setResearches] = useState<Research[]>([]);

    // Load research projects from backend
    useEffect(() => {
        loadResearches();
    }, [pagination.currentPage, pageSize]);

    const loadResearches = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await researchService.getResearchPaginated(pagination.currentPage, pageSize);

            console.log('Fetched research projects:', response);
            setResearches(response.data || []);
            console.log('Total research projects:', response.totalRecords || 0);

            setPagination(prev => ({
                ...prev,
                totalRecords: response.totalRecords || 0
            }));

        } catch (err) {
            console.error('Failed to load research projects:', err);
            setError(err instanceof Error ? err.message : 'Failed to load research projects');
        } finally {
            setLoading(false);
        }
    };

    // Format status helper
    const formatStatus = (status: ResearchStatus) => {
        const statusMap = {
            [ResearchStatus.ACTIVE]: 'Ativo',
            [ResearchStatus.COMPLETED]: 'Concluído',
            [ResearchStatus.SUSPENDED]: 'Suspenso',
            [ResearchStatus.ARCHIVED]: 'Arquivado',
        };
        return statusMap[status] || status;
    };

    // Get status badge class
    const getStatusClass = (status: ResearchStatus) => {
        const classMap = {
            [ResearchStatus.ACTIVE]: 'status-active',
            [ResearchStatus.COMPLETED]: 'status-completed',
            [ResearchStatus.SUSPENDED]: 'status-suspended',
            [ResearchStatus.ARCHIVED]: 'status-archived',
        };
        return classMap[status] || '';
    };

    // Truncate text helper
    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Table columns configuration
    const columns: DataTableColumn<Research>[] = useMemo(() => [
        {
            id: 'title',
            label: 'Título',
            accessor: 'title',
            sortable: true,
            width: '25%',
        },
        {
            id: 'description',
            label: 'Descrição',
            accessor: 'description',
            sortable: false,
            width: '30%',
            render: (value) => (
                <span title={value as string}>
                    {truncateText(value as string, 50)}
                </span>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '12%',
            render: (value) => (
                <span className={`status-badge ${getStatusClass(value as ResearchStatus)}`}>
                    {formatStatus(value as ResearchStatus)}
                </span>
            ),
        },
        {
            id: 'researchNode',
            label: 'Nó de Pesquisa',
            accessor: 'researchNode.nodeName',
            sortable: true,
            width: '18%',
            render: (value) => value || '-',
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '15%',
            align: 'center',
            render: (_, research) => (
                <div className="list-actions">
                    <button
                        className="action-button view"
                        onClick={(e) => {
                            e.stopPropagation();
                            onResearchView?.(research);
                        }}
                        aria-label="Visualizar pesquisa"
                        title="Visualizar"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        className="action-button edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onResearchEdit?.(research);
                        }}
                        aria-label="Editar pesquisa"
                        title="Editar"
                    >
                        <EditIcon />
                    </button>
                </div>
            ),
        },
    ], [onResearchEdit, onResearchView]);

    // Tab configuration (single tab for style consistency)
    const tabs: TabbedTableTab<Research>[] = useMemo(() => [
        {
            value: 'researches',
            label: 'Todas as Pesquisas',
            data: researches,
            columns: columns,
            action: {
                label: 'Adicionar Pesquisa',
                icon: <PlusIcon />,
                onClick: onResearchAdd || (() => console.log('Add research clicked')),
                variant: 'primary',
            },
        },
    ], [columns, researches, onResearchAdd]);

    // Search filter
    const searchFilter = (item: Record<string, unknown>, query: string) => {
        const lowerQuery = query.toLowerCase();
        return (
            (item.title as string)?.toLowerCase().includes(lowerQuery) ||
            (item.description as string)?.toLowerCase().includes(lowerQuery) ||
            (item.status as string)?.toLowerCase().includes(lowerQuery)
        );
    };

    // Show error if loading failed
    if (error) {
        return (
            <div className="list-screen">
                <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    <p>Erro ao carregar dados: {error}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={loadResearches}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Recarregar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="list-screen">
            <TabbedTable
                tabs={tabs}
                search={{
                    placeholder: 'Buscar pesquisa...',
                    filter: searchFilter,
                }}
                emptyMessage="Nenhum projeto de pesquisa cadastrado."
                emptySearchMessage="Nenhuma pesquisa encontrada com os critérios de busca."
                striped
                hoverable
                loading={loading}
            />

            {!loading && pagination.totalRecords > pageSize &&
                <Pagination
                    setPagination={setPagination}
                    pagination={pagination}
                    pageSize={pageSize}
                />
            }
        </div>
    );
}

export default ResearchList;
