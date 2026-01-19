import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "../../design-system/components/app-layout";
import SNOMEDList from "./SNOMEDList";
import {
    SnomedBodyRegion,
    SnomedBodyStructure,
    SnomedTopographicalModifier,
    ClinicalCondition,
    SnomedClinicalEvent,
    SnomedMedication,
    SnomedAllergyIntolerance
} from "@iris/domain";

type SNOMEDScreenProps = {
    handleNavigation: (path: string) => void;
    onSelectBodyRegion?: (region: SnomedBodyRegion) => void;
    onSelectBodyStructure?: (structure: SnomedBodyStructure) => void;
    onSelectTopographicModifier?: (modifier: SnomedTopographicalModifier) => void;
    onSelectClinicalCondition?: (condition: ClinicalCondition) => void;
    onSelectClinicalEvent?: (event: SnomedClinicalEvent) => void;
    onSelectMedication?: (medication: SnomedMedication) => void;
    onSelectAllergyIntolerance?: (allergy: SnomedAllergyIntolerance) => void;
};

const SNOMEDScreen: React.FC<SNOMEDScreenProps> = ({
    handleNavigation,
    onSelectBodyRegion,
    onSelectBodyStructure,
    onSelectTopographicModifier,
    onSelectClinicalCondition,
    onSelectClinicalEvent,
    onSelectMedication,
    onSelectAllergyIntolerance
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

    // Clinical Event handlers
    const handleClinicalEventView = (event: SnomedClinicalEvent) => {
        onSelectClinicalEvent?.(event);
        handleNavigation(`/snomed/clinical-event/view/${event.snomedCode}`);
    };
    const handleClinicalEventEdit = (event: SnomedClinicalEvent) => {
        onSelectClinicalEvent?.(event);
        handleNavigation(`/snomed/clinical-event/edit/${event.snomedCode}`);
    };

    // Medication handlers
    const handleMedicationView = (medication: SnomedMedication) => {
        onSelectMedication?.(medication);
        handleNavigation(`/snomed/medication/view/${medication.snomedCode}`);
    };
    const handleMedicationEdit = (medication: SnomedMedication) => {
        onSelectMedication?.(medication);
        handleNavigation(`/snomed/medication/edit/${medication.snomedCode}`);
    };

    // Allergy/Intolerance handlers
    const handleAllergyIntoleranceView = (allergy: SnomedAllergyIntolerance) => {
        onSelectAllergyIntolerance?.(allergy);
        handleNavigation(`/snomed/allergy-intolerance/view/${allergy.snomedCode}`);
    };
    const handleAllergyIntoleranceEdit = (allergy: SnomedAllergyIntolerance) => {
        onSelectAllergyIntolerance?.(allergy);
        handleNavigation(`/snomed/allergy-intolerance/edit/${allergy.snomedCode}`);
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
                onClinicalEventEdit={handleClinicalEventEdit}
                onClinicalEventView={handleClinicalEventView}
                onMedicationAdd={() => handleNavigation('/snomed/medication/add')}
                onMedicationEdit={handleMedicationEdit}
                onMedicationView={handleMedicationView}
                onAllergyIntoleranceAdd={() => handleNavigation('/snomed/allergy-intolerance/add')}
                onAllergyIntoleranceEdit={handleAllergyIntoleranceEdit}
                onAllergyIntoleranceView={handleAllergyIntoleranceView}
            />
        </AppLayout>
    );
};

export default SNOMEDScreen;
