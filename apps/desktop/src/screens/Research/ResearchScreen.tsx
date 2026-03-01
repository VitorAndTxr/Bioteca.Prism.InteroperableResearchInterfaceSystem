/**
 * ResearchScreen Component
 *
 * Main screen for displaying and managing research projects.
 * Uses the ResearchService to fetch paginated data from the IRN backend.
 */

import { useState, useCallback } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import ResearchList from './ResearchList';
import { ToastContainer, type ToastMessage } from '../../design-system/components/toast/Toast';
import { mainMenuItems } from '../../config/menu';
import { researchService } from '../../services/middleware';
import type { Research } from '@iris/domain';

interface ResearchScreenProps {
    handleNavigation: (path: string) => void;
    onSelectResearch?: (research: Research) => void;
}

function ResearchScreen({ handleNavigation, onSelectResearch }: ResearchScreenProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, variant: ToastMessage['variant']) => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, message, variant }]);
    }, []);

    const handleResearchExport = useCallback(async (research: Research) => {
        try {
            const { buffer, filename } = await researchService.exportResearchData(research.id);

            if (window.electron?.saveExport) {
                const result = await window.electron.saveExport(buffer, filename);
                if (result.cancelled) return;
                if (result.error) {
                    addToast(`Falha na exportação: ${result.error}`, 'error');
                    return;
                }
                addToast(`Exportação concluída: ${result.filePath ?? filename}`, 'success');
            } else {
                // Browser fallback: trigger download via Blob URL
                const blob = new Blob([buffer], { type: 'application/zip' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addToast(`Exportação concluída: ${filename}`, 'success');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            addToast(`Falha na exportação: ${message}`, 'error');
        }
    }, [addToast]);

    return (
        <>
            <AppLayout
                sidebar={{
                    items: mainMenuItems,
                    activePath: '/research',
                    onNavigate: handleNavigation,
                    logo: 'I.R.I.S.',
                }}
                header={{
                    title: 'Projetos de Pesquisa',
                    showUserMenu: true
                }}
            >
                <ResearchList
                    onResearchAdd={() => handleNavigation('/research/add')}
                    onResearchEdit={(research) => {
                        onSelectResearch?.(research);
                        handleNavigation(`/research/edit/${research.id}`);
                    }}
                    onResearchView={(research) => {
                        onSelectResearch?.(research);
                        handleNavigation(`/research/view/${research.id}`);
                    }}
                    onResearchExport={handleResearchExport}
                />
            </AppLayout>
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}

export default ResearchScreen;
