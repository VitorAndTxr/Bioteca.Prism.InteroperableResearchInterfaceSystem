/**
 * UsersList Screen - Storybook Stories
 *
 * Demonstrates the UsersList screen with various states and interactions.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { UsersList } from './UsersList';
import { fn } from '@storybook/test';

const meta = {
    title: 'Screens/UsersList',
    component: UsersList,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
# UsersList Screen

The **UsersList** screen displays a comprehensive list of users and researchers with CRUD operations.

## Features
- **Dual Tab Interface**: Switch between "Usuários" (Users) and "Pesquisadores" (Researchers)
- **Search Functionality**: Real-time search across user names, emails, and IDs
- **Data Table**: Sortable columns with pagination
- **Action Buttons**: View and Edit actions for each user
- **Add User**: Primary action button to add new users
- **Logout**: Quick logout button in the header
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens

## Based on Figma Design
- **Node**: 6804-13670 (Usuários e Pesquisadores)
- **Design System**: IRIS Design System
- **Color Tokens**: Ciano-100, Neutros-800, Brand/Primary/50

## User Roles
- **Admin**: Full system access
- **Researcher**: Can manage research projects
- **Clinician**: Clinical data access
- **Viewer**: Read-only access

## Integration
This screen integrates with:
- \`DataTable\` component for tabular data
- \`SearchBar\` component for filtering
- \`Button\` component for actions
- \`AuthContext\` for authentication state
                `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        onUserAdd: {
            description: 'Callback when the "Adicionar" button is clicked',
            action: 'userAdd',
        },
        onUserEdit: {
            description: 'Callback when a user\'s edit button is clicked',
            action: 'userEdit',
        },
        onUserView: {
            description: 'Callback when a user\'s view button is clicked',
            action: 'userView',
        },
        onLogout: {
            description: 'Callback when the logout button is clicked',
            action: 'logout',
        },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof UsersList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default State
 *
 * Shows the UsersList screen in its default state with the "Usuários" tab selected.
 */
export const Default: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
};

/**
 * Usuarios Tab
 *
 * The default tab showing all non-researcher users (Admin, Clinician, Viewer).
 */
export const UsuariosTab: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        docs: {
            description: {
                story: 'Displays the "Usuários" tab with Admin, Clinician, and Viewer users.',
            },
        },
    },
};

/**
 * Interactive Example
 *
 * Fully interactive UsersList screen with all callbacks enabled.
 * Try clicking the action buttons, searching, and changing pages.
 */
export const Interactive: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        docs: {
            description: {
                story: `
### Interactive Features
- **Search**: Type in the search bar to filter users
- **Pagination**: Navigate through pages using the pagination controls
- **Actions**: Click the eye icon to view or pencil icon to edit a user
- **Add User**: Click the "Adicionar" button in the top right
- **Tabs**: Switch between Usuários and Pesquisadores tabs
- **Logout**: Click the logout icon in the top right header

All actions will be logged in the Storybook Actions panel.
                `,
            },
        },
    },
    play: async ({ args }) => {
        // This allows the story to track interactions
        console.log('UsersList is ready for interaction');
    },
};

/**
 * With Long User List
 *
 * Demonstrates pagination with a larger dataset.
 */
export const WithLongList: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows how the screen handles a longer list of users with pagination.',
            },
        },
    },
};

/**
 * Mobile View
 *
 * UsersList screen optimized for mobile devices.
 */
export const MobileView: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
        docs: {
            description: {
                story: `
### Mobile Optimizations
- Responsive layout with adjusted spacing
- Stacked header elements
- Simplified table with hidden columns
- Touch-friendly action buttons
- Optimized font sizes
                `,
            },
        },
    },
};

/**
 * Tablet View
 *
 * UsersList screen optimized for tablet devices.
 */
export const TabletView: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        viewport: {
            defaultViewport: 'tablet',
        },
        docs: {
            description: {
                story: 'Demonstrates the responsive layout on tablet-sized screens.',
            },
        },
    },
};

/**
 * Action Callbacks Example
 *
 * Demonstrates all callback functions with console logging.
 */
export const WithActionCallbacks: Story = {
    args: {
        onUserAdd: () => {
            console.log('🆕 Add User clicked');
            alert('Opening Add User form...');
        },
        onUserEdit: (user) => {
            console.log('✏️ Edit User clicked:', user);
            alert(`Editing user: ${user.name}`);
        },
        onUserView: (user) => {
            console.log('👁️ View User clicked:', user);
            alert(`Viewing user details for: ${user.name}`);
        },
        onLogout: () => {
            console.log('🚪 Logout clicked');
            alert('Logging out...');
        },
    },
    parameters: {
        docs: {
            description: {
                story: `
### Action Callbacks
This story demonstrates all available callback functions:
- **onUserAdd**: Triggered when "Adicionar" button is clicked
- **onUserEdit**: Triggered when edit icon is clicked (receives User object)
- **onUserView**: Triggered when view icon is clicked (receives User object)
- **onLogout**: Triggered when logout icon is clicked

Each callback shows an alert and logs to console for demonstration.
                `,
            },
        },
    },
};

/**
 * Design Tokens Reference
 *
 * Shows the design tokens used in this screen.
 */
export const DesignTokens: Story = {
    args: {
        onUserAdd: fn(),
        onUserEdit: fn(),
        onUserView: fn(),
        onLogout: fn(),
    },
    parameters: {
        docs: {
            description: {
                story: `
### Color Tokens Used
- **Background**: #F4F4F4 (Neutros-200)
- **Card Background**: #FCFCFC (Neutros-50)
- **Title**: #2C3131 (Neutros-800)
- **Active Tab**: #DAFAFD (Brand/Primary/50) with #49A2A8 border
- **Inactive Tab**: #FFFFFF with #D1D1D1 border
- **Button Primary**: #49A2A8 (Brand/Primary/500)
- **Text Secondary**: #727272 (Neutral/600)

### Typography
- **Title**: Inter Semi Bold 24px (letter-spacing: 0.48px)
- **Subtitle**: Inter Regular 22px
- **Tab**: Inter Semi Bold 14px
- **Table Header**: Inter Semi Bold 16px
- **Table Body**: Inter Regular 14px

### Spacing
- Card gap: 24px
- Tab border-radius: 8px
- Card border-radius: 8px
- Shadow: 2px 4px 4px rgba(0,0,0,0.08)
                `,
            },
        },
    },
};
