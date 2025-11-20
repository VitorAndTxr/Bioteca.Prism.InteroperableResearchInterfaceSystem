/**
 * ResearchDetailsScreen Component
 *
 * Displays detailed information about a specific research project.
 * This is a placeholder screen for viewing research details.
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { Research, ResearchStatus } from '@iris/domain';
import { researchService } from '../../services/middleware';

export interface ResearchDetailsScreenProps {
    handleNavigation: (path: string) => void;
    researchId: string;
}

export function ResearchDetailsScreen({ handleNavigation, researchId }: ResearchDetailsScreenProps) {
    const [research, setResearch] = useState<Research | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadResearchDetails();
    }, [researchId]);

    const loadResearchDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // For now, fetch paginated and find by ID (until getById is implemented)
            const response = await researchService.getResearchPaginated(1, 100);
            const found = response.data.find((r: Research) => r.id === researchId);

            if (found) {
                setResearch(found);
            } else {
                setError('Projeto de pesquisa não encontrado');
            }
        } catch (err) {
            console.error('Failed to load research details:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date?: Date | null) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatStatus = (status: ResearchStatus) => {
        const statusMap = {
            [ResearchStatus.ACTIVE]: 'Ativo',
            [ResearchStatus.COMPLETED]: 'Concluído',
            [ResearchStatus.SUSPENDED]: 'Suspenso',
            [ResearchStatus.ARCHIVED]: 'Arquivado',
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status: ResearchStatus) => {
        const classMap = {
            [ResearchStatus.ACTIVE]: 'status-active',
            [ResearchStatus.COMPLETED]: 'status-completed',
            [ResearchStatus.SUSPENDED]: 'status-suspended',
            [ResearchStatus.ARCHIVED]: 'status-archived',
        };
        return classMap[status] || '';
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/research',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Detalhes do Projeto',
                showUserMenu: true,
            }}
        >
            <div style={{ padding: '24px' }}>
                {/* Back button */}
                <div style={{ marginBottom: '24px' }}>
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={() => handleNavigation('/research')}
                        icon={<ArrowLeftIcon className="w-5 h-5" />}
                        iconPosition="left"
                    >
                        Voltar para Lista
                    </Button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        Carregando detalhes...
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #fcc'
                    }}>
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                {/* Research details */}
                {!loading && research && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Header with title and edit button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '24px'
                        }}>
                            <div>
                                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 600 }}>
                                    {research.title}
                                </h2>
                                <span className={`status-badge ${getStatusClass(research.status)}`}
                                    style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                    {formatStatus(research.status)}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="medium"
                                icon={<PencilIcon className="w-5 h-5" />}
                                iconPosition="left"
                                onClick={() => console.log('Edit research:', research.id)}
                            >
                                Editar
                            </Button>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                                Descrição
                            </h3>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>
                                {research.description}
                            </p>
                        </div>

                        {/* Research Node info */}
                        {research.researchNode && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                                    Nó de Pesquisa
                                </h3>
                                <div style={{
                                    backgroundColor: '#f9fafb',
                                    padding: '12px',
                                    borderRadius: '6px'
                                }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>
                                        {research.researchNode.nodeName}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                        {research.researchNode.nodeUrl}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                                    ID do Projeto
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    {research.id}
                                </p>
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                                    Data de Término
                                </h3>
                                <p style={{ margin: 0 }}>
                                    {formatDate(research.endDate)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

export default ResearchDetailsScreen;
