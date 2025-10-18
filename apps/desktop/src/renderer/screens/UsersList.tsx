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
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import './UsersList.css';

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 10C15.4167 13.3333 12.9167 15 10 15C7.08333 15 4.58333 13.3333 2.5 10C4.58333 6.66667 7.08333 5 10 5C12.9167 5 15.4167 6.66667 17.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.1667 2.5C14.3856 2.28113 14.6454 2.10752 14.9313 1.98906C15.2173 1.87061 15.5238 1.80965 15.8333 1.80965C16.1429 1.80965 16.4494 1.87061 16.7353 1.98906C17.0213 2.10752 17.281 2.28113 17.5 2.5C17.7189 2.71887 17.8925 2.97864 18.0109 3.26457C18.1294 3.55051 18.1904 3.85701 18.1904 4.16667C18.1904 4.47633 18.1294 4.78283 18.0109 5.06876C17.8925 5.3547 17.7189 5.61447 17.5 5.83333L6.25 17.0833L1.66667 18.3333L2.91667 13.75L14.1667 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

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

    return (
        <div className="users-list-screen">
            {/* Tabs and Content */}
            <div className="users-list-content">
                {/* Tabs */}
                <div className="users-list-tabs">
                    <button
                        className={`tab-button ${selectedTab === 'users' ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedTab('users');
                            setCurrentPage(1);
                        }}
                    >
                        Usuários
                    </button>
                    <button
                        className={`tab-button ${selectedTab === 'researchers' ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedTab('researchers');
                            setCurrentPage(1);
                        }}
                    >
                        Pesquisadores
                    </button>
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
                            iconLeft={<PlusIcon />}
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
                            onClear={() => setSearchQuery('')}
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
