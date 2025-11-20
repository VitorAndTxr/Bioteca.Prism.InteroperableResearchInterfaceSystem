/**
 * ResearchScreen Component
 *
 * Main screen for displaying and managing research projects.
 * Uses the ResearchService to fetch paginated data from the IRN backend.
 */

import { AppLayout } from '../../design-system/components/app-layout';
import ResearchList from './ResearchList';
import { mainMenuItems } from '../../config/menu';

interface ResearchScreenProps {
    handleNavigation: (path: string) => void;
}

function ResearchScreen({ handleNavigation }: ResearchScreenProps) {
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
                onResearchEdit={(research) => console.log('Edit research:', research)}
                onResearchView={(research) => handleNavigation(`/research/view/${research.id}`)}
            />
        </AppLayout>
    );
}

export default ResearchScreen;
