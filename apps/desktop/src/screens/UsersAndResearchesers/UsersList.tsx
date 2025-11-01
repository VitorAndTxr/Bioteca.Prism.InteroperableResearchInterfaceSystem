/**
 * UsersList Screen
 * Based on IRIS Design System - Figma node 6804-13670
 *
 * Displays a list of users and researchers with CRUD operations.
 * Now uses the generic TabbedTable component from the design system.
 */

import { useMemo } from 'react';
import { Researcher, ResearcherRole, User, UserRole } from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import './UsersList.css';

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
    // Mock data - Replace with real API calls
    const mockUsers: User[] = useMemo(() => [
        {
            id: '1',
            login: 'usuario1',
            role: UserRole.ADMIN,
            researcher: {
                researcherId: '1',
                researchNodeId: 'RN1',
                name: 'Pesquisador 1',
                email: 'pesquisador1@example.com',
                institution: 'Instituição 1',
                orcid: '0000-0001-2345-6789',
                role: ResearcherRole.CHIEF,
            },
        },
        {
            id: '2',
            login: 'usuario2',
            role: UserRole.RESEARCHER,
            
        },
    ], []);

    const mockResearchers: Researcher[] = useMemo(() => [
        {
            researcherId: '1',
            researchNodeId: 'RN1',
            name: 'Pesquisador 1',
            email: 'pesquisador1@example.com',
            institution: 'Instituição 1',
            orcid: '0000-0001-2345-6789',
            role: ResearcherRole.CHIEF,
        },
        {
            researcherId: '2',
            researchNodeId: 'RN1',
            name: 'Pesquisador 2',
            email: 'pesquisador2@example.com',
            institution: 'Instituição 2',
            orcid: '0000-0001-2345-6789',
            role: ResearcherRole.RESEARCHER,
        },
    ], []);
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
                <div className="user-actions">
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
            data: mockUsers,
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
            data: mockResearchers,
            columns: researcherColumns,
            action: {
                label: 'Adicionar Pesquisador',
                icon: <PlusIcon />,
                onClick: onResearcherAdd || (() => console.log('Add researcher clicked')),
                variant: 'primary',
            },
        },
    ], [userColumns, researcherColumns, mockUsers, mockResearchers, onUserAdd, onResearcherAdd]);

    // Custom search filter
    const searchFilter = (user: any, query: string) => {
        const lowerQuery = query.toLowerCase();
        return (
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery) ||
            user.id.includes(query)
        );
    };

    return (
        <div className="users-list-screen">
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
        </div>
    );
}

export default UsersList;
