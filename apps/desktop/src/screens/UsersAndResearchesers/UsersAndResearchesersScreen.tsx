import { AppLayout } from "../../design-system/components/app-layout";
import UsersList from "./UsersList";
import { mainMenuItems } from "../../config/menu";

const  UsersAndResearchesersScreen: React.FC<UsersAndResearchesersScreenProps> = ({ handleNavigation }) => {
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
                            showUserMenu: false
                        }}
                    >
                        <UsersList
                            onUserAdd={() => console.log('Add user clicked')}
                            onUserEdit={(user) => console.log('Edit user:', user)}
                            onUserView={(user) => console.log('View user:', user)}
                        />
                    </AppLayout>
    );
}

type UsersAndResearchesersScreenProps = {
    handleNavigation: (path: string) => void;
};

export default UsersAndResearchesersScreen;