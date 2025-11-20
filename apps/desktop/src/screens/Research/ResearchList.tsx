/**
 * ResearchList Component
 *
 * Displays a list of research projects with pagination and CRUD operations.
 * Integrated with ResearchService to fetch data from IRN backend.
 */

import { useMemo, useState, useEffect } from 'react';
import { Research, ResearchStatus } from '@iris/domain';
import { DataTable } from '../../design-system/components/data-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { researchService } from '../../services/middleware';
import { Button } from '@/design-system/components/button';
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

    // Format date helper
    const formatDate = (date?: Date | null) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
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
            width: '25%',
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
            id: 'endDate',
            label: 'Data Final',
            accessor: 'endDate',
            sortable: true,
            width: '10%',
            render: (value) => formatDate(value as Date | null),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
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
            {/* Header with title and add button */}
            <div className="list-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 16px'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                    Todos os projetos de pesquisa
                </h2>
                <Button
                    variant="primary"
                    icon={<PlusIcon />}
                    iconPosition="left"
                    onClick={onResearchAdd}
                >
                    Adicionar Pesquisa
                </Button>
            </div>

            {loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    Carregando projetos de pesquisa...
                </div>
            )}

            {!loading && (
                <DataTable
                    columns={columns}
                    data={researches}
                    emptyMessage="Nenhum projeto de pesquisa cadastrado."
                    striped
                    hoverable
                />
            )}

            {/* Pagination */}
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
