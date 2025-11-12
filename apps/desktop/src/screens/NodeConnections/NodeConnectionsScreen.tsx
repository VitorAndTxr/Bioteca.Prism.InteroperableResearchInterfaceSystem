import { mainMenuItems } from "@/config/menu";
import { AppLayout } from "@/design-system/components/app-layout";

const NodeConnectionsScreen: React.FC<NodeConnectionsScreenProps> = ({ handleNavigation }) => {
    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/nodeConnections',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Conexões',
                showUserMenu: true
            }}
        >
            <div>Node Connections Functionality Coming Soon!</div>
        </AppLayout>
    );
}

type NodeConnectionsScreenProps = {
    handleNavigation: (path: string) => void;
};

export default NodeConnectionsScreen;