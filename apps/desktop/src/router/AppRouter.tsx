import { useAuth } from "@/context";
import HomeScreen from "@/screens/Home/HomeScreen";
import Login from "@/screens/Login/Login";
import AddBodyRegionForm from "@/screens/SNOMED/AddBodyRegionForm";
import AddBodyStructureForm from "@/screens/SNOMED/AddBodyStructureForm";
import AddClinicalConditionForm from "@/screens/SNOMED/AddClinicalConditionForm";
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
import NodeConnectionsScreen from "@/screens/NodeConnections/NodeConnectionsScreen";
import AddConnectionForm from "@/screens/NodeConnections/AddConnectionForm";
import { useState, useEffect } from "react";

function AppRouter() {
    const { isAuthenticated, authState} = useAuth();
    const [version, setVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<Pages>('home');
    const [activePath, setActivePath] = useState<string>('/dashboard');
    const [selectedResearchId, setSelectedResearchId] = useState<string>('');

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
        if (path.startsWith('/research/view/')) {
            const id = path.replace('/research/view/', '');
            setSelectedResearchId(id);
            setCurrentPage('view-research');
            return;
        }

        // Navigate to appropriate page based on path
        switch (path) {
            case '/nodeConnections':
                setCurrentPage('node-connections');
                break;
            case '/nodeConnections/add':
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
                break;
            case '/volunteers/add':
                setCurrentPage('add-volunteer');
                break;
            case '/snomed':
                setCurrentPage('snomed');
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
            case '/users':
                setCurrentPage('users');
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
                    />
                );
            case 'add-connection':
                return (
                    <AddConnectionForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'research':
                return (
                    <ResearchScreen
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-research':
                return (
                    <CreateResearchForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'view-research':
                return (
                    <ResearchDetailsScreen
                        handleNavigation={handleNavigation}
                        researchId={selectedResearchId}
                    />
                );
            case 'volunteers':
                return (
                    <VolunteersScreen
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-volunteer':
                return (
                    <CreateVolunteerForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'snomed':
                return (
                    <SNOMEDScreen
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-body-region':
                return (
                    <AddBodyRegionForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-body-structure':
                return (
                    <AddBodyStructureForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-topographic-modifier':
                return (
                    <AddTopographicModifierForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-clinical-condition':
                return (
                    <AddClinicalConditionForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'users':
                return (
                    <UsersAndResearchesersScreen
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-user':
                return (
                    <AddUserForm
                        handleNavigation={handleNavigation}
                    />
                );
            case 'add-researcher':
                return (
                    <AddResearcherForm
                        handleNavigation={handleNavigation}
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
    | 'research'
    | 'add-research'
    | 'view-research'
    | 'volunteers'
    | 'add-volunteer'
    | 'snomed'
    | 'users'
    | 'add-user'
    | 'add-researcher'
    | 'add-body-region'
    | 'add-body-structure'
    | 'add-topographic-modifier'
    | 'add-clinical-condition';


export default AppRouter;