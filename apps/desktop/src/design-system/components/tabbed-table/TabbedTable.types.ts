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
export interface TabbedTableTab {
    /** Unique identifier for the tab */
    value: string;
    /** Display label for the tab */
    label: string;
    /** Table columns for this tab's data type */
    columns: DataTableColumn<any>[];
    /** Optional: Custom title for the card when this tab is selected */
    title?: string;
    /** Filter and transform function to get tab-specific data from base data */
    getData: (baseData: any[]) => any[];
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
    /** Tab configurations - each tab can transform data to any type */
    tabs: TabbedTableTab[];

    /** Base data to display (will be transformed by each tab's getData function) */
    data: any[];

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
}
