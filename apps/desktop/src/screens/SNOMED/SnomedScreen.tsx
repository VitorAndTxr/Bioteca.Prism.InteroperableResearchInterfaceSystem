import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "../../design-system/components/app-layout";
import SNOMEDList from "./SNOMEDList";
import {
    SnomedBodyRegion,
    SnomedBodyStructure,
    SnomedTopographicalModifier,
    ClinicalCondition
} from "@iris/domain";

type SNOMEDScreenProps = {
    handleNavigation: (path: string) => void;
    onSelectBodyRegion?: (region: SnomedBodyRegion) => void;
    onSelectBodyStructure?: (structure: SnomedBodyStructure) => void;
    onSelectTopographicModifier?: (modifier: SnomedTopographicalModifier) => void;
    onSelectClinicalCondition?: (condition: ClinicalCondition) => void;
};

const SNOMEDScreen: React.FC<SNOMEDScreenProps> = ({
    handleNavigation,
    onSelectBodyRegion,
    onSelectBodyStructure,
    onSelectTopographicModifier,
    onSelectClinicalCondition
}) => {
    // Body Region handlers
    const handleBodyRegionView = (region: SnomedBodyRegion) => {
        onSelectBodyRegion?.(region);
        handleNavigation(`/snomed/body-region/view/${region.snomedCode}`);
    };
    const handleBodyRegionEdit = (region: SnomedBodyRegion) => {
        onSelectBodyRegion?.(region);
        handleNavigation(`/snomed/body-region/edit/${region.snomedCode}`);
    };

    // Body Structure handlers
    const handleBodyStructureView = (structure: SnomedBodyStructure) => {
        onSelectBodyStructure?.(structure);
        handleNavigation(`/snomed/body-structure/view/${structure.snomedCode}`);
    };
    const handleBodyStructureEdit = (structure: SnomedBodyStructure) => {
        onSelectBodyStructure?.(structure);
        handleNavigation(`/snomed/body-structure/edit/${structure.snomedCode}`);
    };

    // Topographic Modifier handlers
    const handleTopographicModifierView = (modifier: SnomedTopographicalModifier) => {
        onSelectTopographicModifier?.(modifier);
        handleNavigation(`/snomed/topographic-modifier/view/${modifier.snomedCode}`);
    };
    const handleTopographicModifierEdit = (modifier: SnomedTopographicalModifier) => {
        onSelectTopographicModifier?.(modifier);
        handleNavigation(`/snomed/topographic-modifier/edit/${modifier.snomedCode}`);
    };

    // Clinical Condition handlers
    const handleClinicalConditionView = (condition: ClinicalCondition) => {
        onSelectClinicalCondition?.(condition);
        handleNavigation(`/snomed/clinical-condition/view/${condition.snomedCode}`);
    };
    const handleClinicalConditionEdit = (condition: ClinicalCondition) => {
        onSelectClinicalCondition?.(condition);
        handleNavigation(`/snomed/clinical-condition/edit/${condition.snomedCode}`);
    };

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
                onBodyRegionView={handleBodyRegionView}
                onBodyRegionEdit={handleBodyRegionEdit}
                onBodyStructureAdd={() => handleNavigation('/snomed/body-structure/add')}
                onBodyStructureView={handleBodyStructureView}
                onBodyStructureEdit={handleBodyStructureEdit}
                onTopographicModifierAdd={() => handleNavigation('/snomed/topographic-modifier/add')}
                onTopographicModifierView={handleTopographicModifierView}
                onTopographicModifierEdit={handleTopographicModifierEdit}
                onClinicalConditionAdd={() => handleNavigation('/snomed/clinical-condition/add')}
                onClinicalConditionView={handleClinicalConditionView}
                onClinicalConditionEdit={handleClinicalConditionEdit}
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