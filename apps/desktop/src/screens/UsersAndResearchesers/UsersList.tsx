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

export interface UsersListProps {
    onUserAdd?: () => void;
    onUserEdit?: (user: User) => void;
    onUserView?: (user: User) => void;
    onResearcherAdd?: () => void;
    onResearcherEdit?: (researcher: Researcher) => void;
    onResearcherView?: (researcher: Researcher) => void;
}

export function UsersList({
    onUserAdd,
    onUserEdit,
    onUserView,
    onResearcherAdd,
    onResearcherEdit,
    onResearcherView,
}: UsersListProps) {
    // State for users data
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);

    // State for researchers data
    const [researchers, setResearchers] = useState<Researcher[]>([]);
    const [loadingResearchers, setLoadingResearchers] = useState(true);
    const [researchersError, setResearchersError] = useState<string | null>(null);

    // Pagination state for users
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const [userPageSize] = useState(10);
    const [totalUserRecords, setTotalUserRecords] = useState(0);

    // Pagination state for researchers
    const [currentResearcherPage, setCurrentResearcherPage] = useState(1);
    const [researcherPageSize] = useState(10);
    const [totalResearcherRecords, setTotalResearcherRecords] = useState(0);

    // Load users from backend
    useEffect(() => {
        loadUsers();
    }, [currentUserPage, userPageSize]);

    // Load researchers from backend
    useEffect(() => {
        loadResearchers();
    }, [currentResearcherPage, researcherPageSize]);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            setUsersError(null);

            const response = await userService.getUsers(currentUserPage, userPageSize);

            console.log('Fetched users:', response);
            setUsers(response.data);
            setTotalUserRecords(response.pagination.totalRecords);
        } catch (err) {
            console.error('Failed to load users:', err);
            setUsersError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadResearchers = async () => {
        try {
            setLoadingResearchers(true);
            setResearchersError(null);

            const response = await researcherService.getResearchersPaginated(currentResearcherPage, researcherPageSize);

            console.log('Fetched researchers:', response);
            setResearchers(response.data);
            setTotalResearcherRecords(response.pagination.totalRecords);
        } catch (err) {
            console.error('Failed to load researchers:', err);
            setResearchersError(err instanceof Error ? err.message : 'Failed to load researchers');
        } finally {
            setLoadingResearchers(false);
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
    },
        {
        id: 'orcid',
        label: 'Orcid',
        accessor: 'orcid',
        sortable: true,
        width: '10%',
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
    const searchFilter = (user: any, query: string) => {
        const lowerQuery = query.toLowerCase();
        return (
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery) ||
            user.id.includes(query)
        );
    };

    // Calculate overall loading and error states
    const loading = loadingUsers || loadingResearchers;
    const hasError = usersError || researchersError;

    // Show error if loading failed
    if (hasError) {
        return (
            <div className="list-screen">
                <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    {usersError && <p>Erro ao carregar usuários: {usersError}</p>}
                    {researchersError && <p>Erro ao carregar pesquisadores: {researchersError}</p>}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {usersError && (
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
                        {researchersError && (
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
                    {loadingUsers && 'Carregando usuários... '}
                    {loadingResearchers && 'Carregando pesquisadores...'}
                </div>
            )}
            {!loading && (
                <TabbedTable
                    tabs={tabs}
                    search={{
                        placeholder: 'Buscar...',
                        filter: searchFilter,
                    }}
                    emptyMessage="Nenhum registro cadastrado."
                    emptySearchMessage="Nenhum registro encontrado com os critérios de busca."
                    striped
                    hoverable
                />
            )}

            {/* Pagination for Users */}
            {!loading && totalUserRecords > userPageSize && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Usuários:</span>
                    <button
                        onClick={() => setCurrentUserPage(prev => Math.max(1, prev - 1))}
                        disabled={currentUserPage === 1}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentUserPage === 1 ? '#e5e7eb' : '#3b82f6',
                            color: currentUserPage === 1 ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentUserPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {currentUserPage} de {Math.ceil(totalUserRecords / userPageSize)}
                    </span>
                    <button
                        onClick={() => setCurrentUserPage(prev => prev + 1)}
                        disabled={currentUserPage >= Math.ceil(totalUserRecords / userPageSize)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentUserPage >= Math.ceil(totalUserRecords / userPageSize) ? '#e5e7eb' : '#3b82f6',
                            color: currentUserPage >= Math.ceil(totalUserRecords / userPageSize) ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentUserPage >= Math.ceil(totalUserRecords / userPageSize) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Pagination for Researchers */}
            {!loading && totalResearcherRecords > researcherPageSize && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Pesquisadores:</span>
                    <button
                        onClick={() => setCurrentResearcherPage(prev => Math.max(1, prev - 1))}
                        disabled={currentResearcherPage === 1}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentResearcherPage === 1 ? '#e5e7eb' : '#3b82f6',
                            color: currentResearcherPage === 1 ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentResearcherPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {currentResearcherPage} de {Math.ceil(totalResearcherRecords / researcherPageSize)}
                    </span>
                    <button
                        onClick={() => setCurrentResearcherPage(prev => prev + 1)}
                        disabled={currentResearcherPage >= Math.ceil(totalResearcherRecords / researcherPageSize)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentResearcherPage >= Math.ceil(totalResearcherRecords / researcherPageSize) ? '#e5e7eb' : '#3b82f6',
                            color: currentResearcherPage >= Math.ceil(totalResearcherRecords / researcherPageSize) ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentResearcherPage >= Math.ceil(totalResearcherRecords / researcherPageSize) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}

export default UsersList;
