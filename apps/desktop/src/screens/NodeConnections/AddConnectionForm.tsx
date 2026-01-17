/**
 * AddConnectionForm Component
 *
 * Form for creating, viewing, or editing a node connection.
 * Uses the NodeConnectionService to manage connections in the IRN backend.
 *
 * Features:
 * - Three modes: add (create new), view (read-only), edit (modify existing)
 * - Node name input
 * - Node URL input
 * - Access level selection
 * - Form validation
 */

import { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import { Input } from '../../design-system/components/input';
import { Dropdown } from '../../design-system/components/dropdown';
import { Button } from '../../design-system/components/button';
import { ArrowUturnLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { mainMenuItems } from '../../config/menu';
import { NodeAccessLevel, AuthorizationStatus, type NewNodeConnectionData, type ResearchNodeConnection } from '@iris/domain';
import { nodeConnectionService } from '../../services/middleware';
import '../../styles/shared/AddForm.css';

export type FormMode = 'add' | 'view' | 'edit';

export interface AddConnectionFormProps {
    handleNavigation: (path: string) => void;
    mode?: FormMode;
    connection?: ResearchNodeConnection;
    onSave?: (connectionData: NewNodeConnectionData) => void;
    onCancel?: () => void;
}

export function AddConnectionForm({ handleNavigation, mode = 'add', connection, onSave }: AddConnectionFormProps) {
    // Form state
    const [nodeName, setNodeName] = useState('');
    const [nodeUrl, setNodeUrl] = useState('');
    const [nodeAccessLevel, setNodeAccessLevel] = useState<string>('');
    const [status, setStatus] = useState<string>('pending');

    // Additional fields from Figma (informational only for now)
    const [contactInfo, setContactInfo] = useState('');
    const [certificate, setCertificate] = useState('');
    const [certificateSignature, setCertificateSignature] = useState('');
    const [institutionDetails, setInstitutionDetails] = useState('');

    // Determine if form is read-only
    const isReadOnly = mode === 'view';

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Initialize form data when connection is provided (view/edit modes)
    useEffect(() => {
        if (connection && (mode === 'view' || mode === 'edit')) {
            setNodeName(connection.nodeName);
            setNodeUrl(connection.nodeUrl);
            setNodeAccessLevel(connection.nodeAccessLevel);
            setStatus(connection.status);
        }
    }, [connection, mode]);

    // Header title based on mode
    const getHeaderTitle = (): string => {
        switch (mode) {
            case 'view':
                return 'Detalhes da conexão';
            case 'edit':
                return 'Editar conexão';
            case 'add':
            default:
                return 'Nova conexão';
        }
    };

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

        // View mode should not submit
        if (mode === 'view') {
            return;
        }

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

        try {
            setSubmitting(true);
            setSubmitError(null);

            if (mode === 'edit' && connection) {
                // Edit mode: update existing connection
                // TODO: Implement update method in NodeConnectionService when backend endpoint is available
                console.log('Updating node connection:', connection.id, connectionData);
                // For now, just navigate back - update API not yet implemented
                console.warn('Update API not yet implemented. Changes not saved.');
            } else {
                // Add mode: create new connection
                console.log('Creating node connection:', connectionData);
                const createdConnection = await nodeConnectionService.createNodeConnection(connectionData);
                console.log('Node connection created successfully:', createdConnection);
            }

            // Navigate back to connections list
            handleNavigation('/nodeConnections');
        } catch (err) {
            console.error('Failed to save node connection:', err);
            const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar conexão';
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
                title: getHeaderTitle(),
                showUserMenu: false,
                primaryAction: {
                    label: 'Voltar',
                    icon: <ArrowUturnLeftIcon className="w-5 h-5" />,
                    onClick: handleCancel,
                    variant: 'outline',
                },
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
                        {/* Row 1: Nome and URL */}
                        <Input
                            label="Nome"
                            placeholder="Input placeholder"
                            value={nodeName}
                            onChange={(e) => setNodeName(e.target.value)}
                            onBlur={() => handleBlur('nodeName')}
                            validationStatus={touched.nodeName && errors.nodeName ? 'error' : 'none'}
                            errorMessage={touched.nodeName ? errors.nodeName : undefined}
                            disabled={isReadOnly}
                            required={!isReadOnly}
                        />
                        <Input
                            label="URL"
                            placeholder="Input placeholder"
                            value={nodeUrl}
                            onChange={(e) => setNodeUrl(e.target.value)}
                            onBlur={() => handleBlur('nodeUrl')}
                            validationStatus={touched.nodeUrl && errors.nodeUrl ? 'error' : 'none'}
                            errorMessage={touched.nodeUrl ? errors.nodeUrl : undefined}
                            disabled={isReadOnly}
                            required={!isReadOnly}
                        />

                        {/* Row 2: Status and Nível de acesso */}
                        <Dropdown
                            label="Status"
                            placeholder="Input placeholder"
                            options={statusOptions}
                            value={status}
                            disabled
                        />
                        <Dropdown
                            label="Nível de acesso"
                            placeholder="Input placeholder"
                            options={accessLevelOptions}
                            value={nodeAccessLevel}
                            onChange={(value) => setNodeAccessLevel(Array.isArray(value) ? value[0] : value)}
                            onBlur={() => handleBlur('nodeAccessLevel')}
                            validation={touched.nodeAccessLevel && errors.nodeAccessLevel ? 'error' : 'none'}
                            errorMessage={touched.nodeAccessLevel ? errors.nodeAccessLevel : undefined}
                            disabled={isReadOnly}
                            required={!isReadOnly}
                        />

                        {/* Row 3: Informações de contato and Certificado */}
                        <Input
                            label="Informações de contato"
                            placeholder="Input placeholder"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <Input
                            label="Certificado"
                            placeholder="Input placeholder"
                            value={certificate}
                            onChange={(e) => setCertificate(e.target.value)}
                            disabled={isReadOnly}
                        />

                        {/* Row 4: Assinatura do certificado and Detalhes da instituição */}
                        <Input
                            label="Assinatura do certificado"
                            placeholder="Input placeholder"
                            value={certificateSignature}
                            onChange={(e) => setCertificateSignature(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <Input
                            label="Detalhes da instituição"
                            placeholder="Input placeholder"
                            value={institutionDetails}
                            onChange={(e) => setInstitutionDetails(e.target.value)}
                            disabled={isReadOnly}
                        />
                    </div>

                    {!isReadOnly && (
                        <div className="add-form__actions">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
                            >
                                {submitting ? 'Salvando...' : mode === 'edit' ? 'Atualizar conexão' : 'Salvar conexão'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}

export default AddConnectionForm;
