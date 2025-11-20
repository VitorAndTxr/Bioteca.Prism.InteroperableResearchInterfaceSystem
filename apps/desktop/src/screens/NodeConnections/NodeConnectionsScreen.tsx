import React, { useEffect, useMemo, useState } from 'react';
import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "@/design-system/components/app-layout";
import { TabbedTable, TabbedTableTab } from "@/design-system/components/tabbed-table";
import { DataTableColumn } from "@/design-system/components/data-table/DataTable.types";
import { ResearchNodeConnection, AuthorizationStatus, NodeAccessLevel } from "@iris/domain";
import { nodeConnectionService } from "@/services/middleware";
import { CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import Pagination from '@/design-system/components/pagination/Pagination';

type NodeConnectionsScreenProps = {
    handleNavigation: (path: string) => void;
};

type ConnectionTabs = 'requests' | 'active';

const NodeConnectionsScreen: React.FC<NodeConnectionsScreenProps> = ({ handleNavigation }) => {
    const [activeTab, setActiveTab] = useState<ConnectionTabs>('requests');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [requests, setRequests] = useState<ResearchNodeConnection[]>([]);
    const [activeConnections, setActiveConnections] = useState<ResearchNodeConnection[]>([]);
    
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalRecords: 0
    });

    useEffect(() => {
        loadData();
    }, [activeTab, pagination.currentPage, pageSize]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'requests') {
                const response = await nodeConnectionService.getAllUnapprovedPaginated(pagination.currentPage, pageSize);
                setRequests(response.data || []);
                setPagination(prev => ({
                    ...prev,
                    totalRecords: response.totalRecords || 0
                }));
            } else {
                const response = await nodeConnectionService.getActiveNodeConnectionsPaginated(pagination.currentPage, pageSize);
                setActiveConnections(response.data || []);
                setPagination(prev => ({
                    ...prev,
                    totalRecords: response.totalRecords || 0
                }));
            }
        } catch (err) {
            console.error('Failed to load connections:', err);
            setError(err instanceof Error ? err.message : 'Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: AuthorizationStatus) => {
        const styles: Record<string, string> = {
            [AuthorizationStatus.AUTHORIZED]: 'bg-green-100 text-green-800',
            [AuthorizationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [AuthorizationStatus.REVOKED]: 'bg-red-100 text-red-800',
            [AuthorizationStatus.UNKNOWN]: 'bg-gray-100 text-gray-800',
        };
        
        const labels: Record<string, string> = {
            [AuthorizationStatus.AUTHORIZED]: 'Autorizado',
            [AuthorizationStatus.PENDING]: 'Pendente',
            [AuthorizationStatus.REVOKED]: 'Revogado',
            [AuthorizationStatus.UNKNOWN]: 'Desconhecido',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles[AuthorizationStatus.UNKNOWN]}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getAccessLevelBadge = (level: NodeAccessLevel) => {
        const styles: Record<string, string> = {
            [NodeAccessLevel.PUBLIC]: 'bg-blue-100 text-blue-800',
            [NodeAccessLevel.PRIVATE]: 'bg-purple-100 text-purple-800',
            [NodeAccessLevel.RESTRICTED]: 'bg-orange-100 text-orange-800',
        };

        const labels: Record<string, string> = {
            [NodeAccessLevel.PUBLIC]: 'Público',
            [NodeAccessLevel.PRIVATE]: 'Privado',
            [NodeAccessLevel.RESTRICTED]: 'Restrito',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level] || 'bg-gray-100 text-gray-800'}`}>
                {labels[level] || level}
            </span>
        );
    };

    const columns: DataTableColumn<ResearchNodeConnection>[] = useMemo(() => [
        {
            id: 'nodeName',
            label: 'Nome do Nó',
            accessor: 'nodeName',
            sortable: true,
            width: '25%',
        },
        {
            id: 'nodeUrl',
            label: 'URL',
            accessor: 'nodeUrl',
            sortable: true,
            width: '30%',
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            width: '15%',
            render: (value) => getStatusBadge(value as AuthorizationStatus),
        },
        {
            id: 'nodeAccessLevel',
            label: 'Acesso',
            accessor: 'nodeAccessLevel',
            sortable: true,
            width: '15%',
            render: (value) => getAccessLevelBadge(value as NodeAccessLevel),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            width: '15%',
            align: 'center',
            render: (_, connection) => (
                <div className="flex justify-center gap-2">
                    <button
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Visualizar detalhes"
                        onClick={() => console.log('View details', connection)}
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    {connection.status === AuthorizationStatus.PENDING && (
                        <>
                            <button
                                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                                title="Aprovar"
                                onClick={() => console.log('Approve', connection)}
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Rejeitar"
                                onClick={() => console.log('Reject', connection)}
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ], []);

    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'requests',
            label: 'Solicitações',
            title: 'Solicitações de Conexão',
            data: requests,
            columns: columns,
        },
        {
            value: 'active',
            label: 'Conexões Ativas',
            title: 'Conexões Ativas',
            data: activeConnections,
            columns: columns,
        },
    ], [requests, activeConnections, columns]);

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/nodeConnections',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Conexões',
                showUserMenu: true
            }}
        >
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                        {error}
                        <button 
                            onClick={loadData}
                            className="ml-4 text-sm underline hover:text-red-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                <TabbedTable
                    tabs={tabs}
                    selectedTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab as ConnectionTabs);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                    loading={loading}
                    emptyMessage="Nenhuma conexão encontrada."
                    striped
                    hoverable
                />

                {!loading && pagination.totalRecords > pageSize && (
                    <Pagination
                        pagination={pagination}
                        setPagination={setPagination}
                        pageSize={pageSize}
                    />
                )}
            </div>
        </AppLayout>
    );
}

export default NodeConnectionsScreen;