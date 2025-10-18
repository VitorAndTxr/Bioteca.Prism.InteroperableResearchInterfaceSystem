/**
 * UsersList Screen
 * Based on IRIS Design System - Figma node 6804-13670
 *
 * Displays a list of users and researchers with CRUD operations.
 * Includes tabs for Users and Researchers, search functionality, and action buttons.
 */

import React, { useState, useMemo } from 'react';
import { User, UserRole } from '@iris/domain';
import { DataTable } from '../../design-system/components/data-table';
import { Button } from '../../design-system/components/button';
import { SearchBar } from '../../design-system/components/search-bar';
import { ButtonGroup } from '../../design-system/components/button-group';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import type { ButtonGroupOption } from '../../design-system/components/button-group';
import './UsersList.css';

import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
export interface UsersListProps {
    onUserAdd?: () => void;
    onUserEdit?: (user: User) => void;
    onUserView?: (user: User) => void;
}

type UserType = 'users' | 'researchers';

export function UsersList({
    onUserAdd,
    onUserEdit,
    onUserView,
}: UsersListProps) {
    // State
    const [selectedTab, setSelectedTab] = useState<UserType>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Mock data - Replace with real API calls
    const mockUsers: User[] = [
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
    ];

    // Filter data based on tab and search
    const filteredUsers = useMemo(() => {
        let filtered = mockUsers;

        // Filter by tab
        if (selectedTab === 'users') {
            filtered = filtered.filter(u => u.role !== UserRole.RESEARCHER);
        } else {
            filtered = filtered.filter(u => u.role === UserRole.RESEARCHER);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.id.includes(searchQuery)
            );
        }

        return filtered;
    }, [selectedTab, searchQuery]);

    // Format date
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

    // Format role for display
    const formatRole = (role: UserRole) => {
        const roleMap = {
            [UserRole.ADMIN]: 'Administrador',
            [UserRole.RESEARCHER]: 'Pesquisador',
            [UserRole.CLINICIAN]: 'Clínico',
            [UserRole.VIEWER]: 'Visualizador',
        };
        return roleMap[role] || role;
    };

    // Table columns
    const columns: DataTableColumn<User>[] = [
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
    ];

    // ButtonGroup options
    const tabOptions: ButtonGroupOption[] = [
        { value: 'users', label: 'Usuários' },
        { value: 'researchers', label: 'Pesquisadores' },
    ];

    const handleTabChange = (value: string) => {
        setSelectedTab(value as UserType);
        setCurrentPage(1);
    };

    return (
        <div className="users-list-screen">
            {/* Tabs and Content */}
            <div className="users-list-content">
                {/* Tabs using ButtonGroup */}
                <div className="users-list-tabs">
                    <ButtonGroup
                        options={tabOptions}
                        value={selectedTab}
                        onChange={handleTabChange}
                        ariaLabel="Select user type"
                        size="medium"
                    />
                </div>

                {/* Content Card */}
                <div className="users-list-card">
                    {/* Card Header */}
                    <div className="card-header">
                        <h2 className="card-title">
                            {selectedTab === 'users' ? 'Todos os usuários' : 'Todos os pesquisadores'}
                        </h2>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={onUserAdd}
                            icon={<PlusIcon />}
                            iconPosition="left"
                        >
                            Adicionar
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="card-search">
                        <SearchBar
                            placeholder="Buscar usuários..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="medium"
                            fullWidth
                        />
                    </div>

                    {/* Data Table */}
                    <div className="card-table">
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                            pagination={{
                                currentPage,
                                pageSize,
                                totalItems: filteredUsers.length,
                                pageSizeOptions: [5, 10, 20, 50],
                            }}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }}
                            striped
                            hoverable
                            emptyMessage={
                                searchQuery
                                    ? 'Nenhum usuário encontrado com os critérios de busca.'
                                    : 'Nenhum usuário cadastrado.'
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersList;
