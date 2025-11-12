import { mainMenuItems } from "../../config/menu";
import { useAuth } from "../../context";
import { AppLayout } from "../../design-system/components/app-layout";

const HomeScreen: React.FC<HomeScreenProps> = ({ activePath, handleNavigation }) => {
    
    const { user, logout } = useAuth();
    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: activePath,
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Consultar dados',
                subtitle: 'Visualize e analise dados de pesquisa',
                showUserMenu: true
            }}
        >
            <div className="welcome-card">
                <h2>Welcome to IRIS Desktop</h2>
                <p>
                    Application management and data analysis for sEMG/FES research.
                </p>

                {/* User Info */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Logged in as: <strong>{user?.login}</strong> ({user?.role})
                    </p>
                    <button
                        onClick={logout}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: '#E11D48',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        Logout
                    </button>
                </div>
                <div className="features">
                    <div className="feature-card">
                        <h3>📊 Data Analysis</h3>
                        <p>Visualize and analyze session data with advanced charts</p>
                    </div>

                    <div className="feature-card">
                        <h3>👥 User Management</h3>
                        <p>Manage patients, researchers, and sessions</p>
                    </div>

                    <div className="feature-card">
                        <h3>📈 Reports</h3>
                        <p>Generate comprehensive reports and export data</p>
                    </div>

                    <div className="feature-card">
                        <h3>⚙️ Configuration</h3>
                        <p>Configure devices, protocols, and system settings</p>
                    </div>
                </div>
            </div>

            <div className="info-card">
                <h3>Getting Started</h3>
                <ol>
                    <li>Connect to the IRIS mobile app for real-time device control</li>
                    <li>Import session data for analysis</li>
                    <li>Generate reports and export results</li>
                </ol>
                <p style={{ marginTop: '1rem', fontSize: '12px', color: '#999' }}>
                    Version: '1.0.0'
                </p>
            </div>
        </AppLayout>
    );
}

export default HomeScreen;

export type HomeScreenProps = {
    activePath: string;
    handleNavigation: (path: string) => void;
}