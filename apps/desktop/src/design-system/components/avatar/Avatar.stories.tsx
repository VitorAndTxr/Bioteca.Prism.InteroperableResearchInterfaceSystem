/**
 * Avatar Component Storybook Stories
 *
 * Comprehensive examples of the Avatar component showcasing all variants,
 * sizes, states, and features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Design System/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible avatar component that supports images, initials, icons, and placeholders with optional status indicators and notification badges. Based on IRIS Design System (Figma node: 2803-3248).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'xl'],
      description: 'Size of the avatar',
      table: {
        type: { summary: "'small' | 'medium' | 'large' | 'xl'" },
        defaultValue: { summary: 'medium' },
      },
    },
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image',
    },
    initials: {
      control: 'text',
      description: 'Initials to display (max 2 characters)',
    },
    name: {
      control: 'text',
      description: 'Full name (used for generating initials and accessibility)',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Status indicator',
    },
    badge: {
      control: 'number',
      description: 'Notification badge count',
    },
    badgeMax: {
      control: 'number',
      description: 'Maximum number before showing "99+"',
    },
    shape: {
      control: 'select',
      options: ['circle', 'rounded', 'square'],
      description: 'Shape of the avatar',
      table: {
        defaultValue: { summary: 'circle' },
      },
    },
    backgroundColor: {
      control: 'color',
      description: 'Custom background color',
    },
    textColor: {
      control: 'color',
      description: 'Text color for initials',
    },
    interactive: {
      control: 'boolean',
      description: 'Whether the avatar is clickable',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== Basic Variants =====

export const ImageAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'John Doe',
    size: 'medium',
  },
};

export const InitialsAvatar: Story = {
  args: {
    initials: 'JD',
    name: 'John Doe',
    size: 'medium',
  },
};

export const NameGeneratedInitials: Story = {
  args: {
    name: 'Jane Smith',
    size: 'medium',
  },
};

export const PlaceholderAvatar: Story = {
  args: {
    size: 'medium',
  },
};

export const CustomIcon: Story = {
  args: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    size: 'medium',
    backgroundColor: '#7b6fdb',
  },
};

// ===== Sizes =====

export const SizeSmall: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    alt: 'Small avatar',
    size: 'small',
  },
};

export const SizeMedium: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    alt: 'Medium avatar',
    size: 'medium',
  },
};

export const SizeLarge: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=4',
    alt: 'Large avatar',
    size: 'large',
  },
};

export const SizeXL: Story = {
  args: {
    src: 'https://i.pravatar.cc/300?img=5',
    alt: 'Extra large avatar',
    size: 'xl',
  },
};

// ===== All Sizes Comparison =====

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=6" alt="Small" size="small" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Small (32px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=7" alt="Medium" size="medium" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Medium (48px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=8" alt="Large" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Large (56px)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/300?img=9" alt="XL" size="xl" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>XL (144px)</p>
      </div>
    </div>
  ),
};

// ===== Status Indicators =====

export const StatusOnline: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=10',
    alt: 'Online user',
    status: 'online',
    size: 'large',
  },
};

export const StatusOffline: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=11',
    alt: 'Offline user',
    status: 'offline',
    size: 'large',
  },
};

export const StatusBusy: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=12',
    alt: 'Busy user',
    status: 'busy',
    size: 'large',
  },
};

export const StatusAway: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=13',
    alt: 'Away user',
    status: 'away',
    size: 'large',
  },
};

// ===== All Status Indicators =====

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=14" alt="Online" status="online" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Online</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=15" alt="Offline" status="offline" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Offline</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=16" alt="Busy" status="busy" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Busy</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=17" alt="Away" status="away" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Away</p>
      </div>
    </div>
  ),
};

// ===== Notification Badges =====

export const BadgeSingle: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=18',
    alt: 'User with notification',
    badge: 1,
    size: 'large',
  },
};

export const BadgeMultiple: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=19',
    alt: 'User with notifications',
    badge: 42,
    size: 'large',
  },
};

export const BadgeMax: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=20',
    alt: 'User with many notifications',
    badge: 150,
    badgeMax: 99,
    size: 'large',
  },
};

export const BadgeWithStatus: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=21',
    alt: 'Online user with notifications',
    badge: 5,
    status: 'online',
    size: 'large',
  },
};

// ===== Shapes =====

export const ShapeCircle: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=22',
    alt: 'Circle avatar',
    shape: 'circle',
    size: 'large',
  },
};

export const ShapeRounded: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=23',
    alt: 'Rounded avatar',
    shape: 'rounded',
    size: 'large',
  },
};

export const ShapeSquare: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=24',
    alt: 'Square avatar',
    shape: 'square',
    size: 'large',
  },
};

// ===== All Shapes Comparison =====

export const AllShapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=25" alt="Circle" shape="circle" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Circle</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=26" alt="Rounded" shape="rounded" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Rounded</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=27" alt="Square" shape="square" size="large" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Square</p>
      </div>
    </div>
  ),
};

// ===== Custom Colors =====

export const CustomBackgroundColor: Story = {
  args: {
    initials: 'AB',
    name: 'Alice Brown',
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    size: 'large',
  },
};

export const GeneratedColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      {['Alice Brown', 'Bob Chen', 'Carol Davis', 'David Evans', 'Emma Fischer',
        'Frank Green', 'Grace Harris', 'Henry Irving', 'Iris Johnson', 'Jack Kelly'].map((name) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <Avatar name={name} size="large" />
          <p style={{ marginTop: '8px', fontSize: '11px', maxWidth: '80px' }}>{name}</p>
        </div>
      ))}
    </div>
  ),
};

// ===== Interactive States =====

export const InteractiveAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=28',
    alt: 'Clickable avatar',
    interactive: true,
    size: 'large',
    onClick: () => alert('Avatar clicked!'),
  },
};

export const LoadingAvatar: Story = {
  args: {
    loading: true,
    size: 'large',
  },
};

export const LoadingAllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Avatar loading size="small" />
      <Avatar loading size="medium" />
      <Avatar loading size="large" />
      <Avatar loading size="xl" />
    </div>
  ),
};

// ===== Initials Variants =====

export const InitialsAllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Avatar name="John Doe" size="small" />
      <Avatar name="Jane Smith" size="medium" />
      <Avatar name="Bob Wilson" size="large" />
      <Avatar name="Alice Brown" size="xl" />
    </div>
  ),
};

export const InitialsWithStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Avatar name="Online User" status="online" size="large" />
      <Avatar name="Offline User" status="offline" size="large" />
      <Avatar name="Busy User" status="busy" size="large" />
      <Avatar name="Away User" status="away" size="large" />
    </div>
  ),
};

// ===== Complex Combinations =====

export const FullyFeatured: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=29',
    alt: 'User with all features',
    status: 'online',
    badge: 12,
    interactive: true,
    size: 'xl',
    onClick: () => console.log('Avatar clicked!'),
  },
};

export const UserList: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[
        { name: 'Alice Johnson', status: 'online' as const, badge: 3 },
        { name: 'Bob Smith', status: 'busy' as const, badge: 1 },
        { name: 'Carol Williams', status: 'away' as const },
        { name: 'David Brown', status: 'offline' as const },
      ].map((user) => (
        <div
          key={user.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Avatar
            name={user.name}
            status={user.status}
            badge={user.badge}
            size="medium"
            interactive
          />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#727272', textTransform: 'capitalize' }}>
              {user.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ===== Avatar Group =====

export const AvatarGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', marginLeft: '20px' }}>
      {['https://i.pravatar.cc/150?img=30',
        'https://i.pravatar.cc/150?img=31',
        'https://i.pravatar.cc/150?img=32',
        'https://i.pravatar.cc/150?img=33'].map((src, index) => (
        <div key={index} style={{ marginLeft: index === 0 ? '0' : '-16px' }}>
          <Avatar
            src={src}
            alt={`User ${index + 1}`}
            size="medium"
            style={{ border: '2px solid white' }}
          />
        </div>
      ))}
      <div style={{ marginLeft: '-16px' }}>
        <Avatar
          initials="+5"
          size="medium"
          backgroundColor="#727272"
          style={{ border: '2px solid white' }}
        />
      </div>
    </div>
  ),
};

// ===== Playground =====

export const Playground: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=34',
    alt: 'Playground avatar',
    size: 'large',
    shape: 'circle',
    status: 'online',
    badge: 5,
    interactive: true,
  },
};
