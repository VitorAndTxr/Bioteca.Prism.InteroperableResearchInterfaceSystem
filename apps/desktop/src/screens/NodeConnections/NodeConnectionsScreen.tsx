import React, { useEffect, useMemo, useState } from 'react';
import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "@/design-system/components/app-layout";
import { TabbedTable, TabbedTableTab } from "@/design-system/components/tabbed-table";
import { DataTableColumn } from "@/design-system/components/data-table/DataTable.types";
import { ResearchNodeConnection, AuthorizationStatus, NodeAccessLevel } from "@iris/domain";
import { nodeConnectionService } from "@/services/middleware";
import { CheckCircleIcon, XCircleIcon, EyeIcon, PencilSquareIcon, ArrowPathIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/design-system/components/button/Button";
import Pagination from '@/design-system/components/pagination/Pagination';
import Modal from "@/design-system/components/modal/Modal";

type NodeConnectionsScreenProps = {
    handleNavigation: (path: string) => void;
};

type ConnectionTabs = 'active' | 'requests';

const NodeConnectionsScreen: React.FC<NodeConnectionsScreenProps> = ({ handleNavigation }) => {
    const [activeTab, setActiveTab] = useState<ConnectionTabs>('active');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [requests, setRequests] = useState<ResearchNodeConnection[]>([]);
    const [activeConnections, setActiveConnections] = useState<ResearchNodeConnection[]>([]);

    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalRecords: 0
    });

    // Modal state for connection request approval
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<ResearchNodeConnection | null>(null);

    const handleOpenRequestModal = (connection: ResearchNodeConnection) => {
        setSelectedConnection(connection);
        setShowRequestModal(true);
    };

    const handleCloseRequestModal = () => {
        setShowRequestModal(false);
        setSelectedConnection(null);
    };

    const handleAcceptConnection = async () => {
        if (!selectedConnection) return;
        try {
            await nodeConnectionService.approveConnection(selectedConnection.id);
            handleCloseRequestModal();
            loadData();
        } catch (err) {
            console.error('Failed to accept connection:', err);
            setError(err instanceof Error ? err.message : 'Failed to accept connection');
        }
    };

    const handleRejectConnection = async () => {
        if (!selectedConnection) return;
        try {
            await nodeConnectionService.rejectConnection(selectedConnection.id);
            handleCloseRequestModal();
            loadData();
        } catch (err) {
            console.error('Failed to reject connection:', err);
            setError(err instanceof Error ? err.message : 'Failed to reject connection');
        }
    };

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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    const activeColumns: DataTableColumn<ResearchNodeConnection>[] = useMemo(() => [
        {
            id: 'nodeName',
            label: 'Nome',
            accessor: 'nodeName',
            sortable: true,
        },
        {
            id: 'nodeUrl',
            label: 'URL',
            accessor: 'nodeUrl',
            sortable: true,
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            render: (value) => getStatusBadge(value as AuthorizationStatus),
        },
        {
            id: 'nodeAccessLevel',
            label: 'Nível de acesso',
            accessor: 'nodeAccessLevel',
            sortable: true,
            render: (value) => getAccessLevelBadge(value as NodeAccessLevel),
        },
        {
            id: 'registeredAt',
            label: 'Data registro',
            accessor: 'registeredAt',
            sortable: true,
            render: (value) => formatDate(value as Date),
        },
        {
            id: 'updatedAt',
            label: 'Última alteração',
            accessor: 'updatedAt',
            sortable: true,
            render: (value) => formatDate(value as Date),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            align: 'center',
            render: (_, connection) => (
                <div className="flex justify-center gap-3">
                    <button
                        className="p-1 text-[#393939] hover:text-[#49A2A8] transition-colors"
                        title="Visualizar detalhes"
                        onClick={() => console.log('View details', connection)}
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1 text-[#393939] hover:text-[#49A2A8] transition-colors"
                        title="Editar"
                        onClick={() => console.log('Edit', connection)}
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1 text-[#393939] hover:text-[#49A2A8] transition-colors"
                        title="Sincronizar"
                        onClick={() => console.log('Sync', connection)}
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    const requestColumns: DataTableColumn<ResearchNodeConnection>[] = useMemo(() => [
        {
            id: 'nodeName',
            label: 'Nome',
            accessor: 'nodeName',
            sortable: true,
        },
        {
            id: 'nodeUrl',
            label: 'URL',
            accessor: 'nodeUrl',
            sortable: true,
        },
        {
            id: 'status',
            label: 'Status',
            accessor: 'status',
            sortable: true,
            render: (value) => getStatusBadge(value as AuthorizationStatus),
        },
        {
            id: 'nodeAccessLevel',
            label: 'Nível de acesso',
            accessor: 'nodeAccessLevel',
            sortable: true,
            render: (value) => getAccessLevelBadge(value as NodeAccessLevel),
        },
        {
            id: 'registeredAt',
            label: 'Data registro',
            accessor: 'registeredAt',
            sortable: true,
            render: (value) => formatDate(value as Date),
        },
        {
            id: 'updatedAt',
            label: 'Última alteração',
            accessor: 'updatedAt',
            sortable: true,
            render: (value) => formatDate(value as Date),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            align: 'center',
            render: (_, connection) => (
                <div className="flex justify-center gap-3">
                    <button
                        className="p-1 text-[#393939] hover:text-[#49A2A8] transition-colors"
                        title="Visualizar detalhes"
                        onClick={() => console.log('View details', connection)}
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1 text-[#393939] hover:text-[#49A2A8] transition-colors"
                        title="Editar"
                        onClick={() => console.log('Edit', connection)}
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="Aceitar solicitação"
                        onClick={() => handleOpenRequestModal(connection)}
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Rejeitar solicitação"
                        onClick={() => handleOpenRequestModal(connection)}
                    >
                        <XCircleIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], [handleOpenRequestModal]);

    const tabs: TabbedTableTab[] = useMemo(() => [
        {
            value: 'active',
            label: 'Todas as conexões',
            title: 'Conexões ativas',
            data: activeConnections,
            columns: activeColumns,
            action: {
                label: 'Adicionar',
                onClick: () => handleNavigation('/nodeConnections/add'),
                icon: <PlusCircleIcon className="w-5 h-5" />,
                variant: 'outline',
            },
        },
        {
            value: 'requests',
            label: 'Solicitações',
            title: 'Solicitações',
            data: requests,
            columns: requestColumns,
        },
    ], [requests, activeConnections, activeColumns, requestColumns, handleNavigation]);

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

            {/* Connection Request Approval Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={handleCloseRequestModal}
                title="Solicitação de Conexão"
                size="small"
            >
                {selectedConnection && (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Deseja aceitar ou rejeitar a solicitação de conexão de <strong>{selectedConnection.nodeName}</strong>?
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="text-sm text-gray-600">
                                <p><strong>URL:</strong> {selectedConnection.nodeUrl}</p>
                                <p><strong>Nível de acesso:</strong> {selectedConnection.nodeAccessLevel}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={handleCloseRequestModal}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleRejectConnection}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <XCircleIcon className="w-4 h-4 mr-2" />
                                Rejeitar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAcceptConnection}
                            >
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Aceitar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}

export default NodeConnectionsScreen;