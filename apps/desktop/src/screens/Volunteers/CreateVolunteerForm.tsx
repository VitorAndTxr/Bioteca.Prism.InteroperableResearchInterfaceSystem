/**
 * CreateVolunteerForm Component
 *
 * Form for creating a new volunteer (patient).
 * Uses the VolunteerService to create volunteers in the IRN backend.
 *
 * Features:
 * - Full name input
 * - Email input
 * - Birth date picker
 * - Gender selection
 * - Phone input (optional)
 * - Form validation
 */

import { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { VolunteerGender, type NewVolunteerData } from '@iris/domain';
import { volunteerService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export interface CreateVolunteerFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (volunteerData: NewVolunteerData) => void;
    onCancel?: () => void;
}

export function CreateVolunteerForm({ handleNavigation, onSave, onCancel }: CreateVolunteerFormProps) {
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<string>('');
    const [phone, setPhone] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Gender options for dropdown
    const genderOptions = [
        { value: VolunteerGender.MALE, label: 'Masculino' },
        { value: VolunteerGender.FEMALE, label: 'Feminino' },
        { value: VolunteerGender.OTHER, label: 'Outro' },
        { value: VolunteerGender.NOT_INFORMED, label: 'Não informar' },
    ];

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nome completo é obrigatório';
        } else if (name.length > 200) {
            newErrors.name = 'Nome deve ter no máximo 200 caracteres';
        }

        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = 'Formato de email inválido';
            }
        }

        if (!birthDate) {
            newErrors.birthDate = 'Data de nascimento é obrigatória';
        } else {
            const birth = new Date(birthDate);
            const today = new Date();
            if (birth > today) {
                newErrors.birthDate = 'Data de nascimento não pode ser no futuro';
            }
        }

        if (!gender) {
            newErrors.gender = 'Gênero é obrigatório';
        }

        // Phone is optional but validate format if provided
        if (phone && phone.length > 20) {
            newErrors.phone = 'Telefone deve ter no máximo 20 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            birthDate: true,
            gender: true,
            phone: true,
        });

        if (!validateForm()) {
            return;
        }

        const volunteerData: NewVolunteerData = {
            name: name.trim(),
            email: email.trim(),
            birthDate: birthDate,
            gender: gender as VolunteerGender,
            phone: phone.trim() || undefined,
        };

        // If custom save handler provided, use it
        if (onSave) {
            onSave(volunteerData);
            return;
        }

        // Otherwise, save via VolunteerService
        try {
            setSubmitting(true);
            setSubmitError(null);

            console.log('Creating volunteer:', volunteerData);
            const createdVolunteer = await volunteerService.createVolunteer(volunteerData);
            console.log('Volunteer created successfully:', createdVolunteer);

            // Navigate back to volunteers list
            handleNavigation('/volunteers');
        } catch (err) {
            console.error('Failed to create volunteer:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create volunteer';
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
            handleNavigation('/volunteers');
        }
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/volunteers',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Novo Voluntário',
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
                        {/* Full Name */}
                        <Input
                            label="Nome Completo"
                            placeholder="Digite o nome completo do voluntário"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={`${name.length}/200 caracteres`}
                            required
                        />

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Digite o email do voluntário"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            validationStatus={touched.email && errors.email ? 'error' : 'none'}
                            errorMessage={touched.email ? errors.email : undefined}
                            required
                        />

                        {/* Birth Date */}
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            onBlur={() => handleBlur('birthDate')}
                            validationStatus={touched.birthDate && errors.birthDate ? 'error' : 'none'}
                            errorMessage={touched.birthDate ? errors.birthDate : undefined}
                            required
                        />

                        {/* Gender */}
                        <Dropdown
                            label="Gênero"
                            placeholder="Selecione o gênero"
                            options={genderOptions}
                            value={gender}
                            onChange={(value) => setGender(value as string)}
                            onBlur={() => handleBlur('gender')}
                            validation={touched.gender && errors.gender ? 'error' : 'none'}
                            errorMessage={touched.gender ? errors.gender : undefined}
                            fullWidth
                            required
                        />

                        {/* Phone (optional) */}
                        <Input
                            label="Telefone"
                            type="tel"
                            placeholder="Digite o telefone (opcional)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            validationStatus={touched.phone && errors.phone ? 'error' : 'none'}
                            errorMessage={touched.phone ? errors.phone : undefined}
                            helperText="Campo opcional"
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
                            {submitting ? 'Salvando...' : 'Salvar Voluntário'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default CreateVolunteerForm;
