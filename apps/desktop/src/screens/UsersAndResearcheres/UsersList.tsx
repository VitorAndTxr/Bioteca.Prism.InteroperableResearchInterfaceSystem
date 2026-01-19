/**
 * UsersList Screen
 * Based on IRIS Design System - Figma node 6804-13670
 *
 * Displays a list of users and researchers with CRUD operations.
 * Now uses the generic TabbedTable component from the design system.
 * Integrated with UserService to fetch real data from IRN backend.
 */

import { useMemo, useState, useEffect } from 'react';
import { Researcher, ResearcherRole, User, UserRole } from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { userService, researcherService } from '../../services/middleware';
import '../../styles/shared/List.css';
import Pagination from '@/design-system/components/pagination/Pagination';

export interface UsersListProps {
    onUserAdd?: () => void;
    onUserEdit?: (user: User) => void;
    onUserView?: (user: User) => void;
    onResearcherAdd?: () => void;
    onResearcherEdit?: (researcher: Researcher) => void;
    onResearcherView?: (researcher: Researcher) => void;
}

type UsersTabs = 'users' | 'researchers';

// Friendly name mappings for Researcher role
const researcherRoleDisplayNames: Record<string, string> = {
    chief_researcher: 'Pesquisador Chefe',
    researcher: 'Pesquisador',
    CHIEF_RESEARCHER: 'Pesquisador Chefe',
    RESEARCHER: 'Pesquisador',
    ChiefResearcher: 'Pesquisador Chefe',
    Researcher: 'Pesquisador',
};

// Format ORCID with mask (0000-0000-0000-0000)
const formatOrcid = (orcid: string): string => {
    if (!orcid) return '-';
    // Remove any existing dashes
    const clean = orcid.replace(/-/g, '');
    // Apply mask if we have 16 characters
    if (clean.length === 16) {
        return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}`;
    }
    // Return as-is if already formatted or different length
    return orcid;
};

export function UsersList({
    onUserAdd,
    onUserEdit,
    onUserView,
    onResearcherAdd,
    onResearcherEdit,
    onResearcherView,
}: UsersListProps) {
    const [activeTab, setActiveTab] = useState<UsersTabs>('users');

    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalRecords: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for users data
    const [users, setUsers] = useState<User[]>([]);

    // State for researchers data
    const [researchers, setResearchers] = useState<Researcher[]>([]);

    // Load users from backend
    useEffect(() => {

        switch(activeTab) {
            case 'users':
                loadUsers();
                break;
            case 'researchers':
                loadResearchers();
                break;
            default:
                break;
        }
    }, [pagination.currentPage, pageSize, activeTab]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await userService.getUsers(pagination.currentPage, pageSize);

            console.log('Fetched users:', response);
            setUsers(response.data || []);
            console.log('Total users:', response.totalRecords || 0);

            setPagination(prev => ({
                ...prev,
                totalRecords: response.totalRecords || 0
            }));

        } catch (err) {
            console.error('Failed to load users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const loadResearchers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await researcherService.getResearchersPaginated(pagination.currentPage, pageSize);

            console.log('Fetched researchers:', response);
            setResearchers(response.data || []);
            setPagination(prev => ({
                ...prev,
                totalRecords: response.totalRecords || 0
            }));
        } catch (err) {
            console.error('Failed to load researchers:', err);
            setError(err instanceof Error ? err.message : 'Failed to load researchers');
        } finally {
            setLoading(false);
        }
    };

    // Format date helper
    const formatDate = (date?: Date) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Format role helper
    const formatRole = (role: UserRole) => {
        const roleMap = {
            [UserRole.ADMIN]: 'Administrador',
            [UserRole.RESEARCHER]: 'Pesquisador',
            [UserRole.CLINICIAN]: 'Clínico',
            [UserRole.VIEWER]: 'Visualizador',
        };
        return roleMap[role] || role;
    };

    // Shared columns for both tabs (same data type = User)
    const userColumns: DataTableColumn<User>[] = useMemo(() => [
        {
            id: 'login',
            label: 'Login',
            accessor: 'login',
            sortable: true,
            width: '25%',
        },
        {
            id: 'type',
            label: 'Tipo',
            accessor: 'role',
            sortable: true,
            width: '20%',
            render: (value) => formatRole(value as UserRole),
        },
        {
            id: 'researcher',
            label: 'Pesquisador',
            accessor: 'researcher.name',
            sortable: true,
            width: '25%',
            render: (value) => value || '-',
        },
        {
            id: 'lastAccess',
            label: 'Último acesso',
            accessor: 'lastLogin',
            sortable: true,
            width: '20%',
            render: (value) => formatDate(value as Date),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '10%',
            align: 'center',
            render: (_, user) => (
                <div className="list-actions">
                    <button
                        className="action-button view"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUserView?.(user);
                        }}
                        aria-label="Visualizar usuário"
                        title="Visualizar"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        className="action-button edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUserEdit?.(user);
                        }}
                        aria-label="Editar usuário"
                        title="Editar"
                    >
                        <EditIcon />
                    </button>
                </div>
            ),
        },
    ], [onUserEdit, onUserView]);

    const researcherColumns: DataTableColumn<Researcher>[] = useMemo(() => [
    {
        id: 'nome',
        label: 'Nome',
        accessor: 'name',
        sortable: true,
        width: '20%',
    },
    {
        id: 'email',
        label: 'Email',
        accessor: 'email',
        sortable: true,
        width: '20%'
    },
    {
        id: 'institution',
        label: 'Instituição',
        accessor: 'institution',
        sortable: true,
        width: '10%',
    },
    {
        id: 'role',
        label: 'Tipo',
        accessor: 'role',
        sortable: true,
        width: '10%',
        render: (value) => researcherRoleDisplayNames[value as string] || value,
    },
    {
        id: 'orcid',
        label: 'ORCID',
        accessor: 'orcid',
        sortable: true,
        width: '15%',
        render: (value) => formatOrcid(value as string),
    },
    {
        id: 'actions',
        label: 'Ações',
        accessor: 'id',
        width: '10%',
        align: 'center',
        render: (_, researcher) => (
            <div className="researcher-actions">
                <button
                    className="action-button view"
                    onClick={(e) => {
                        e.stopPropagation();
                        onResearcherView?.(researcher);
                    }}
                    aria-label="Visualizar usuário"
                    title="Visualizar"
                >
                    <EyeIcon />
                </button>
                <button
                    className="action-button edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onResearcherEdit?.(researcher);
                    }}
                    aria-label="Editar usuário"
                    title="Editar"
                >
                    <EditIcon />
                </button>
            </div>
        ),
    },
], [onResearcherEdit, onResearcherView]);


    // Tab configurations
    // Each tab has its own data array, columns, and action button
    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'users',
            label: 'Usuários',
            title: 'Todos os usuários',
            data: users,
            columns: userColumns,
            action: {
                label: 'Adicionar Usuário',
                icon: <PlusIcon />,
                onClick: onUserAdd || (() => console.log('Add user clicked')),
                variant: 'primary',
            },
        },
        {
            value: 'researchers',
            label: 'Pesquisadores',
            title: 'Todos os pesquisadores',
            data: researchers,
            columns: researcherColumns,
            action: {
                label: 'Adicionar Pesquisador',
                icon: <PlusIcon />,
                onClick: onResearcherAdd || (() => console.log('Add researcher clicked')),
                variant: 'primary',
            },
        },
    ], [userColumns, researcherColumns, users, researchers, onUserAdd, onResearcherAdd]);

    // Custom search filter
    const searchFilter = (item: Record<string, unknown>, query: string) => {
        const lowerQuery = query.toLowerCase();
        return (
            (item.name as string)?.toLowerCase().includes(lowerQuery) ||
            (item.email as string)?.toLowerCase().includes(lowerQuery) ||
            (item.id as string)?.includes(query) ||
            (item.login as string)?.toLowerCase().includes(lowerQuery) ||
            // Researcher-specific fields
            (item.institution as string)?.toLowerCase().includes(lowerQuery) ||
            (item.orcid as string)?.includes(query)
        );
    };


    // Show error if loading failed
    if (error) {
        return (
            <div className="list-screen">
                <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    {error && activeTab === 'users' && <p>Erro ao carregar dados: {error}</p>}
                    {error && activeTab === 'researchers' && <p>Erro ao carregar pesquisadores: {error}</p>}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {error && activeTab === 'users' && (
                            <button
                                onClick={loadUsers}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Recarregar usuários
                            </button>
                        )}
                        {error && activeTab === 'researchers' && (
                            <button
                                onClick={loadResearchers}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Recarregar pesquisadores
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="list-screen">
            {loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    {loading && activeTab === 'users' && 'Carregando usuários... '}
                    {loading && activeTab === 'researchers' && 'Carregando pesquisadores...'}
                </div>
            )}
            {!loading && (
                <TabbedTable
                    tabs={tabs}
                    search={{
                        placeholder: 'Buscar...',
                        filter: searchFilter,
                    }}
                    onTabChange={async (tab)=>{
                        setActiveTab(tab as UsersTabs);
                    }}
                    selectedTab={activeTab}
                    emptyMessage="Nenhum registro cadastrado."
                    emptySearchMessage="Nenhum registro encontrado com os critérios de busca."
                    striped
                    hoverable
                />
            )}

            {/* Pagination for Users */}
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

export default UsersList;
