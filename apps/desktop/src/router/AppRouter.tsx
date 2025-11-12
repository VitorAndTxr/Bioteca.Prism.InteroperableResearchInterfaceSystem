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
import { useState, useEffect } from "react";

function AppRouter() {
    const { isAuthenticated, authState} = useAuth();
    const [version, setVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<Pages>('home');
    const [activePath, setActivePath] = useState<string>('/dashboard');

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

        // Navigate to appropriate page based on path
        switch (path) {
            case '/nodeConnections':
                setCurrentPage('node-connections');
                break;
            case '/research':
                setCurrentPage('research');
                break;
            case '/volunteers':
                setCurrentPage('volunteers');
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
                    <div>Node Connections Screen - To be implemented</div>
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
    | 'research'
    | 'volunteers'
    | 'snomed'
    | 'users'
    | 'add-user'
    | 'add-researcher'
    | 'add-body-region'
    | 'add-body-structure'
    | 'add-topographic-modifier'
    | 'add-clinical-condition';


export default AppRouter;