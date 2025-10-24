/**
 * UsersList Screen
 * Based on IRIS Design System - Figma node 6804-13670
 *
 * Displays a list of users and researchers with CRUD operations.
 * Now uses the generic TabbedTable component from the design system.
 */

import React, { useMemo } from 'react';
import { User, UserRole } from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import './UsersList.css';

export interface UsersListProps {
    onUserAdd?: () => void;
    onUserEdit?: (user: User) => void;
    onUserView?: (user: User) => void;
}

export function UsersList({
    onUserAdd,
    onUserEdit,
    onUserView,
}: UsersListProps) {
    // Mock data - Replace with real API calls
    const mockUsers: User[] = useMemo(() => [
        {
            id: '1',
            email: 'admin@iris.com',
            name: 'Admin User',
            role: UserRole.ADMIN,
            createdAt: new Date('2024-01-01'),
            lastLogin: new Date('2025-01-15T14:30:00'),
        },
        {
            id: '2',
            email: 'researcher@iris.com',
            name: 'Dr. Silva',
            role: UserRole.RESEARCHER,
            createdAt: new Date('2024-02-15'),
            lastLogin: new Date('2025-01-14T09:15:00'),
        },
        {
            id: '3',
            email: 'clinician@iris.com',
            name: 'Dr. Santos',
            role: UserRole.CLINICIAN,
            createdAt: new Date('2024-03-20'),
            lastLogin: new Date('2025-01-13T16:45:00'),
        },
        {
            id: '4',
            email: 'viewer@iris.com',
            name: 'João Oliveira',
            role: UserRole.VIEWER,
            createdAt: new Date('2024-04-10'),
            lastLogin: new Date('2025-01-10T11:20:00'),
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
            accessor: 'email',
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
            accessor: 'name',
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

    // Tab configurations
    // Both tabs work with User type, but filter differently
    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'users',
            label: 'Usuários',
            title: 'Todos os usuários',
            columns: userColumns,
            getData: (users: User[]) => users.filter(u => u.role !== UserRole.RESEARCHER),
        },
        {
            value: 'researchers',
            label: 'Pesquisadores',
            title: 'Todos os pesquisadores',
            columns: userColumns,
            getData: (users: User[]) => users.filter(u => u.role === UserRole.RESEARCHER),
        },
    ], [userColumns]);

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
                data={mockUsers}
                action={{
                    label: 'Adicionar',
                    icon: <PlusIcon />,
                    onClick: onUserAdd || (() => console.log('Add user clicked')),
                    variant: 'primary',
                }}
                search={{
                    placeholder: 'Buscar usuários...',
                    filter: searchFilter,
                }}
                emptyMessage="Nenhum usuário cadastrado."
                emptySearchMessage="Nenhum usuário encontrado com os critérios de busca."
                striped
                hoverable
            />
        </div>
    );
}

export default UsersList;
