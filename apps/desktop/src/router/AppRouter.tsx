import { useAuth } from "@/context";
import HomeScreen from "@/screens/Home/HomeScreen";
import Login from "@/screens/Login/Login";
import AddBodyRegionForm from "@/screens/SNOMED/AddBodyRegionForm";
import AddBodyStructureForm from "@/screens/SNOMED/AddBodyStructureForm";
import AddClinicalConditionForm from "@/screens/SNOMED/AddClinicalConditionForm";
import AddClinicalEventForm from "@/screens/SNOMED/AddClinicalEventForm";
import AddMedicationForm from "@/screens/SNOMED/AddMedicationForm";
import AddTopographicModifierForm from "@/screens/SNOMED/AddTopographicModifierForm";
import SNOMEDScreen from "@/screens/SNOMED/SnomedScreen";
import AddResearcherForm from "@/screens/UsersAndResearcheres/AddResearcherForm";
import AddUserForm from "@/screens/UsersAndResearcheres/AddUserForm";
import UsersAndResearchesersScreen from "@/screens/UsersAndResearcheres/UsersAndResearchesersScreen";
import ResearchScreen from "@/screens/Research/ResearchScreen";
import CreateResearchForm from "@/screens/Research/CreateResearchForm";
import ResearchDetailsScreen from "@/screens/Research/ResearchDetailsScreen";
import VolunteersScreen from "@/screens/Volunteers/VolunteersScreen";
import CreateVolunteerForm from "@/screens/Volunteers/CreateVolunteerForm";
import VolunteerForm from "@/screens/Volunteers/VolunteerForm";
import CreateApplicationForm from "@/screens/Research/CreateApplicationForm";
import CreateDeviceForm from "@/screens/Research/CreateDeviceForm";
import CreateSensorForm from "@/screens/Research/CreateSensorForm";
import ResearcherSelectionScreen from "@/screens/Research/ResearcherSelectionScreen";
import NodeConnectionsScreen from "@/screens/NodeConnections/NodeConnectionsScreen";
import AddConnectionForm from "@/screens/NodeConnections/AddConnectionForm";
import AddAllergyIntoleranceForm from "@/screens/SNOMED/AddAllergyIntoleranceForm";
import {
    ResearchNodeConnection,
    Research,
    User,
    Researcher,
    Volunteer,
    SnomedBodyRegion,
    SnomedBodyStructure,
    SnomedTopographicalModifier,
    ClinicalCondition,
    SnomedClinicalEvent,
    SnomedMedication,
    SnomedAllergyIntolerance
} from "@iris/domain";
import { useState, useEffect } from "react";

function AppRouter() {
    const { isAuthenticated, authState} = useAuth();
    const [version, setVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<Pages>('home');
    const [activePath, setActivePath] = useState<string>('/dashboard');

    const [selectedResearchId, setSelectedResearchId] = useState<string>('');
    const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<ResearchNodeConnection | null>(null);

    // User and Researcher selection states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);

    // Volunteer selection state
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

    // SNOMED selection states
    const [selectedBodyRegion, setSelectedBodyRegion] = useState<SnomedBodyRegion | null>(null);
    const [selectedBodyStructure, setSelectedBodyStructure] = useState<SnomedBodyStructure | null>(null);
    const [selectedTopographicModifier, setSelectedTopographicModifier] = useState<SnomedTopographicalModifier | null>(null);
    const [selectedClinicalCondition, setSelectedClinicalCondition] = useState<ClinicalCondition | null>(null);
    const [selectedClinicalEvent, setSelectedClinicalEvent] = useState<SnomedClinicalEvent | null>(null);
    const [selectedMedication, setSelectedMedication] = useState<SnomedMedication | null>(null);
    const [selectedAllergyIntolerance, setSelectedAllergyIntolerance] = useState<SnomedAllergyIntolerance | null>(null);

    useEffect(() => {
        // Get app version from Electron
        if (window.electron) {
            window.electron.app.getVersion().then(setVersion);
        }
    }, []);

    // Show login screen if not authenticated
    if (!isAuthenticated && authState !== 'loading') {
        return <Login />;
    }

    // Show loading state while checking authentication
    if (authState === 'loading') {
        return (
            <div className="app-loading">
                <div className="loading-spinner" />
                <p>Carregando...</p>
            </div>
        );
    }

    const handleNavigation = (path: string) => {
        setActivePath(path);

        // Handle dynamic routes with parameters first
        if (path.startsWith('/research/edit/')) {
            const id = path.replace('/research/edit/', '');
            setSelectedResearchId(id);
            setCurrentPage('edit-research');
            return;
        }

        if (path.startsWith('/research/view/')) {
            const id = path.replace('/research/view/', '');
            setSelectedResearchId(id);
            setCurrentPage('view-research');
            return;
        }

        if (path.startsWith('/research/add-researcher/')) {
            const id = path.replace('/research/add-researcher/', '');
            setSelectedResearchId(id);
            setCurrentPage('add-researcher-to-research');
            return;
        }

        if (path.startsWith('/research/add-application/')) {
            const id = path.replace('/research/add-application/', '');
            setSelectedResearchId(id);
            setCurrentPage('add-application');
            return;
        }

        if (path.startsWith('/research/add-device/')) {
            const id = path.replace('/research/add-device/', '');
            setSelectedResearchId(id);
            setCurrentPage('add-device');
            return;
        }

        if (path.startsWith('/research/add-sensor/')) {
            const id = path.replace('/research/add-sensor/', '');
            setSelectedResearchId(id);
            setCurrentPage('add-sensor');
            return;
        }

        if (path.startsWith('/nodeConnections/view/')) {
            setCurrentPage('view-connection');
            return;
        }

        if (path.startsWith('/nodeConnections/edit/')) {
            setCurrentPage('edit-connection');
            return;
        }

        // User routes
        if (path.startsWith('/users/view/')) {
            setCurrentPage('view-user');
            return;
        }
        if (path.startsWith('/users/edit/')) {
            setCurrentPage('edit-user');
            return;
        }

        // Volunteer routes
        if (path.startsWith('/volunteers/view/')) {
            setCurrentPage('view-volunteer');
            return;
        }
        if (path.startsWith('/volunteers/edit/')) {
            setCurrentPage('edit-volunteer');
            return;
        }

        // Researcher routes
        if (path.startsWith('/researchers/view/')) {
            setCurrentPage('view-researcher');
            return;
        }
        if (path.startsWith('/researchers/edit/')) {
            setCurrentPage('edit-researcher');
            return;
        }

        // SNOMED Body Region routes
        if (path.startsWith('/snomed/body-region/view/')) {
            setCurrentPage('view-body-region');
            return;
        }
        if (path.startsWith('/snomed/body-region/edit/')) {
            setCurrentPage('edit-body-region');
            return;
        }

        // SNOMED Body Structure routes
        if (path.startsWith('/snomed/body-structure/view/')) {
            setCurrentPage('view-body-structure');
            return;
        }
        if (path.startsWith('/snomed/body-structure/edit/')) {
            setCurrentPage('edit-body-structure');
            return;
        }

        // SNOMED Topographic Modifier routes
        if (path.startsWith('/snomed/topographic-modifier/view/')) {
            setCurrentPage('view-topographic-modifier');
            return;
        }
        if (path.startsWith('/snomed/topographic-modifier/edit/')) {
            setCurrentPage('edit-topographic-modifier');
            return;
        }

        // SNOMED Clinical Condition routes
        if (path.startsWith('/snomed/clinical-condition/view/')) {
            setCurrentPage('view-clinical-condition');
            return;
        }
        if (path.startsWith('/snomed/clinical-condition/edit/')) {
            setCurrentPage('edit-clinical-condition');
            return;
        }

        // SNOMED Clinical Event routes
        if (path.startsWith('/snomed/clinical-event/view/')) {
            setCurrentPage('view-clinical-event');
            return;
        }
        if (path.startsWith('/snomed/clinical-event/edit/')) {
            setCurrentPage('edit-clinical-event');
            return;
        }

        // SNOMED Medication routes
        if (path.startsWith('/snomed/medication/view/')) {
            setCurrentPage('view-medication');
            return;
        }
        if (path.startsWith('/snomed/medication/edit/')) {
            setCurrentPage('edit-medication');
            return;
        }

        // SNOMED Allergy/Intolerance routes
        if (path.startsWith('/snomed/allergy-intolerance/view/')) {
            setCurrentPage('view-allergy-intolerance');
            return;
        }
        if (path.startsWith('/snomed/allergy-intolerance/edit/')) {
            setCurrentPage('edit-allergy-intolerance');
            return;
        }

        // Navigate to appropriate page based on path
        switch (path) {
            case '/nodeConnections':
                setCurrentPage('node-connections');
                setSelectedConnection(null);
                break;
            case '/nodeConnections/add':
                setSelectedConnection(null);
                setCurrentPage('add-connection');
                break;
            case '/research':
                setCurrentPage('research');
                break;
            case '/research/add':
                setCurrentPage('add-research');
                break;
            case '/volunteers':
                setCurrentPage('volunteers');
                setSelectedVolunteer(null);
                break;
            case '/volunteers/add':
                setCurrentPage('add-volunteer');
                break;
            case '/snomed':
                setCurrentPage('snomed');
                setSelectedBodyRegion(null);
                setSelectedBodyStructure(null);
                setSelectedTopographicModifier(null);
                setSelectedClinicalCondition(null);
                setSelectedClinicalEvent(null);
                setSelectedMedication(null);
                setSelectedAllergyIntolerance(null);
                break;
            case '/snomed/body-region/add':
                setCurrentPage('add-body-region');
                break;
            case '/snomed/body-structure/add':
                setCurrentPage('add-body-structure');
                break;
            case '/snomed/topographic-modifier/add':
                setCurrentPage('add-topographic-modifier');
                break;
            case '/snomed/clinical-condition/add':
                setCurrentPage('add-clinical-condition');
                break;
            case '/snomed/clinical-event/add':
                setCurrentPage('add-clinical-event');
                break;
            case '/snomed/medication/add':
                setCurrentPage('add-medication');
                break;
            case '/snomed/allergy-intolerance/add':
                setCurrentPage('add-allergy-intolerance');
                break;
            case '/users':
                setCurrentPage('users');
                setSelectedUser(null);
                setSelectedResearcher(null);
                break;
            case '/users/add':
                setCurrentPage('add-user');
                break;
            case '/researchers/add':
                setCurrentPage('add-researcher');
                break;
            case '/dashboard':
            default:
                setCurrentPage('home');
                break;
        }
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'node-connections':
                return (
                    <NodeConnectionsScreen
                        handleNavigation={handleNavigation}
                        onSelectConnection={setSelectedConnection}
                    />
                );
            case 'add-connection':
                return (
                    <AddConnectionForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-connection':
                return (
                    <AddConnectionForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        connection={selectedConnection ?? undefined}
                    />
                );
            case 'edit-connection':
                return (
                    <AddConnectionForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        connection={selectedConnection ?? undefined}
                    />
                );
            case 'research':
                return (
                    <ResearchScreen
                        handleNavigation={handleNavigation}
                        onSelectResearch={setSelectedResearch}
                    />
                );
            case 'add-research':
                return (
                    <CreateResearchForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'edit-research':
                return (
                    <CreateResearchForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        research={selectedResearch ?? undefined}
                    />
                );
            case 'view-research':
                return (
                    <ResearchDetailsScreen
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'add-researcher-to-research':
                return (
                    <ResearcherSelectionScreen
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'add-application':
                return (
                    <CreateApplicationForm
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'add-device':
                return (
                    <CreateDeviceForm
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'add-sensor':
                return (
                    <CreateSensorForm
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'volunteers':
                return (
                    <VolunteersScreen
                        handleNavigation={handleNavigation}
                        onSelectVolunteer={setSelectedVolunteer}
                    />
                );
            case 'add-volunteer':
                return (
                    <CreateVolunteerForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'view-volunteer':
                return (
                    <VolunteerForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        volunteer={selectedVolunteer ?? undefined}
                    />
                );
            case 'edit-volunteer':
                return (
                    <VolunteerForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        volunteer={selectedVolunteer ?? undefined}
                    />
                );
            case 'snomed':
                return (
                    <SNOMEDScreen
                        handleNavigation={handleNavigation}
                        onSelectBodyRegion={setSelectedBodyRegion}
                        onSelectBodyStructure={setSelectedBodyStructure}
                        onSelectTopographicModifier={setSelectedTopographicModifier}
                        onSelectClinicalCondition={setSelectedClinicalCondition}
                        onSelectClinicalEvent={setSelectedClinicalEvent}
                        onSelectMedication={setSelectedMedication}
                        onSelectAllergyIntolerance={setSelectedAllergyIntolerance}
                    />
                );
            case 'add-body-region':
                return (
                    <AddBodyRegionForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-body-region':
                return (
                    <AddBodyRegionForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        bodyRegion={selectedBodyRegion ?? undefined}
                    />
                );
            case 'edit-body-region':
                return (
                    <AddBodyRegionForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        bodyRegion={selectedBodyRegion ?? undefined}
                    />
                );
            case 'add-body-structure':
                return (
                    <AddBodyStructureForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-body-structure':
                return (
                    <AddBodyStructureForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        bodyStructure={selectedBodyStructure ?? undefined}
                    />
                );
            case 'edit-body-structure':
                return (
                    <AddBodyStructureForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        bodyStructure={selectedBodyStructure ?? undefined}
                    />
                );
            case 'add-topographic-modifier':
                return (
                    <AddTopographicModifierForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-topographic-modifier':
                return (
                    <AddTopographicModifierForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        topographicModifier={selectedTopographicModifier ?? undefined}
                    />
                );
            case 'edit-topographic-modifier':
                return (
                    <AddTopographicModifierForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        topographicModifier={selectedTopographicModifier ?? undefined}
                    />
                );
            case 'add-clinical-condition':
                return (
                    <AddClinicalConditionForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-clinical-condition':
                return (
                    <AddClinicalConditionForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        clinicalCondition={selectedClinicalCondition ?? undefined}
                    />
                );
            case 'edit-clinical-condition':
                return (
                    <AddClinicalConditionForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        clinicalCondition={selectedClinicalCondition ?? undefined}
                    />
                );
            case 'add-clinical-event':
                return (
                    <AddClinicalEventForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-clinical-event':
                return (
                    <AddClinicalEventForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        clinicalEvent={selectedClinicalEvent ?? undefined}
                    />
                );
            case 'edit-clinical-event':
                return (
                    <AddClinicalEventForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        clinicalEvent={selectedClinicalEvent ?? undefined}
                    />
                );
            case 'add-medication':
                return (
                    <AddMedicationForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-medication':
                return (
                    <AddMedicationForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        medication={selectedMedication ?? undefined}
                    />
                );
            case 'edit-medication':
                return (
                    <AddMedicationForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        medication={selectedMedication ?? undefined}
                    />
                );
            case 'add-allergy-intolerance':
                return (
                    <AddAllergyIntoleranceForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-allergy-intolerance':
                return (
                    <AddAllergyIntoleranceForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        allergyIntolerance={selectedAllergyIntolerance ?? undefined}
                    />
                );
            case 'edit-allergy-intolerance':
                return (
                    <AddAllergyIntoleranceForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        allergyIntolerance={selectedAllergyIntolerance ?? undefined}
                    />
                );
            case 'users':
                return (
                    <UsersAndResearchesersScreen
                        handleNavigation={handleNavigation}
                        onSelectUser={setSelectedUser}
                        onSelectResearcher={setSelectedResearcher}
                    />
                );
            case 'add-user':
                return (
                    <AddUserForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-user':
                return (
                    <AddUserForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        user={selectedUser ?? undefined}
                    />
                );
            case 'edit-user':
                return (
                    <AddUserForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        user={selectedUser ?? undefined}
                    />
                );
            case 'add-researcher':
                return (
                    <AddResearcherForm
                        handleNavigation={handleNavigation}
                        mode="add"
                    />
                );
            case 'view-researcher':
                return (
                    <AddResearcherForm
                        handleNavigation={handleNavigation}
                        mode="view"
                        researcher={selectedResearcher ?? undefined}
                    />
                );
            case 'edit-researcher':
                return (
                    <AddResearcherForm
                        handleNavigation={handleNavigation}
                        mode="edit"
                        researcher={selectedResearcher ?? undefined}
                    />
                );
            case 'home':
            default:
                return (
                    <HomeScreen
                        activePath={activePath}
                        handleNavigation={handleNavigation}
                    />
                );
        }
    };

    return renderContent();
}

type Pages =
    | 'home'
    | 'node-connections'
    | 'add-connection'
    | 'view-connection'
    | 'edit-connection'
    | 'research'
    | 'add-research'
    | 'edit-research'
    | 'view-research'
    | 'add-researcher-to-research'
    | 'add-application'
    | 'add-device'
    | 'add-sensor'
    | 'volunteers'
    | 'add-volunteer'
    | 'view-volunteer'
    | 'edit-volunteer'
    | 'snomed'
    | 'users'
    | 'add-user'
    | 'view-user'
    | 'edit-user'
    | 'add-researcher'
    | 'view-researcher'
    | 'edit-researcher'
    | 'add-body-region'
    | 'view-body-region'
    | 'edit-body-region'
    | 'add-body-structure'
    | 'view-body-structure'
    | 'edit-body-structure'
    | 'add-topographic-modifier'
    | 'view-topographic-modifier'
    | 'edit-topographic-modifier'
    | 'add-clinical-condition'
    | 'view-clinical-condition'
    | 'edit-clinical-condition'
    | 'add-clinical-event'
    | 'view-clinical-event'
    | 'edit-clinical-event'
    | 'add-medication'
    | 'view-medication'
    | 'edit-medication'
    | 'add-allergy-intolerance'
    | 'view-allergy-intolerance'
    | 'edit-allergy-intolerance';


export default AppRouter;