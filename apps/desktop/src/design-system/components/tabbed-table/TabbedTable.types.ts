/**
 * TabbedTable Types
 *
 * Generic tabbed table component that combines tabs, search, and data table functionality.
 * Supports N different data types across tabs through union types.
 */

import { ReactNode } from 'react';
import type { DataTableColumn } from '../data-table/DataTable.types';

/**
 * Tab configuration for TabbedTable
 *
 * Each tab can work with any data type.
 * The component uses union types to support multiple different types simultaneously.
 */
export interface TabbedTableTab<T = any> {
    /** Unique identifier for the tab */
    value: string;
    /** Display label for the tab */
    label: string;
    /** Data array for this tab */
    data: T[];
    /** Table columns for this tab's data type */
    columns: DataTableColumn<T>[];
    /** Optional: Custom title for the card when this tab is selected */
    title?: string;
    /** Optional: Action button configuration for this tab (overrides global action) */
    action?: TabbedTableAction;

    secondaryAction?: TabbedTableAction;
}

/**
 * Action button configuration
 */
export interface TabbedTableAction {
    /** Button label */
    label: string;
    /** Icon component to display */
    icon?: ReactNode;
    /** Click handler */
    onClick: () => void;
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Search configuration
 */
export interface TabbedTableSearch {
    /** Search placeholder text */
    placeholder?: string;
    /** Custom search filter function (applied per tab to current tab's data) */
    filter?: (item: any, query: string) => boolean;
}

/**
 * TabbedTable component props
 */
export interface TabbedTableProps {
    /** Tab configurations - each tab contains its own data array */
    tabs: TabbedTableTab[];

    /** Optional: Default tab value (defaults to first tab) */
    defaultTab?: string;

    /** Optional: Controlled tab value */
    selectedTab?: string;

    /** Optional: Tab change handler */
    onTabChange?: (tab: string) => void;

    /** Optional: Card title (can use {tab} placeholder for dynamic title) */
    title?: string | ((selectedTab: string) => string);

    /** Optional: Action button configuration */
    action?: TabbedTableAction;

        /** Optional: Action button configuration */
    secondaryAction?: TabbedTableAction;

    /** Optional: Search configuration */
    search?: TabbedTableSearch;

    /** Optional: Initial page size */
    pageSize?: number;

    /** Optional: Page size options */
    pageSizeOptions?: number[];

    /** Optional: Empty state message */
    emptyMessage?: string;

    /** Optional: Empty search results message */
    emptySearchMessage?: string;

    /** Optional: Enable table striping */
    striped?: boolean;

    /** Optional: Enable row hover effect */
    hoverable?: boolean;

    /** Optional: CSS class name */
    className?: string;

    /** Optional: Loading state */
    loading?: boolean;

    /** Optional: Custom loading component */
    loadingComponent?: ReactNode;
}
