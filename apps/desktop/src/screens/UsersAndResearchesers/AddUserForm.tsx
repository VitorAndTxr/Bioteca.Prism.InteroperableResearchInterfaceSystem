/**
 * AddUserForm Component
 *
 * Form for adding a new user to the system.
 * Based on Figma design node 6804-12778
 *
 * Features:
 * - Login input
 * - User type dropdown
 * - Password input with strength indicator
 * - Password confirmation
 * - Related researcher selection
 * - Form validation
 */

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Password } from '../../design-system/components/password';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { UserRole, NewUserData } from '@iris/domain';
import { userService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export interface AddUserFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (userData: NewUserData) => void;
    onCancel?: () => void;
}

const userTypeOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'RESEARCHER', label: 'Pesquisador' },
    { value: 'CLINICIAN', label: 'Clínico' },
    { value: 'VIEWER', label: 'Visualizador' },
];

// Mock researchers - Replace with real API call
const mockResearcherOptions = [
    { value: '1', label: 'Dr. João Silva - Instituição A' },
    { value: '2', label: 'Dra. Maria Santos - Instituição B' },
    { value: '3', label: 'Dr. Pedro Oliveira - Instituição C' },
];

export function AddUserForm({ handleNavigation, onSave, onCancel }: AddUserFormProps) {
    // Form state
    const [login, setLogin] = useState('');
    const [userType, setUserType] = useState<string>('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [relatedResearcher, setRelatedResearcher] = useState<string>('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!login.trim()) {
            newErrors.login = 'Login é obrigatório';
        }

        if (!userType) {
            newErrors.userType = 'Tipo de usuário é obrigatório';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 8) {
            newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
        }

        if (!passwordConfirmation) {
            newErrors.passwordConfirmation = 'Confirmação de senha é obrigatória';
        } else if (password !== passwordConfirmation) {
            newErrors.passwordConfirmation = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            login: true,
            userType: true,
            password: true,
            passwordConfirmation: true,
        });

        if (!validateForm()) {
            return;
        }

        const userData: NewUserData = {
            login,
            role: userType,
            password,
            researcherId: relatedResearcher || undefined,
        };

        // If custom save handler provided, use it
        if (onSave) {
            onSave(userData);
            return;
        }

        // Otherwise, save via UserService
        try {
            setSubmitting(true);
            setSubmitError(null);

            console.log('Creating user:', userData);
            const createdUser = await userService.createUser(userData);
            console.log('✅ User created successfully:', createdUser);

            // Navigate back to users list
            handleNavigation('/users');
        } catch (err) {
            console.error('Failed to create user:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle cancel/back
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleNavigation('/users');
        }
    };

    // Generate password
    const handleGeneratePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let generatedPassword = '';
        for (let i = 0; i < 12; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generatedPassword);
        setPasswordConfirmation(generatedPassword);
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/users',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Novo usuário',
                showUserMenu: true,
            }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
                    {/* Error message */}
                    {submitError && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee',
                            color: '#c33',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            border: '1px solid #fcc'
                        }}>
                            <strong>Erro:</strong> {submitError}
                        </div>
                    )}

                    <div className="add-form__fields">
                        {/* Login */}
                        <Input
                            label="Login"
                            placeholder="Digite o login do usuário"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            onBlur={() => handleBlur('login')}
                            validationStatus={touched.login && errors.login ? 'error' : 'none'}
                            errorMessage={touched.login ? errors.login : undefined}
                            required
                        />

                        {/* User Type */}
                        <Dropdown
                            label="Tipo de usuário"
                            placeholder="Selecione o tipo de usuário"
                            options={userTypeOptions}
                            value={userType}
                            onChange={(value) => setUserType(value as string)}
                            onBlur={() => handleBlur('userType')}
                            validation={touched.userType && errors.userType ? 'error' : 'none'}
                            errorMessage={touched.userType ? errors.userType : undefined}
                            required
                        />

                        {/* Password */}
                        <Password
                            label="Senha"
                            placeholder="Digite a senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            validationStatus={touched.password && errors.password ? 'error' : 'none'}
                            errorMessage={touched.password ? errors.password : undefined}
                            helperText="A senha deve ter no mínimo 8 caracteres"
                            showStrengthIndicator
                            showStrengthLabel
                            required
                        />

                        {/* Password Confirmation */}
                        <div className="add-form__field-with-action">
                            <Password
                                label="Confirmação de senha"
                                placeholder="Digite novamente a senha"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                onBlur={() => handleBlur('passwordConfirmation')}
                                validationStatus={touched.passwordConfirmation && errors.passwordConfirmation ? 'error' : 'none'}
                                errorMessage={touched.passwordConfirmation ? errors.passwordConfirmation : undefined}
                                helperText="As senhas devem ser iguais"
                                showStrengthIndicator={false}
                                required
                            />
                            <button
                                type="button"
                                className="add-form__generate-password"
                                onClick={handleGeneratePassword}
                            >
                                Gerar senha
                            </button>
                        </div>

                        {/* Related Researcher */}
                        <Dropdown
                            label="Pesquisador relacionado"
                            placeholder="Selecione um pesquisador (opcional)"
                            options={mockResearcherOptions}
                            value={relatedResearcher}
                            onChange={(value) => setRelatedResearcher(value as string)}
                            searchable
                            fullWidth
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="add-form__actions">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleCancel}
                            icon={<ArrowLeftIcon className="w-5 h-5" />}
                            iconPosition="left"
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                            disabled={submitting}
                        >
                            {submitting ? 'Salvando...' : 'Salvar usuário'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddUserForm;
