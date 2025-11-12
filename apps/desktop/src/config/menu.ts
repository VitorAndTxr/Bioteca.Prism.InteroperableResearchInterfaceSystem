/**
 * Main Navigation Menu Configuration
 * Based on screens identified in Figma (UsersList, NPIRequests, ClinicalCondition)
 */

import type { SidebarMenuItem } from '../design-system/components/sidebar/Sidebar.types';

/**
 * Main application menu items
 */
export const mainMenuItems: SidebarMenuItem[] = [
    {
        id: 'dashboard',
        label: 'Consultar dados',
        path: '/dashboard',
    },
    {
        id: 'npi',
        label: 'Conexões',
        path: '/nodeConnections',
    },
    {
        id: 'research',
        label: 'Pesquisas',
        path: '/research',
    },
    {
        id: 'volunteers',
        label: 'Voluntários',
        path: '/volunteers',
    },
    {
        id: 'snomed',
        label: 'SNOMED',
        path: '/snomed',
    },
    {
        id: 'users',
        label: 'Usuários e pesquisadores',
        path: '/users',
    },
];
