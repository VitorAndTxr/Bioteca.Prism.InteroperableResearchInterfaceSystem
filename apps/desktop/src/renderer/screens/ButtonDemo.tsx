/**
 * Button Component Demo/Testing Screen
 *
 * This is a temporary testing page to visualize and interact with all Button variants.
 * Remove this file once Storybook is configured.
 */

import React, { useState } from 'react';
import { Button } from '../../design-system/components/button';
import './ButtonDemo.css';

// Simple SVG icons for testing
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

function ButtonDemo() {
    const [loadingStates, setLoadingStates] = useState({
        primary: false,
        secondary: false,
        outline: false
    });

    const handleLoadingClick = (variant: 'primary' | 'secondary' | 'outline') => {
        setLoadingStates(prev => ({ ...prev, [variant]: true }));
        setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, [variant]: false }));
        }, 2000);
    };

    return (
        <div className="button-demo">
            <header className="demo-header">
                <h1>Button Component Demo</h1>
                <p>Testing all variants, sizes, states, and icon configurations</p>
            </header>

            <main className="demo-main">
                {/* Section: Variants */}
                <section className="demo-section">
                    <h2>Variants</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Primary</label>
                            <Button variant="primary">Primary Button</Button>
                        </div>
                        <div className="demo-item">
                            <label>Secondary</label>
                            <Button variant="secondary">Secondary Button</Button>
                        </div>
                        <div className="demo-item">
                            <label>Outline</label>
                            <Button variant="outline">Outline Button</Button>
                        </div>
                    </div>
                </section>

                {/* Section: Sizes */}
                <section className="demo-section">
                    <h2>Sizes</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Small (32px)</label>
                            <Button size="small">Small Button</Button>
                        </div>
                        <div className="demo-item">
                            <label>Medium (44px)</label>
                            <Button size="medium">Medium Button</Button>
                        </div>
                        <div className="demo-item">
                            <label>Big (56px)</label>
                            <Button size="big">Big Button</Button>
                        </div>
                    </div>
                </section>

                {/* Section: Icon Positions */}
                <section className="demo-section">
                    <h2>Icon Positions</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Icon Left</label>
                            <Button icon={<PlusIcon />} iconPosition="left">Add Item</Button>
                        </div>
                        <div className="demo-item">
                            <label>Icon Right</label>
                            <Button icon={<ArrowRightIcon />} iconPosition="right" variant="secondary">
                                Next Step
                            </Button>
                        </div>
                        <div className="demo-item">
                            <label>Icon Only (with tooltip)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button icon={<SaveIcon />} tooltip="Save changes" variant="primary" />
                                <Button icon={<PlusIcon />} tooltip="Add new" variant="secondary" />
                                <Button icon={<DeleteIcon />} tooltip="Delete item" variant="outline" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: States */}
                <section className="demo-section">
                    <h2>States</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Default</label>
                            <Button>Default State</Button>
                        </div>
                        <div className="demo-item">
                            <label>Disabled</label>
                            <Button disabled>Disabled Button</Button>
                        </div>
                        <div className="demo-item">
                            <label>Loading</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                    loading={loadingStates.primary}
                                    onClick={() => handleLoadingClick('primary')}
                                >
                                    {loadingStates.primary ? 'Saving...' : 'Click to Load'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    loading={loadingStates.secondary}
                                    onClick={() => handleLoadingClick('secondary')}
                                >
                                    {loadingStates.secondary ? 'Processing...' : 'Process'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: All Variants × All Sizes */}
                <section className="demo-section">
                    <h2>Variant × Size Matrix</h2>
                    <table className="demo-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Primary</th>
                                <th>Secondary</th>
                                <th>Outline</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Small</strong></td>
                                <td><Button variant="primary" size="small">Primary</Button></td>
                                <td><Button variant="secondary" size="small">Secondary</Button></td>
                                <td><Button variant="outline" size="small">Outline</Button></td>
                            </tr>
                            <tr>
                                <td><strong>Medium</strong></td>
                                <td><Button variant="primary" size="medium">Primary</Button></td>
                                <td><Button variant="secondary" size="medium">Secondary</Button></td>
                                <td><Button variant="outline" size="medium">Outline</Button></td>
                            </tr>
                            <tr>
                                <td><strong>Big</strong></td>
                                <td><Button variant="primary" size="big">Primary</Button></td>
                                <td><Button variant="secondary" size="big">Secondary</Button></td>
                                <td><Button variant="outline" size="big">Outline</Button></td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Section: Full Width */}
                <section className="demo-section">
                    <h2>Full Width</h2>
                    <div className="demo-group" style={{ maxWidth: '400px' }}>
                        <Button fullWidth variant="primary">Full Width Primary</Button>
                        <Button fullWidth variant="secondary">Full Width Secondary</Button>
                        <Button fullWidth variant="outline">Full Width Outline</Button>
                    </div>
                </section>

                {/* Section: Interactive Examples */}
                <section className="demo-section">
                    <h2>Interactive Examples</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Form Actions</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button variant="primary" icon={<SaveIcon />}>
                                    Save Changes
                                </Button>
                                <Button variant="outline">Cancel</Button>
                            </div>
                        </div>
                        <div className="demo-item">
                            <label>Toolbar Actions</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button size="small" icon={<PlusIcon />} tooltip="Add new" />
                                <Button size="small" icon={<SaveIcon />} tooltip="Save" />
                                <Button size="small" icon={<DeleteIcon />} tooltip="Delete" variant="outline" />
                            </div>
                        </div>
                        <div className="demo-item">
                            <label>Disabled with Icon</label>
                            <Button disabled icon={<ArrowRightIcon />} iconPosition="right">
                                Complete Step
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Section: Click Handler Test */}
                <section className="demo-section">
                    <h2>Event Handlers</h2>
                    <div className="demo-group">
                        <Button
                            onClick={() => alert('Primary button clicked!')}
                            variant="primary"
                        >
                            Click Me (Primary)
                        </Button>
                        <Button
                            onClick={() => console.log('Secondary button clicked')}
                            variant="secondary"
                        >
                            Click Me (Console Log)
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="demo-footer">
                <p>
                    📝 This is a temporary demo page. Remove when Storybook is configured.
                </p>
                <p>
                    📚 See <code>apps/desktop/src/design-system/components/button/README.md</code> for full documentation
                </p>
            </footer>
        </div>
    );
}

export default ButtonDemo;
