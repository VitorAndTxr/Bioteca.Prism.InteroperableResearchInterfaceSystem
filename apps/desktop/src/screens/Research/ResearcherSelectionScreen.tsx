/**
 * ResearcherSelectionScreen Component
 *
 * Full-page screen for assigning an existing researcher to a research project.
 * Provides a researcher dropdown (populated from ResearcherService) and a role dropdown.
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/design-system/components/app-layout';
import { Button } from '@/design-system/components/button';
import { Dropdown, type DropdownOption } from '@/design-system/components/dropdown';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '@/config/menu';
import { type Researcher } from '@iris/domain';
import { researcherService, researchService } from '@/services/middleware';

export interface ResearcherSelectionScreenProps {
    handleNavigation: (path: string) => void;
    researchId: string;
}

const roleOptions: DropdownOption[] = [
    { value: 'true', label: 'Pesquisador Principal' },
    { value: 'false', label: 'Pesquisador' },
];

export function ResearcherSelectionScreen({ handleNavigation, researchId }: ResearcherSelectionScreenProps) {
    const [researchers, setResearchers] = useState<Researcher[]>([]);
    const [selectedResearcherId, setSelectedResearcherId] = useState('');
    const [isPrincipal, setIsPrincipal] = useState('false');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [researchTitle, setResearchTitle] = useState('');

    useEffect(() => {
        loadData();
    }, [researchId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [researcherList, researchDetail] = await Promise.all([
                researcherService.getByNodeId(),
                researchService.getResearchById(researchId),
            ]);

            setResearchers(researcherList);
            setResearchTitle(researchDetail.title);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const researcherOptions: DropdownOption[] = researchers.map(r => ({
        value: r.researcherId,
        label: `${r.name} (${r.email})`,
    }));

    const handleSave = async () => {
        if (!selectedResearcherId) {
            setError('Selecione um pesquisador');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await researchService.addResearchResearcher(researchId, {
                researcherId: selectedResearcherId,
                isPrincipal: isPrincipal === 'true',
            });

            handleNavigation(`/research/view/${researchId}`);
        } catch (err) {
            console.error('Failed to assign researcher:', err);
            const message = err instanceof Error ? err.message : 'Erro ao atribuir pesquisador';
            if (message.toLowerCase().includes('already') || message.toLowerCase().includes('conflict')) {
                setError('Pesquisador ja atribuido a esta pesquisa');
            } else {
                setError(message);
            }
        } finally {
            setSubmitting(false);
        }
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
                title: researchTitle ? `${researchTitle} - Incluir pesquisador` : 'Incluir pesquisador',
                showUserMenu: true,
            }}
        >
            <div className="p-6 max-w-2xl">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <Dropdown
                        id="researcher-select"
                        label="Pesquisador"
                        placeholder={loading ? 'Carregando...' : 'Selecione um pesquisador'}
                        options={researcherOptions}
                        value={selectedResearcherId}
                        onChange={(val: string | string[]) => setSelectedResearcherId(val as string)}
                        disabled={loading || submitting}
                    />

                    <Dropdown
                        id="role-select"
                        label="Tipo de funcao"
                        options={roleOptions}
                        value={isPrincipal}
                        onChange={(val: string | string[]) => setIsPrincipal(val as string)}
                        disabled={submitting}
                    />

                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={() => handleNavigation(`/research/view/${researchId}`)}
                            icon={<ArrowLeftIcon className="w-5 h-5" />}
                            iconPosition="left"
                            disabled={submitting}
                        >
                            Voltar
                        </Button>

                        <Button
                            variant="primary"
                            size="big"
                            onClick={handleSave}
                            disabled={submitting || !selectedResearcherId}
                        >
                            {submitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => handleNavigation('/researchers/add')}
                        >
                            Novo pesquisador
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default ResearcherSelectionScreen;
