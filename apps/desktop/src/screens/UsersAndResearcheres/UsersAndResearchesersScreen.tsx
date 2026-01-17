import { AppLayout } from "../../design-system/components/app-layout";
import UsersList from "./UsersList";
import { mainMenuItems } from "../../config/menu";
import { User, Researcher } from "@iris/domain";

type UsersAndResearchesersScreenProps = {
    handleNavigation: (path: string) => void;
    onSelectUser?: (user: User) => void;
    onSelectResearcher?: (researcher: Researcher) => void;
};

const UsersAndResearchesersScreen: React.FC<UsersAndResearchesersScreenProps> = ({
    handleNavigation,
    onSelectUser,
    onSelectResearcher
}) => {
    const handleUserView = (user: User) => {
        onSelectUser?.(user);
        handleNavigation(`/users/view/${user.id}`);
    };

    const handleUserEdit = (user: User) => {
        onSelectUser?.(user);
        handleNavigation(`/users/edit/${user.id}`);
    };

    const handleResearcherView = (researcher: Researcher) => {
        onSelectResearcher?.(researcher);
        handleNavigation(`/researchers/view/${researcher.researcherId}`);
    };

    const handleResearcherEdit = (researcher: Researcher) => {
        onSelectResearcher?.(researcher);
        handleNavigation(`/researchers/edit/${researcher.researcherId}`);
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/users',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Usuários e Pesquisadores',
                showUserMenu: true
            }}
        >
            <UsersList
                onUserAdd={() => handleNavigation('/users/add')}
                onUserEdit={handleUserEdit}
                onUserView={handleUserView}
                onResearcherAdd={() => handleNavigation('/researchers/add')}
                onResearcherEdit={handleResearcherEdit}
                onResearcherView={handleResearcherView}
            />
        </AppLayout>
    );
};

export default UsersAndResearchesersScreen;