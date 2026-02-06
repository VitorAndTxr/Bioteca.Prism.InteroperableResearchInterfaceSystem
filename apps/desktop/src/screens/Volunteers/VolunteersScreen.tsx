/**
 * VolunteersScreen Component
 *
 * Main screen for displaying and managing volunteers (patients).
 * Uses the VolunteerService to fetch paginated data from the IRN backend.
 */

import { useState } from 'react';
import { AppLayout } from '../../design-system/components/app-layout';
import VolunteersList from './VolunteersList';
import { mainMenuItems } from '../../config/menu';
import Modal from '../../design-system/components/modal/Modal';
import { Button } from '../../design-system/components/button';
import { volunteerService } from '../../services/middleware';
import type { Volunteer } from '@iris/domain';

interface VolunteersScreenProps {
    handleNavigation: (path: string) => void;
    onSelectVolunteer?: (volunteer: Volunteer) => void;
}

function VolunteersScreen({ handleNavigation, onSelectVolunteer }: VolunteersScreenProps) {
    const [deleteTarget, setDeleteTarget] = useState<Volunteer | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleView = (volunteer: Volunteer) => {
        onSelectVolunteer?.(volunteer);
        handleNavigation(`/volunteers/view/${volunteer.id}`);
    };

    const handleEdit = (volunteer: Volunteer) => {
        onSelectVolunteer?.(volunteer);
        handleNavigation(`/volunteers/edit/${volunteer.id}`);
    };

    const handleDeleteRequest = (volunteer: Volunteer) => {
        setDeleteTarget(volunteer);
        setDeleteError(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            setDeleteError(null);

            await volunteerService.deleteVolunteer(deleteTarget.id);

            setDeleteTarget(null);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Failed to delete volunteer:', err);
            setDeleteError(err instanceof Error ? err.message : 'Falha ao excluir voluntário');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteTarget(null);
        setDeleteError(null);
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
                title: 'Voluntários',
                showUserMenu: true
            }}
        >
            <VolunteersList
                key={refreshKey}
                onVolunteerAdd={() => handleNavigation('/volunteers/add')}
                onVolunteerEdit={handleEdit}
                onVolunteerView={handleView}
                onVolunteerDelete={handleDeleteRequest}
            />

            <Modal
                isOpen={deleteTarget !== null}
                onClose={handleDeleteCancel}
                title="Excluir Voluntário"
                size="small"
            >
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 8px 0' }}>
                        Tem certeza que deseja excluir o voluntário?
                    </p>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                        {deleteTarget?.name}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#727272', fontSize: '14px' }}>
                        {deleteTarget?.email}
                    </p>
                </div>

                {deleteError && (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        border: '1px solid #fcc',
                        fontSize: '14px'
                    }}>
                        {deleteError}
                    </div>
                )}

                <p style={{ margin: '0 0 20px 0', color: '#727272', fontSize: '14px' }}>
                    Esta ação não pode ser desfeita.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={handleDeleteCancel}
                        disabled={deleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                        style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                    >
                        {deleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}

export default VolunteersScreen;
