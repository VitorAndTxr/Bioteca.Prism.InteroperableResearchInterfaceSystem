/**
 * AddResearcherForm Component
 *
 * Form for adding a new researcher to the system.
 * Similar structure to AddUserForm but with researcher-specific fields.
 *
 * Features:
 * - Name input
 * - Email input
 * - Institution input
 * - ORCID input
 * - Researcher role dropdown
 * - Form validation
 */

import React, { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import type { ResearcherRole } from '@iris/domain';
import './AddResearcherForm.css';

export interface AddResearcherFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (researcherData: NewResearcherData) => void;
    onCancel?: () => void;
}

export interface NewResearcherData {
    name: string;
    email: string;
    institution: string;
    orcid: string;
    role: ResearcherRole;
}

const researcherRoleOptions = [
    { value: 'chief_researcher', label: 'Pesquisador Chefe' },
    { value: 'researcher', label: 'Pesquisador' },
];

export function AddResearcherForm({ handleNavigation, onSave, onCancel }: AddResearcherFormProps) {
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [institution, setInstitution] = useState('');
    const [orcid, setOrcid] = useState('');
    const [role, setRole] = useState<string>('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

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
        };

        if (onSave) {
            onSave(researcherData);
        } else {
            console.log('Researcher data to save:', researcherData);
            // Navigate back to users list
            handleNavigation('/users');
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
                title: 'Novo pesquisador',
                showUserMenu: true,
            }}
        >
            <div className="add-researcher-form">
                <form className="add-researcher-form__container" onSubmit={handleSubmit}>
                    <div className="add-researcher-form__fields">
                        {/* Name */}
                        <Input
                            label="Nome completo"
                            placeholder="Digite o nome do pesquisador"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            required
                            fullWidth
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
                            required
                            fullWidth
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
                            required
                            fullWidth
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
                            required
                            fullWidth
                        />

                        {/* Researcher Role */}
                        <Dropdown
                            label="Tipo de pesquisador"
                            placeholder="Selecione o tipo de pesquisador"
                            options={researcherRoleOptions}
                            value={role}
                            onChange={(value) => setRole(value as string)}
                            onBlur={() => handleBlur('role')}
                            validation={touched.role && errors.role ? 'error' : 'none'}
                            errorMessage={touched.role ? errors.role : undefined}
                            required
                            className="add-researcher-form__full-width"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="add-researcher-form__actions">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleCancel}
                            icon={<ArrowLeftIcon className="w-5 h-5" />}
                            iconPosition="left"
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                        >
                            Salvar pesquisador
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddResearcherForm;
