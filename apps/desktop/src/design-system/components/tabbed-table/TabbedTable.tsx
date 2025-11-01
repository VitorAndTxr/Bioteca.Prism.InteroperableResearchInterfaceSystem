/**
 * TabbedTable Component
 *
 * A generic tabbed table component that combines:
 * - Tab navigation (ButtonGroup)
 * - Content card with header
 * - Search functionality
 * - Data table with pagination
 *
 * Supports N different data types across tabs.
 * Each tab defines how to transform the base data into its specific type.
 */

import React, { useState, useMemo } from 'react';
import { DataTable } from '../data-table';
import { Button } from '../button';
import { SearchBar } from '../search-bar';
import { ButtonGroup } from '../button-group';
import type { TabbedTableProps } from './TabbedTable.types';
import './TabbedTable.css';

export function TabbedTable({
    tabs,
    defaultTab,
    selectedTab: controlledTab,
    onTabChange,
    title,
    action,
    search,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    emptyMessage = 'No data available.',
    emptySearchMessage = 'No results found for your search.',
    striped = true,
    hoverable = true,
    className = '',
}: TabbedTableProps) {
    // Determine if component is controlled or uncontrolled
    const isControlled = controlledTab !== undefined;
    const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.value || '');
    const selectedTab = isControlled ? controlledTab : internalTab;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Get current tab configuration
    const currentTab = useMemo(
        () => tabs.find(tab => tab.value === selectedTab) || tabs[0],
        [tabs, selectedTab]
    );

    // Get tab-specific data from the tab's data array
    const tabData = useMemo(() => {
        if (!currentTab) return [];
        return currentTab.data || [];
    }, [currentTab]);

    // Filter data by search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return tabData;

        // Use custom search filter if provided
        if (search?.filter) {
            return tabData.filter((item: any) => search.filter!(item, searchQuery));
        }

        // Default search: stringify object and search (basic fallback)
        const lowerQuery = searchQuery.toLowerCase();
        return tabData.filter((item: any) =>
            JSON.stringify(item).toLowerCase().includes(lowerQuery)
        );
    }, [tabData, searchQuery, search]);

    // Get card title
    const cardTitle = useMemo(() => {
        if (typeof title === 'function') {
            return title(selectedTab);
        }
        if (typeof title === 'string') {
            return title.replace('{tab}', currentTab?.label || '');
        }
        return currentTab?.title || currentTab?.label || '';
    }, [title, selectedTab, currentTab]);

    // Get action button (tab-specific overrides global)
    const actionButton = useMemo(() => {
        return currentTab?.action || action;
    }, [currentTab, action]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        if (!isControlled) {
            setInternalTab(value);
        }
        onTabChange?.(value);
        setCurrentPage(1); // Reset to first page when changing tabs
        setSearchQuery(''); // Reset search when changing tabs
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    // Convert tabs to ButtonGroup options
    const tabOptions = tabs.map(tab => ({
        value: tab.value,
        label: tab.label,
    }));

    return (
        <div className={`tabbed-table ${className}`}>
            {/* Tab Navigation */}
            <div className="tabbed-table__tabs">
                <ButtonGroup
                    options={tabOptions}
                    value={selectedTab}
                    onChange={handleTabChange}
                    ariaLabel="Select tab"
                    size="medium"
                />
            </div>

            {/* Content Card */}
            <div className="tabbed-table__card">
                {/* Card Header */}
                <div className="tabbed-table__header">
                    <h2 className="tabbed-table__title">{cardTitle}</h2>
                    {actionButton && (
                        <Button
                            variant={actionButton.variant || 'primary'}
                            size="medium"
                            onClick={actionButton.onClick}
                            icon={actionButton.icon}
                            iconPosition="left"
                        >
                            {actionButton.label}
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                {search && (
                    <div className="tabbed-table__search">
                        <SearchBar
                            placeholder={search.placeholder || 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="medium"
                            fullWidth
                        />
                    </div>
                )}

                {/* Data Table */}
                <div className="tabbed-table__table">
                    <DataTable
                        columns={currentTab?.columns || []}
                        data={filteredData}
                        pagination={{
                            currentPage,
                            pageSize,
                            totalItems: filteredData.length,
                            pageSizeOptions,
                        }}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={handlePageSizeChange}
                        striped={striped}
                        hoverable={hoverable}
                        emptyMessage={
                            searchQuery ? emptySearchMessage : emptyMessage
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default TabbedTable;
