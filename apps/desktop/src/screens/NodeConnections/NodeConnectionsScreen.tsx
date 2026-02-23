import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "@/design-system/components/app-layout";
import { TabbedTable, TabbedTableTab } from "@/design-system/components/tabbed-table";
import { DataTableColumn } from "@/design-system/components/data-table/DataTable.types";
import { ResearchNodeConnection, AuthorizationStatus, NodeAccessLevel, SyncPreviewResponse } from "@iris/domain";
import { nodeConnectionService, nodeSyncServiceAdapter } from "@/services/middleware";
import { CheckCircleIcon, XCircleIcon, EyeIcon, PencilSquareIcon, ArrowPathIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/design-system/components/button/Button";
import Pagination from '@/design-system/components/pagination/Pagination';
import Modal from "@/design-system/components/modal/Modal";
import SyncProgressModal from "./SyncProgressModal";
import '@/styles/shared/List.css';

type NodeConnectionsScreenProps = {
    handleNavigation: (path: string) => void;
    onSelectConnection?: (connection: ResearchNodeConnection) => void;
};

type ConnectionTabs = 'active' | 'requests';

function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const NodeConnectionsScreen: React.FC<NodeConnectionsScreenProps> = ({ handleNavigation, onSelectConnection }) => {
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

    // Sync state
    const [syncConnection, setSyncConnection] = useState<ResearchNodeConnection | null>(null);
    const [isSyncing, setIsSyncing] = useState<string | null>(null); // connection ID currently syncing

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

    const handleOpenSync = (connection: ResearchNodeConnection) => {
        if (connection.nodeAccessLevel === NodeAccessLevel.READ_ONLY) {
            setError('Sync requires ReadWrite access. This connection is ReadOnly.');
            return;
        }
        if (connection.status !== AuthorizationStatus.AUTHORIZED) {
            setError('Sync is only available for Authorized connections.');
            return;
        }
        if (isSyncing) {
            setError('A sync is already in progress. Please wait for it to finish.');
            return;
        }
        setSyncConnection(connection);
        setIsSyncing(connection.id);
    };

    const handleSyncClose = useCallback((syncCompleted: boolean) => {
        setSyncConnection(null);
        setIsSyncing(null);
        if (syncCompleted) {
            // Refresh connections to show updated lastSyncedAt
            loadData();
        }
    }, []);

    const handleStartSync = useCallback(
        async (): Promise<SyncPreviewResponse> => {
            if (!syncConnection) {
                throw new Error('No connection selected for sync');
            }
            return nodeSyncServiceAdapter.preview(syncConnection);
        },
        [syncConnection]
    );

    const handleExecutePull = useCallback(
        async (since?: string) => {
            if (!syncConnection) {
                throw new Error('No connection selected for sync');
            }
            return nodeSyncServiceAdapter.pull(syncConnection, since);
        },
        [syncConnection]
    );

    const handleViewConnection = (connection: ResearchNodeConnection) => {
        onSelectConnection?.(connection);
        handleNavigation(`/nodeConnections/view/${connection.id}`);
    };

    const handleEditConnection = (connection: ResearchNodeConnection) => {
        onSelectConnection?.(connection);
        handleNavigation(`/nodeConnections/edit/${connection.id}`);
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
            [NodeAccessLevel.READ_ONLY]: 'bg-blue-100 text-blue-800',
            [NodeAccessLevel.READ_WRITE]: 'bg-purple-100 text-purple-800',
            [NodeAccessLevel.ADMIN]: 'bg-orange-100 text-orange-800',
        };

        const labels: Record<string, string> = {
            [NodeAccessLevel.READ_ONLY]: 'Somente Leitura',
            [NodeAccessLevel.READ_WRITE]: 'Leitura e Escrita',
            [NodeAccessLevel.ADMIN]: 'Administrador',
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

    const getSyncStatusBadge = (connection: ResearchNodeConnection) => {
        const { lastSyncedAt, lastSyncStatus } = connection;

        if (!lastSyncedAt) {
            return (
                <span
                    title="No sync recorded"
                    className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                    Never
                </span>
            );
        }

        const date = new Date(lastSyncedAt);
        const relativeLabel = formatRelativeTime(date);
        const absoluteLabel = date.toISOString();

        const isSuccess = lastSyncStatus === 'completed';
        const colorClass = isSuccess
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
        const statusLabel = isSuccess ? 'Synced' : 'Failed';

        return (
            <span
                title={absoluteLabel}
                className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
            >
                {statusLabel} {relativeLabel}
            </span>
        );
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
            id: 'lastSync',
            label: 'Last Sync',
            accessor: 'id',
            render: (_, connection) => getSyncStatusBadge(connection),
        },
        {
            id: 'actions',
            label: 'Ações',
            accessor: 'id',
            align: 'center',
            render: (_, connection) => {
                const canSync =
                    connection.status === AuthorizationStatus.AUTHORIZED &&
                    connection.nodeAccessLevel !== NodeAccessLevel.READ_ONLY;
                const syncInProgress = isSyncing === connection.id;

                return (
                    <div className="list-actions">
                        <button
                            className="action-button view"
                            title="Visualizar detalhes"
                            onClick={() => handleViewConnection(connection)}
                        >
                            <EyeIcon />
                        </button>
                        <button
                            className="action-button edit"
                            title="Editar"
                            onClick={() => handleEditConnection(connection)}
                        >
                            <PencilSquareIcon />
                        </button>
                        <button
                            className="action-button view"
                            title={canSync ? 'Sincronizar' : 'Sync requires ReadWrite access on an Authorized connection'}
                            onClick={() => canSync && !isSyncing ? handleOpenSync(connection) : undefined}
                            disabled={!canSync || !!isSyncing}
                            style={{
                                opacity: (!canSync || !!isSyncing) ? 0.4 : 1,
                                cursor: (!canSync || !!isSyncing) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <ArrowPathIcon style={syncInProgress ? { animation: 'spin 1s linear infinite' } : undefined} />
                        </button>
                    </div>
                );
            },
        },
    ], [handleViewConnection, handleEditConnection, handleOpenSync, isSyncing, getSyncStatusBadge]);

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
                <div className="list-actions">
                    <button
                        className="action-button view"
                        title="Visualizar detalhes"
                        onClick={() => handleViewConnection(connection)}
                    >
                        <EyeIcon />
                    </button>
                    <button
                        className="action-button edit"
                        title="Editar"
                        onClick={() => handleEditConnection(connection)}
                    >
                        <PencilSquareIcon />
                    </button>
                    <button
                        className="action-button"
                        title="Aceitar solicitação"
                        onClick={() => handleOpenRequestModal(connection)}
                        style={{ color: '#16a34a' }}
                    >
                        <CheckCircleIcon />
                    </button>
                </div>
            ),
        },
    ], [handleViewConnection, handleEditConnection, handleOpenRequestModal]);

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
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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

            {/* Sync progress modal */}
            {syncConnection && (
                <SyncProgressModal
                    isOpen={!!syncConnection}
                    connection={syncConnection}
                    onClose={handleSyncClose}
                    onStartSync={handleStartSync}
                    onExecutePull={handleExecutePull}
                />
            )}

            {/* Connection Request Approval Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={handleCloseRequestModal}
                title="Solicitação de conexão do Nó"
                size="medium"
            >
                {selectedConnection && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ color: '#2C3131', fontSize: '16px', marginBottom: '12px' }}>
                            Você autoriza a conexão do Nó {selectedConnection.nodeName}?
                        </p>
                        <p style={{ color: '#2C3131', fontSize: '16px'}}>
                            <strong>URL do Nó:</strong> {selectedConnection.nodeUrl}
                        </p >
                        <p style={{ color: '#2C3131', fontSize: '16px', marginBottom: '24px'}}>
                            <strong>Nível de Acesso:</strong> {getAccessLevelBadge(selectedConnection.nodeAccessLevel)}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <Button
                                variant="primary"
                                onClick={handleAcceptConnection}
                                icon={<CheckCircleIcon />}
                                iconPosition="left"
                            >
                                Aceitar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRejectConnection}
                                icon={<XCircleIcon />}
                                iconPosition="left"
                            >
                                Rejeitar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}

export default NodeConnectionsScreen;