/**
 * ResearchScreen Component
 *
 * Main screen for displaying and managing research projects.
 * Uses the ResearchService to fetch paginated data from the IRN backend.
 */

import { AppLayout } from '../../design-system/components/app-layout';
import ResearchList from './ResearchList';
import { mainMenuItems } from '../../config/menu';
import type { Research } from '@iris/domain';

interface ResearchScreenProps {
    handleNavigation: (path: string) => void;
    onSelectResearch?: (research: Research) => void;
}

function ResearchScreen({ handleNavigation, onSelectResearch }: ResearchScreenProps) {
    return (
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
                onResearchView={(research) => handleNavigation(`/research/view/${research.id}`)}
            />
        </AppLayout>
    );
}

export default ResearchScreen;
