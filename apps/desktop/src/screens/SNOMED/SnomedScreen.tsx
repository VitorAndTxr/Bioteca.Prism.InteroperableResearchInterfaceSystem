import { mainMenuItems } from "../../config/menu";
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
                onBodyRegionEdit={(region) => console.log('Edit body region:', region)}
                onBodyRegionView={(region) => console.log('View body region:', region)}
                onBodyStructureAdd={() => handleNavigation('/snomed/body-structure/add')}
                onBodyStructureEdit={(structure) => console.log('Edit body structure:', structure)}
                onBodyStructureView={(structure) => console.log('View body structure:', structure)}
                onTopographicModifierAdd={() => handleNavigation('/snomed/topographic-modifier/add')}
                onTopographicModifierEdit={(modifier) => console.log('Edit topographic modifier:', modifier)}
                onTopographicModifierView={(modifier) => console.log('View topographic modifier:', modifier)}
                onClinicalConditionAdd={() => handleNavigation('/snomed/clinical-condition/add')}
                onClinicalConditionEdit={(condition) => console.log('Edit clinical condition:', condition)}
                onClinicalConditionView={(condition) => console.log('View clinical condition:', condition)}
            />
        </AppLayout>
    );
};

export default SNOMEDScreen;