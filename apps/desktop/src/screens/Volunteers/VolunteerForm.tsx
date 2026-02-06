/**
 * VolunteerForm Component
 *
 * Form for viewing and editing volunteer (patient) details.
 * Supports view mode (read-only) and edit mode (editable).
 * Follows the same pattern as AddUserForm with mode prop.
 */

import { useState, FormEvent, useEffect } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import {
    VolunteerGender,
    BloodType,
    ConsentStatus,
    type Volunteer,
    type UpdateVolunteerData,
    type ClinicalCondition
} from '@iris/domain';
import { volunteerService, snomedService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

type FormMode = 'view' | 'edit';

export interface VolunteerFormProps {
    handleNavigation: (path: string) => void;
    mode: FormMode;
    volunteer?: Volunteer;
}

const genderOptions = [
    { value: VolunteerGender.MALE, label: 'Masculino' },
    { value: VolunteerGender.FEMALE, label: 'Feminino' },
    { value: VolunteerGender.OTHER, label: 'Outro' },
    { value: VolunteerGender.NOT_INFORMED, label: 'Não informar' },
];

const bloodTypeOptions = [
    { value: BloodType.A_POSITIVE, label: 'A+' },
    { value: BloodType.A_NEGATIVE, label: 'A-' },
    { value: BloodType.B_POSITIVE, label: 'B+' },
    { value: BloodType.B_NEGATIVE, label: 'B-' },
    { value: BloodType.AB_POSITIVE, label: 'AB+' },
    { value: BloodType.AB_NEGATIVE, label: 'AB-' },
    { value: BloodType.O_POSITIVE, label: 'O+' },
    { value: BloodType.O_NEGATIVE, label: 'O-' },
    { value: BloodType.UNKNOWN, label: 'Desconhecido' },
];

const consentStatusOptions = [
    { value: ConsentStatus.PENDING, label: 'Pendente' },
    { value: ConsentStatus.GRANTED, label: 'Concedido' },
    { value: ConsentStatus.REVOKED, label: 'Revogado' },
];

function formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function VolunteerForm({ handleNavigation, mode, volunteer }: VolunteerFormProps) {
    const isReadOnly = mode === 'view';

    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes do Voluntário';
            case 'edit':
                return 'Editar Voluntário';
        }
    };

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<string>('');
    const [volunteerCode, setVolunteerCode] = useState('');
    const [bloodType, setBloodType] = useState<string>('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [consentStatus, setConsentStatus] = useState<string>('');

    const [clinicalConditions, setClinicalConditions] = useState<ClinicalCondition[]>([]);
    const [loadingConditions, setLoadingConditions] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function loadConditions() {
            setLoadingConditions(true);
            try {
                const conditions = await snomedService.getActiveClinicalConditions();
                setClinicalConditions(conditions);
            } catch (err) {
                console.error('Failed to load clinical conditions:', err);
            } finally {
                setLoadingConditions(false);
            }
        }
        loadConditions();
    }, []);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (volunteer) {
            setName(volunteer.name);
            setEmail(volunteer.email);
            setBirthDate(formatDateForInput(volunteer.birthDate));
            setGender(volunteer.gender);
            setVolunteerCode(volunteer.volunteerCode);
            setBloodType(volunteer.bloodType || '');
            setHeight(volunteer.height?.toString() || '');
            setWeight(volunteer.weight?.toString() || '');
            setSelectedConditions(volunteer.medicalHistory ? volunteer.medicalHistory.split(';').filter(Boolean) : []);
            setConsentStatus(volunteer.consentStatus);
        }
    }, [volunteer]);

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

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

        if (height && (isNaN(Number(height)) || Number(height) <= 0 || Number(height) > 3)) {
            newErrors.height = 'Altura deve ser um valor entre 0 e 3 metros';
        }

        if (weight && (isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 500)) {
            newErrors.weight = 'Peso deve ser um valor entre 0 e 500 kg';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isReadOnly || !volunteer) {
            return;
        }

        setTouched({
            name: true,
            email: true,
            birthDate: true,
            gender: true,
        });

        if (!validateForm()) {
            return;
        }

        const updateData: UpdateVolunteerData = {
            name: name.trim(),
            email: email.trim(),
            birthDate: birthDate,
            gender: gender as VolunteerGender,
            bloodType: bloodType ? bloodType as BloodType : undefined,
            height: height ? Number(height) : undefined,
            weight: weight ? Number(weight) : undefined,
            medicalHistory: selectedConditions.length > 0 ? selectedConditions.join(';') : undefined,
            consentStatus: consentStatus as ConsentStatus,
        };

        try {
            setSubmitting(true);
            setSubmitError(null);

            await volunteerService.updateVolunteer(volunteer.id, updateData);

            handleNavigation('/volunteers');
        } catch (err) {
            console.error('Failed to update volunteer:', err);
            const errorMessage = err instanceof Error ? err.message : 'Falha ao atualizar voluntário';
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        handleNavigation('/volunteers');
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
                title: getHeaderTitle(),
                showUserMenu: true,
            }}
        >
            <div className="add-form">
                <form className="add-form__container" onSubmit={handleSubmit}>
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
                        <Input
                            label="Nome Completo"
                            placeholder="Nome completo do voluntário"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur('name')}
                            validationStatus={touched.name && errors.name ? 'error' : 'none'}
                            errorMessage={touched.name ? errors.name : undefined}
                            helperText={!isReadOnly ? `${name.length}/200 caracteres` : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Email do voluntário"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            validationStatus={touched.email && errors.email ? 'error' : 'none'}
                            errorMessage={touched.email ? errors.email : undefined}
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            onBlur={() => handleBlur('birthDate')}
                            validationStatus={touched.birthDate && errors.birthDate ? 'error' : 'none'}
                            errorMessage={touched.birthDate ? errors.birthDate : undefined}
                            disabled={isReadOnly}
                            required
                        />

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
                            disabled={isReadOnly}
                            required
                        />

                        <Input
                            label="Código do Voluntário"
                            value={volunteerCode}
                            onChange={(e) => setVolunteerCode(e.target.value)}
                            disabled
                            helperText="Gerado automaticamente"
                        />

                        <Dropdown
                            label="Tipo Sanguíneo"
                            placeholder="Selecione (opcional)"
                            options={bloodTypeOptions}
                            value={bloodType}
                            onChange={(value) => setBloodType(value as string)}
                            fullWidth
                            disabled={isReadOnly}
                        />

                        <Input
                            label="Altura (m)"
                            type="number"
                            placeholder="Ex: 1.75"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            onBlur={() => handleBlur('height')}
                            validationStatus={touched.height && errors.height ? 'error' : 'none'}
                            errorMessage={touched.height ? errors.height : undefined}
                            disabled={isReadOnly}
                        />

                        <Input
                            label="Peso (kg)"
                            type="number"
                            placeholder="Ex: 70"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            onBlur={() => handleBlur('weight')}
                            validationStatus={touched.weight && errors.weight ? 'error' : 'none'}
                            errorMessage={touched.weight ? errors.weight : undefined}
                            disabled={isReadOnly}
                        />

                        <Dropdown
                            label="Status do Consentimento"
                            placeholder="Selecione o status"
                            options={consentStatusOptions}
                            value={consentStatus}
                            onChange={(value) => setConsentStatus(value as string)}
                            fullWidth
                            disabled={isReadOnly}
                        />

                        <div className="add-form__full-width">
                            <Dropdown
                                label="Condições Médicas (SNOMED)"
                                placeholder={loadingConditions ? "Carregando condições..." : "Selecione as condições médicas"}
                                options={clinicalConditions.map(c => ({
                                    value: c.snomedCode,
                                    label: `${c.displayName} (${c.snomedCode})`,
                                }))}
                                value={selectedConditions}
                                onChange={(value) => setSelectedConditions(value as string[])}
                                mode="multiple"
                                searchable
                                fullWidth
                                disabled={isReadOnly || loadingConditions}
                            />
                        </div>
                    </div>

                    <div className="add-form__actions">
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleBack}
                            icon={<ArrowLeftIcon className="w-5 h-5" />}
                            iconPosition="left"
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        {!isReadOnly && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="big"
                                disabled={submitting}
                            >
                                {submitting ? 'Salvando...' : 'Atualizar Voluntário'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default VolunteerForm;
