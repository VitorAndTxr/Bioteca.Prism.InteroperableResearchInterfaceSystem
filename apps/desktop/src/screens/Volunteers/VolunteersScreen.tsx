/**
 * VolunteersScreen Component
 *
 * Main screen for displaying and managing volunteers (patients).
 * Uses the VolunteerService to fetch paginated data from the IRN backend.
 */

import { AppLayout } from '../../design-system/components/app-layout';
import VolunteersList from './VolunteersList';
import { mainMenuItems } from '../../config/menu';

interface VolunteersScreenProps {
    handleNavigation: (path: string) => void;
}

function VolunteersScreen({ handleNavigation }: VolunteersScreenProps) {
    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/volunteers',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Voluntários',
                showUserMenu: true
            }}
        >
            <VolunteersList
                onVolunteerAdd={() => handleNavigation('/volunteers/add')}
                onVolunteerEdit={(volunteer) => console.log('Edit volunteer:', volunteer)}
                onVolunteerView={(volunteer) => console.log('View volunteer:', volunteer)}
            />
        </AppLayout>
    );
}

export default VolunteersScreen;
