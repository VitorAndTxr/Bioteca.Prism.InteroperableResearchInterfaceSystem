import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "../../design-system/components/app-layout";
import SNOMEDList from "./SNOMEDList";

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
                showUserMenu: true
            }}
        >
            <SNOMEDList
                onBodyRegionAdd={() => handleNavigation('/snomed/body-region/add')}
                onBodyStructureAdd={() => handleNavigation('/snomed/body-structure/add')}
                onTopographicModifierAdd={() => handleNavigation('/snomed/topographic-modifier/add')}
                onClinicalConditionAdd={() => handleNavigation('/snomed/clinical-condition/add')}
                onClinicalConditionEdit={(condition) => console.log('Edit clinical condition:', condition)}
                onClinicalConditionView={(condition) => console.log('View clinical condition:', condition)}
            />
        </AppLayout>
    );
};

export default SNOMEDScreen;