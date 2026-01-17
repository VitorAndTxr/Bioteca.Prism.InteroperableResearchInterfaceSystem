/**
 * AddResearcherForm Component
 *
 * Form for adding, viewing, or editing a researcher in the system.
 * Similar structure to AddUserForm but with researcher-specific fields.
 *
 * Features:
 * - Name input
 * - Email input
 * - Institution input
 * - ORCID input
 * - Researcher role dropdown
 * - Form validation
 * - View mode (read-only)
 * - Edit mode (pre-populated, editable)
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { Researcher, ResearcherRole, NewResearcherData } from '@iris/domain';
import { researcherService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddResearcherFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (researcherData: NewResearcherData) => void;
    onCancel?: () => void;
    mode?: FormMode;
    researcher?: Researcher;
}

const researcherRoleOptions = [
    { value: 'chief_researcher', label: 'Pesquisador Chefe' },
    { value: 'researcher', label: 'Pesquisador' },
];

export function AddResearcherForm({
    handleNavigation,
    onSave,
    onCancel,
    mode = 'add',
    researcher
}: AddResearcherFormProps) {
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [institution, setInstitution] = useState('');
    const [orcid, setOrcid] = useState('');
    const [role, setRole] = useState<string>('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Derived state
    const isReadOnly = mode === 'view';

    // Initialize form state from researcher prop when in view/edit mode
    useEffect(() => {
        if (researcher && (mode === 'view' || mode === 'edit')) {
            setName(researcher.name);
            setEmail(researcher.email);
            setInstitution(researcher.institution);
            setOrcid(researcher.orcid);
            setRole(researcher.role);
        }
    }, [researcher, mode]);

    // Get dynamic header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes do pesquisador';
            case 'edit':
                return 'Editar pesquisador';
            case 'add':
            default:
                return 'Novo pesquisador';
        }
    };

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Email validation
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // ORCID validation (format: 0000-0000-0000-0000)
    const isValidOrcid = (orcid: string): boolean => {
        const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
        return orcidRegex.test(orcid);
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!institution.trim()) {
            newErrors.institution = 'Instituição é obrigatória';
        }

        if (!orcid.trim()) {
            newErrors.orcid = 'ORCID é obrigatório';
        } else if (!isValidOrcid(orcid)) {
            newErrors.orcid = 'ORCID inválido (formato: 0000-0000-0000-0000)';
        }

        if (!role) {
            newErrors.role = 'Tipo de pesquisador é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Reset submission state
        setSubmitError(null);
        setSubmitSuccess(false);

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            institution: true,
            orcid: true,
            role: true,
        });

        if (!validateForm()) {
            return;
        }

        const researcherData: NewResearcherData = {
            name,
            email,
            institution,
            orcid,
            role: role as ResearcherRole,
            researchNodeId: import.meta.env.VITE_IRN_MIDDLEWARE_RESEARCH_NODE_ID || '',
        };

        // If custom onSave handler provided, use it
        if (onSave) {
            onSave(researcherData);
            return;
        }

        // Otherwise, submit to backend via ResearcherService
        try {
            setSubmitting(true);

            if (mode === 'edit' && researcher) {
                // Update existing researcher
                console.log('Updating researcher:', researcher.researcherId, researcherData);

                const updatedResearcher = await researcherService.updateResearcher(
                    researcher.researcherId,
                    researcherData
                );

                console.log('✅ Researcher updated successfully:', updatedResearcher);
                setSubmitSuccess(true);
            } else {
                // Create new researcher
                console.log('Creating researcher:', researcherData);

                const createdResearcher = await researcherService.createResearcher(researcherData);

                console.log('✅ Researcher created successfully:', createdResearcher);
                setSubmitSuccess(true);
            }

            // Show success message briefly, then navigate back
            setTimeout(() => {
                handleNavigation('/users');
            }, 1500);
        } catch (err) {
            const action = mode === 'edit' ? 'update' : 'create';
            console.error(`❌ Failed to ${action} researcher:`, err);
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action} researcher`;
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
                    <div className="add-form__fields">
                        {/* Name */}
                        <Input
                            label="Nome completo"
                            placeholder="Digite o nome do pesquisador"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Digite o email do pesquisador"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            validationStatus={touched.email && errors.email ? 'error' : 'none'}
                            errorMessage={touched.email ? errors.email : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        {/* Institution */}
                        <Input
                            label="Instituição"
                            placeholder="Digite a instituição"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            onBlur={() => handleBlur('institution')}
                            validationStatus={touched.institution && errors.institution ? 'error' : 'none'}
                            errorMessage={touched.institution ? errors.institution : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        {/* ORCID */}
                        <Input
                            label="ORCID"
                            placeholder="0000-0000-0000-0000"
                            value={orcid}
                            onChange={(e) => setOrcid(e.target.value)}
                            onBlur={() => handleBlur('orcid')}
                            validationStatus={touched.orcid && errors.orcid ? 'error' : 'none'}
                            errorMessage={touched.orcid ? errors.orcid : undefined}
                            helperText="Formato: 0000-0000-0000-0000"
                            disabled={isReadOnly}
                            required
                        />

                        {/* Researcher Role */}
                        <Dropdown
                            label="Tipo de pesquisador"
                            placeholder="Selecione o tipo de pesquisador"
                            options={researcherRoleOptions}
                            value={role}
                            onChange={(value) => {
                                const selectedValue = Array.isArray(value) ? value[0] : value;
                                setRole(selectedValue);
                            }}
                            onBlur={() => handleBlur('role')}
                            validation={touched.role && errors.role ? 'error' : 'none'}
                            errorMessage={touched.role ? errors.role : undefined}
                            disabled={isReadOnly}
                            required
                            fullWidth
                        />
                    </div>

                    {/* Submission Status Messages */}
                    {submitError && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '4px',
                            marginTop: '16px'
                        }}>
                            ❌ Erro: {submitError}
                        </div>
                    )}

                    {submitSuccess && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '4px',
                            marginTop: '16px'
                        }}>
                            {mode === 'edit'
                                ? 'Pesquisador atualizado com sucesso! Redirecionando...'
                                : 'Pesquisador criado com sucesso! Redirecionando...'}
                        </div>
                    )}

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
                                        ? 'Atualizar pesquisador'
                                        : 'Salvar pesquisador'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddResearcherForm;
