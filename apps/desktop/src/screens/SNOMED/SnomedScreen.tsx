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
                onClinicalEventAdd={() => handleNavigation('/snomed/clinical-event/add')}
                onClinicalEventEdit={(event) => console.log('Edit clinical event:', event)}
                onClinicalEventView={(event) => console.log('View clinical event:', event)}
                onMedicationAdd={() => handleNavigation('/snomed/medication/add')}
                onMedicationEdit={(medication) => console.log('Edit medication:', medication)}
                onMedicationView={(medication) => console.log('View medication:', medication)}
                onAllergyIntoleranceAdd={() => handleNavigation('/snomed/allergy-intolerance/add')}
                onAllergyIntoleranceEdit={(allergy) => console.log('Edit allergy:', allergy)}
                onAllergyIntoleranceView={(allergy) => console.log('View allergy:', allergy)}
            />
        </AppLayout>
    );
};

export default SNOMEDScreen;