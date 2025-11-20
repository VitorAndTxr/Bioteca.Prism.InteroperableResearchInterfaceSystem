/**
 * VolunteersList Component
 *
 * Displays a list of volunteers (patients) with pagination and CRUD operations.
 * Integrated with VolunteerService to fetch data from IRN backend.
 */

import { useMemo, useState, useEffect } from 'react';
import { Volunteer, VolunteerStatus, VolunteerGender } from '@iris/domain';
import { DataTable } from '../../design-system/components/data-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { volunteerService } from '../../services/middleware';
import { Button } from '@/design-system/components/button';
import Pagination from '@/design-system/components/pagination/Pagination';
import '../../styles/shared/List.css';

export interface VolunteersListProps {
    onVolunteerAdd?: () => void;
    onVolunteerEdit?: (volunteer: Volunteer) => void;
    onVolunteerView?: (volunteer: Volunteer) => void;
}

export function VolunteersList({
    onVolunteerAdd,
    onVolunteerEdit,
    onVolunteerView,
}: VolunteersListProps) {
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalRecords: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for volunteer data
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

    // Load volunteers from backend
    useEffect(() => {
        loadVolunteers();
    }, [pagination.currentPage, pageSize]);

    const loadVolunteers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await volunteerService.getVolunteersPaginated(pagination.currentPage, pageSize);

            console.log('Fetched volunteers:', response);
            setVolunteers(response.data || []);
            console.log('Total volunteers:', response.totalRecords || 0);

            setPagination(prev => ({
                ...prev,
                totalRecords: response.totalRecords || 0
            }));

        } catch (err) {
            console.error('Failed to load volunteers:', err);
            setError(err instanceof Error ? err.message : 'Failed to load volunteers');
        } finally {
            setLoading(false);
        }
    };

    // Calculate age from birth date
    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // Format status helper
    const formatStatus = (status: VolunteerStatus) => {
        const statusMap = {
            [VolunteerStatus.ACTIVE]: 'Ativo',
            [VolunteerStatus.INACTIVE]: 'Inativo',
            [VolunteerStatus.SUSPENDED]: 'Suspenso',
            [VolunteerStatus.COMPLETED]: 'Concluído',
        };
        return statusMap[status] || status;
    };

    // Get status badge class
    const getStatusClass = (status: VolunteerStatus) => {
        const classMap = {
            [VolunteerStatus.ACTIVE]: 'status-active',
            [VolunteerStatus.INACTIVE]: 'status-inactive',
            [VolunteerStatus.SUSPENDED]: 'status-suspended',
            [VolunteerStatus.COMPLETED]: 'status-completed',
        };
        return classMap[status] || '';
    };

    // Format gender helper
    const formatGender = (gender: VolunteerGender) => {
        const genderMap = {
            [VolunteerGender.MALE]: 'Masculino',
            [VolunteerGender.FEMALE]: 'Feminino',
            [VolunteerGender.OTHER]: 'Outro',
            [VolunteerGender.NOT_INFORMED]: 'Não informado',
        };
        return genderMap[gender] || gender;
    };

    // Table columns configuration
    const columns: DataTableColumn<Volunteer>[] = useMemo(() => [
        {
            id: 'name',
            label: 'Nome',
            accessor: 'name',
            sortable: true,
            width: '25%',
        },
        {
            id: 'email',
            label: 'Email',
            accessor: 'email',
            sortable: true,
            width: '25%',
        },
        {
            id: 'age',
            label: 'Idade',
            accessor: 'birthDate',
            sortable: true,
            width: '10%',
            render: (value) => {
                const age = calculateAge(value as Date);
                return `${age} anos`;
            },
        },
        {
            id: 'gender',
            label: 'Gênero',
            accessor: 'gender',
            sortable: true,
            width: '12%',
            render: (value) => formatGender(value as VolunteerGender),
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '12%',
            render: (value) => (
                <span className={`status-badge ${getStatusClass(value as VolunteerStatus)}`}>
                    {formatStatus(value as VolunteerStatus)}
                </span>
            ),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: (_, volunteer) => (
                <div className="list-actions">
                    <button
                        className="action-button view"
                        onClick={(e) => {
                            e.stopPropagation();
                            onVolunteerView?.(volunteer);
                        }}
                        aria-label="Visualizar voluntário"
                        title="Visualizar"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        className="action-button edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onVolunteerEdit?.(volunteer);
                        }}
                        aria-label="Editar voluntário"
                        title="Editar"
                    >
                        <EditIcon />
                    </button>
                </div>
            ),
        },
    ], [onVolunteerEdit, onVolunteerView]);

    // Show error if loading failed
    if (error) {
        return (
            <div className="list-screen">
                <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    <p>Erro ao carregar dados: {error}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={loadVolunteers}
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
                    Todos os voluntários
                </h2>
                <Button
                    variant="primary"
                    icon={<PlusIcon />}
                    iconPosition="left"
                    onClick={onVolunteerAdd}
                >
                    Adicionar Voluntário
                </Button>
            </div>

            {loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    Carregando voluntários...
                </div>
            )}

            {!loading && (
                <DataTable
                    columns={columns}
                    data={volunteers}
                    emptyMessage="Nenhum voluntário cadastrado."
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

export default VolunteersList;
