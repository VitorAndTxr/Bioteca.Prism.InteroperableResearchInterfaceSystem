import { mainMenuItems } from "../../config/menu";
import { AppLayout } from "../../design-system/components/app-layout";

type SNOMEDScreenProps = {
    handleNavigation: (path: string) => void;
};
const SNOMEDScreen: React.FC<SNOMEDScreenProps> = ({ handleNavigation }) => {

        return (
                    <AppLayout
                        sidebar={{
                            items: mainMenuItems,
                            activePath: '/snomed',
                            onNavigate: handleNavigation,
                            logo: 'I.R.I.S.',
                        }}
                        header={{
                            title: 'SNOMED',
                            showUserMenu: false
                        }}
                    >
                        SNOMED
                    </AppLayout>
    );
};

export default SNOMEDScreen;