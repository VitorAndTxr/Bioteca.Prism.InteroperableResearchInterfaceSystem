/**
 * AddConnectionForm Component
 *
 * Form for creating a new node connection.
 * Uses the NodeConnectionService to create connections in the IRN backend.
 *
 * Features:
 * - Node name input
 * - Node URL input
 * - Access level selection
 * - Form validation
 */

import { useState, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { NodeAccessLevel, type NewNodeConnectionData } from '@iris/domain';
import { nodeConnectionService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export interface AddConnectionFormProps {
    handleNavigation: (path: string) => void;
    onSave?: (connectionData: NewNodeConnectionData) => void;
    onCancel?: () => void;
}

export function AddConnectionForm({ handleNavigation, onSave }: AddConnectionFormProps) {
    // Form state
    const [nodeName, setNodeName] = useState('');
    const [nodeUrl, setNodeUrl] = useState('');
    const [nodeAccessLevel, setNodeAccessLevel] = useState<string>('');

    // Additional fields from Figma (informational only for now)
    const [contactInfo, setContactInfo] = useState('');
    const [certificate, setCertificate] = useState('');
    const [certificateSignature, setCertificateSignature] = useState('');
    const [institutionDetails, setInstitutionDetails] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Access level options for dropdown
    const accessLevelOptions = [
        { value: NodeAccessLevel.PUBLIC, label: 'Público' },
        { value: NodeAccessLevel.PRIVATE, label: 'Privado' },
        { value: NodeAccessLevel.RESTRICTED, label: 'Restrito' },
    ];

    // Status options (display only - backend handles status)
    const statusOptions = [
        { value: 'pending', label: 'Pendente' },
        { value: 'authorized', label: 'Autorizado' },
        { value: 'revoked', label: 'Revogado' },
    ];

    // Mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!nodeName.trim()) {
            newErrors.nodeName = 'Nome é obrigatório';
        } else if (nodeName.length > 200) {
            newErrors.nodeName = 'Nome deve ter no máximo 200 caracteres';
        }

        if (!nodeUrl.trim()) {
            newErrors.nodeUrl = 'URL é obrigatória';
        } else {
            try {
                new URL(nodeUrl);
            } catch {
                newErrors.nodeUrl = 'URL inválida';
            }
        }

        if (!nodeAccessLevel) {
            newErrors.nodeAccessLevel = 'Nível de acesso é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark required fields as touched
        setTouched({
            nodeName: true,
            nodeUrl: true,
            nodeAccessLevel: true,
        });

        if (!validateForm()) {
            return;
        }

        const connectionData: NewNodeConnectionData = {
            nodeName: nodeName.trim(),
            nodeUrl: nodeUrl.trim(),
            nodeAccessLevel: nodeAccessLevel as NodeAccessLevel,
        };

        // If custom save handler provided, use it
        if (onSave) {
            onSave(connectionData);
            return;
        }

        // Otherwise, save via NodeConnectionService
        try {
            setSubmitting(true);
            setSubmitError(null);

            console.log('Creating node connection:', connectionData);
            const createdConnection = await nodeConnectionService.createNodeConnection(connectionData);
            console.log('Node connection created successfully:', createdConnection);

            // Navigate back to connections list
            handleNavigation('/nodeConnections');
        } catch (err) {
            console.error('Failed to create node connection:', err);
            const errorMessage = err instanceof Error ? err.message : 'Falha ao criar conexão';
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        handleNavigation('/nodeConnections');
    };

    return (
        <AppLayout
            sidebar={{
                items: mainMenuItems,
                activePath: '/nodeConnections',
                onNavigate: handleNavigation,
                logo: 'I.R.I.S.',
            }}
            header={{
                title: 'Nova conexão',
                showUserMenu: true,
            }}
        >
            <div className="add-form-container">
                <div className="add-form-header">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        icon={<ArrowLeftIcon className="w-5 h-5" />}
                    >
                        Voltar
                    </Button>
                </div>

                {submitError && (
                    <div className="add-form-error">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-form">
                    <div className="add-form-grid">
                        {/* Row 1: Nome and URL */}
                        <div className="add-form-field">
                            <Input
                                label="Nome"
                                placeholder="Nome do nó"
                                value={nodeName}
                                onChange={(e) => setNodeName(e.target.value)}
                                onBlur={() => handleBlur('nodeName')}
                                error={touched.nodeName ? errors.nodeName : undefined}
                                required
                            />
                        </div>
                        <div className="add-form-field">
                            <Input
                                label="URL"
                                placeholder="https://exemplo.com/api/node"
                                value={nodeUrl}
                                onChange={(e) => setNodeUrl(e.target.value)}
                                onBlur={() => handleBlur('nodeUrl')}
                                error={touched.nodeUrl ? errors.nodeUrl : undefined}
                                required
                            />
                        </div>

                        {/* Row 2: Status and Nível de acesso */}
                        <div className="add-form-field">
                            <Dropdown
                                label="Status"
                                placeholder="Selecione o status"
                                options={statusOptions}
                                value="pending"
                                disabled
                            />
                        </div>
                        <div className="add-form-field">
                            <Dropdown
                                label="Nível de acesso"
                                placeholder="Selecione o nível"
                                options={accessLevelOptions}
                                value={nodeAccessLevel}
                                onChange={setNodeAccessLevel}
                                onBlur={() => handleBlur('nodeAccessLevel')}
                                error={touched.nodeAccessLevel ? errors.nodeAccessLevel : undefined}
                                required
                            />
                        </div>

                        {/* Row 3: Informações de contato and Certificado */}
                        <div className="add-form-field">
                            <Input
                                label="Informações de contato"
                                placeholder="Email ou telefone de contato"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </div>
                        <div className="add-form-field">
                            <Input
                                label="Certificado"
                                placeholder="Certificado do nó"
                                value={certificate}
                                onChange={(e) => setCertificate(e.target.value)}
                            />
                        </div>

                        {/* Row 4: Assinatura do certificado and Detalhes da instituição */}
                        <div className="add-form-field">
                            <Input
                                label="Assinatura do certificado"
                                placeholder="Assinatura digital"
                                value={certificateSignature}
                                onChange={(e) => setCertificateSignature(e.target.value)}
                            />
                        </div>
                        <div className="add-form-field">
                            <Input
                                label="Detalhes da instituição"
                                placeholder="Informações adicionais"
                                value={institutionDetails}
                                onChange={(e) => setInstitutionDetails(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="add-form-actions">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Salvando...' : 'Salvar conexão'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default AddConnectionForm;
