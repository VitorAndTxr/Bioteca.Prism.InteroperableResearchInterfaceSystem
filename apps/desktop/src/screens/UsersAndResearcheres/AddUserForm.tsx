/**
 * AddUserForm Component
 *
 * Form for adding, viewing, and editing users in the system.
 * Based on Figma design node 6804-12778
 *
 * Features:
 * - Login input
 * - User type dropdown
 * - Password input with strength indicator (add mode only)
 * - Password confirmation (add mode only)
 * - Related researcher selection
 * - Form validation
 * - View mode (read-only display)
 * - Edit mode (update existing user)
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Password } from '../../design-system/components/password';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { NewUserData, User } from '@iris/domain';
import { userService, researcherService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddUserFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (userData: NewUserData) => void;
    onCancel?: () => void;
    mode?: FormMode;
    user?: User;
}



const userTypeOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'RESEARCHER', label: 'Pesquisador' },
];

export function AddUserForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    user
}: AddUserFormProps) {
    const isReadOnly = mode === 'view';

    // Dynamic header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'add':
                return 'Novo usuário';
            case 'view':
                return 'Detalhes do usuário';
            case 'edit':
                return 'Editar usuário';
        }
    };

    // Form state
    const [login, setLogin] = useState('');
    const [userType, setUserType] = useState<string>('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [relatedResearcher, setRelatedResearcher] = useState<string>('');
    const [researcherOptions, setResearcherOptions] = useState<{ value: string; label: string }[]>([]);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch researcher options for dropdown
    useEffect(() => {
        researcherService.getByNodeId().then(response => {
            const options = response.map(researcher => ({
                value: researcher.researcherId,
                label: `${researcher.name} - ${researcher.orcid}`,
            }));
            setResearcherOptions(options);
        }).catch(error => {
            console.error('Failed to fetch researchers for dropdown:', error);
        });
    }, []);

    // Initialize form state from user prop when in view/edit mode
    useEffect(() => {
        if ((mode === 'view' || mode === 'edit') && user) {
            setLogin(user.login);
            setUserType(user.role.toUpperCase());
            setRelatedResearcher(user.researcher?.researcherId || '');
        }
    }, [mode, user]);

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

        // Password validation only required in add mode
        if (mode === 'add') {
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
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // View mode should not submit
        if (mode === 'view') {
            return;
        }

        // Mark all fields as touched
        const touchedFields: Record<string, boolean> = {
            login: true,
            userType: true,
        };

        // Only mark password fields as touched in add mode
        if (mode === 'add') {
            touchedFields.password = true;
            touchedFields.passwordConfirmation = true;
        }

        setTouched(touchedFields);

        if (!validateForm()) {
            return;
        }

        const userData: NewUserData = {
            login,
            role: userType,
            password: mode === 'add' ? password : '', // Password only for add mode
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

            if (mode === 'add') {
                console.log('Creating user:', userData);
                const createdUser = await userService.createUser(userData);
                console.log('User created successfully:', createdUser);
            } else if (mode === 'edit' && user) {
                // TODO: Implement updateUser in UserService
                console.log('Updating user:', user.id, userData);
                // await userService.updateUser(user.id, userData);
                console.log('User updated successfully');
            }

            // Navigate back to users list
            handleNavigation('/users');
        } catch (err) {
            console.error(`Failed to ${mode === 'add' ? 'create' : 'update'} user:`, err);
            const errorMessage = err instanceof Error ? err.message : `Failed to ${mode === 'add' ? 'create' : 'update'} user`;
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
                title: getHeaderTitle(),
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
                            disabled={isReadOnly}
                            required
                        />

                        {/* User Type */}
                        <Dropdown
                            label="Tipo de usuário"
                            placeholder="Selecione o tipo de usuário"
                            options={userTypeOptions}
                            value={userType}
                            onChange={(value) => setUserType(Array.isArray(value) ? value[0] : value)}
                            onBlur={() => handleBlur('userType')}
                            validation={touched.userType && errors.userType ? 'error' : 'none'}
                            errorMessage={touched.userType ? errors.userType : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        {/* Password fields - only shown in add mode */}
                        {mode === 'add' && (
                            <>
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
                            </>
                        )}

                        {/* Related Researcher */}
                        <Dropdown
                            label="Pesquisador relacionado"
                            placeholder="Selecione um pesquisador (opcional)"
                            options={researcherOptions}
                            value={relatedResearcher}
                            onChange={(value) => setRelatedResearcher(Array.isArray(value) ? value[0] : value)}
                            searchable
                            fullWidth
                            disabled={isReadOnly}
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
                        {mode !== 'view' && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="big"
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Salvando...'
                                    : mode === 'edit'
                                        ? 'Atualizar usuário'
                                        : 'Salvar usuário'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddUserForm;
