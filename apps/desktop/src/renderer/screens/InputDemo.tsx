/**
 * Input Component Demo/Testing Screen
 *
 * This is a temporary testing page to visualize and interact with all Input variants.
 * Remove this file once Storybook is configured.
 */

import React, { useState } from 'react';
import { Input } from '../../design-system/components/input';
import './InputDemo.css';

interface InputDemoProps {
    onBack?: () => void;
}

// Simple SVG icons for testing
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

function InputDemo({ onBack }: InputDemoProps) {
    const [searchValue, setSearchValue] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('');
        } else if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    return (
        <div className="input-demo">
            <header className="demo-header">
                {onBack && (
                    <button onClick={onBack} className="back-button">
                        ← Back
                    </button>
                )}
                <h1>Input Component Demo</h1>
                <p>Testing all sizes, states, icons, and configurations</p>
            </header>

            <main className="demo-main">
                {/* Section: Sizes */}
                <section className="demo-section">
                    <h2>Sizes</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Small (36px)</label>
                            <Input size="small" placeholder="Small input" />
                        </div>
                        <div className="demo-item">
                            <label>Medium (44px) - Default</label>
                            <Input size="medium" placeholder="Medium input" />
                        </div>
                        <div className="demo-item">
                            <label>Big (52px)</label>
                            <Input size="big" placeholder="Big input" />
                        </div>
                    </div>
                </section>

                {/* Section: Basic States */}
                <section className="demo-section">
                    <h2>Basic States</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Default Empty</label>
                            <Input placeholder="Placeholder text" />
                        </div>
                        <div className="demo-item">
                            <label>Default Filled</label>
                            <Input value="Typed value" readOnly />
                        </div>
                        <div className="demo-item">
                            <label>Disabled</label>
                            <Input placeholder="Disabled input" disabled />
                        </div>
                        <div className="demo-item">
                            <label>Disabled with Value</label>
                            <Input value="Disabled with value" disabled />
                        </div>
                    </div>
                </section>

                {/* Section: With Labels */}
                <section className="demo-section">
                    <h2>With Labels</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <Input label="Email Address" placeholder="you@example.com" />
                        </div>
                        <div className="demo-item">
                            <Input label="Full Name" placeholder="John Doe" required />
                        </div>
                        <div className="demo-item">
                            <Input
                                label="Username"
                                placeholder="johndoe123"
                                helperText="Choose a unique username"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Icon Positions */}
                <section className="demo-section">
                    <h2>Icon Positions</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>No Icon</label>
                            <Input placeholder="No icon" />
                        </div>
                        <div className="demo-item">
                            <label>Icon Left</label>
                            <Input
                                icon={<SearchIcon />}
                                iconPosition="left"
                                placeholder="Search..."
                            />
                        </div>
                        <div className="demo-item">
                            <label>Icon Right</label>
                            <Input
                                icon={<CalendarIcon />}
                                iconPosition="right"
                                placeholder="Select date"
                            />
                        </div>
                        <div className="demo-item">
                            <label>Icon Both Sides</label>
                            <Input
                                icon={<UserIcon />}
                                rightIcon={<XIcon />}
                                placeholder="Username"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Validation States */}
                <section className="demo-section">
                    <h2>Validation States</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <Input
                                label="Error State"
                                validationStatus="error"
                                errorMessage="This field is required"
                                placeholder="Error example"
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                label="Success State"
                                validationStatus="success"
                                value="validinput@example.com"
                                helperText="Email is available!"
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                label="Warning State"
                                validationStatus="warning"
                                value="weakpassword"
                                helperText="Password strength: weak"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Prefix & Suffix */}
                <section className="demo-section">
                    <h2>Prefix & Suffix</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Currency Input (Prefix)</label>
                            <Input
                                prefix="$"
                                placeholder="0.00"
                                type="number"
                                label="Amount"
                            />
                        </div>
                        <div className="demo-item">
                            <label>Weight Input (Suffix)</label>
                            <Input
                                suffix="kg"
                                placeholder="0"
                                type="number"
                                label="Weight"
                            />
                        </div>
                        <div className="demo-item">
                            <label>URL Input (Prefix)</label>
                            <Input
                                prefix="https://"
                                placeholder="example.com"
                                label="Website"
                            />
                        </div>
                        <div className="demo-item">
                            <label>Percentage (Suffix)</label>
                            <Input
                                suffix="%"
                                placeholder="0"
                                type="number"
                                label="Discount"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Character Limit */}
                <section className="demo-section">
                    <h2>Character Limit & Counter</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <Input
                                label="Without Limit"
                                placeholder="No character limit"
                                showCharacterCount
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                label="With Limit (50 chars)"
                                placeholder="Type here..."
                                maxLength={50}
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                label="Bio (100 chars max)"
                                placeholder="Tell us about yourself"
                                maxLength={100}
                                helperText="Keep it short and sweet"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Textarea */}
                <section className="demo-section">
                    <h2>Textarea (Multiline)</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <Input
                                multiline
                                rows={4}
                                label="Comments"
                                placeholder="Enter your comments..."
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                multiline
                                rows={6}
                                label="Description (500 chars)"
                                placeholder="Provide a detailed description..."
                                maxLength={500}
                                helperText="Be as detailed as possible"
                            />
                        </div>
                        <div className="demo-item">
                            <Input
                                multiline
                                rows={4}
                                label="Message"
                                placeholder="Type your message..."
                                resize="none"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Interactive Examples */}
                <section className="demo-section">
                    <h2>Interactive Examples</h2>
                    <div className="demo-group">
                        <div className="demo-item">
                            <label>Search with Clear Button</label>
                            <Input
                                icon={<SearchIcon />}
                                rightIcon={
                                    searchValue ? (
                                        <button
                                            onClick={() => setSearchValue('')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex',
                                            }}
                                        >
                                            <XIcon />
                                        </button>
                                    ) : null
                                }
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Search..."
                            />
                        </div>
                        <div className="demo-item">
                            <label>Password with Show/Hide Toggle</label>
                            <Input
                                label="Password"
                                type={passwordVisible ? 'text' : 'password'}
                                rightIcon={
                                    <button
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            display: 'flex',
                                        }}
                                    >
                                        <EyeIcon />
                                    </button>
                                }
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="demo-item">
                            <label>Email with Validation</label>
                            <Input
                                label="Email"
                                type="email"
                                icon={<MailIcon />}
                                value={emailValue}
                                onChange={(e) => {
                                    setEmailValue(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                                validationStatus={emailError ? 'error' : emailValue ? 'success' : 'none'}
                                errorMessage={emailError}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Size × Icon Matrix */}
                <section className="demo-section">
                    <h2>Size × Icon Position Matrix</h2>
                    <table className="demo-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>No Icon</th>
                                <th>Icon Left</th>
                                <th>Icon Right</th>
                                <th>Icon Both</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Small</strong></td>
                                <td><Input size="small" placeholder="Placeholder" /></td>
                                <td>
                                    <Input
                                        size="small"
                                        icon={<SearchIcon />}
                                        iconPosition="left"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="small"
                                        icon={<CalendarIcon />}
                                        iconPosition="right"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="small"
                                        icon={<UserIcon />}
                                        rightIcon={<XIcon />}
                                        placeholder="Placeholder"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Medium</strong></td>
                                <td><Input size="medium" placeholder="Placeholder" /></td>
                                <td>
                                    <Input
                                        size="medium"
                                        icon={<SearchIcon />}
                                        iconPosition="left"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="medium"
                                        icon={<CalendarIcon />}
                                        iconPosition="right"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="medium"
                                        icon={<UserIcon />}
                                        rightIcon={<XIcon />}
                                        placeholder="Placeholder"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Big</strong></td>
                                <td><Input size="big" placeholder="Placeholder" /></td>
                                <td>
                                    <Input
                                        size="big"
                                        icon={<SearchIcon />}
                                        iconPosition="left"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="big"
                                        icon={<CalendarIcon />}
                                        iconPosition="right"
                                        placeholder="Placeholder"
                                    />
                                </td>
                                <td>
                                    <Input
                                        size="big"
                                        icon={<UserIcon />}
                                        rightIcon={<XIcon />}
                                        placeholder="Placeholder"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Section: Full Width */}
                <section className="demo-section">
                    <h2>Full Width</h2>
                    <div className="demo-group" style={{ maxWidth: '600px' }}>
                        <Input fullWidth label="Full Name" placeholder="John Doe" />
                        <Input fullWidth label="Email Address" type="email" placeholder="you@example.com" />
                        <Input fullWidth label="Phone Number" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                </section>

                {/* Section: Form Example */}
                <section className="demo-section">
                    <h2>Complete Form Example</h2>
                    <div className="demo-group" style={{ maxWidth: '500px' }}>
                        <Input
                            label="Full Name"
                            icon={<UserIcon />}
                            placeholder="John Doe"
                            required
                            fullWidth
                        />
                        <Input
                            label="Email"
                            icon={<MailIcon />}
                            type="email"
                            placeholder="you@example.com"
                            required
                            fullWidth
                        />
                        <Input
                            label="Amount"
                            prefix="$"
                            suffix="USD"
                            type="number"
                            placeholder="0.00"
                            helperText="Enter the payment amount"
                            fullWidth
                        />
                        <Input
                            multiline
                            rows={5}
                            label="Additional Notes"
                            placeholder="Any additional information..."
                            maxLength={200}
                            fullWidth
                        />
                    </div>
                </section>
            </main>

            <footer className="demo-footer">
                <p>
                    📝 This is a temporary demo page. Remove when Storybook is configured.
                </p>
                <p>
                    📚 See <code>apps/desktop/src/design-system/components/input/README.md</code> for full documentation
                </p>
            </footer>
        </div>
    );
}

export default InputDemo;
