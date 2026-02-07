/**
 * VolunteerSelectionModal Component
 *
 * Modal dialog for enrolling existing volunteers into a research project.
 * Displays non-participating volunteers with multi-select using check icons.
 *
 * Based on Figma design node 6998-5170.
 */

import React, { useState, useEffect } from 'react';
import Modal from '@/design-system/components/modal/Modal';
import { Button } from '@/design-system/components/button';
import { CheckCircleIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { type Volunteer } from '@iris/domain';
import { volunteerService, researchService } from '@/services/middleware';
import './VolunteerSelectionModal.css';

export interface VolunteerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    researchId: string;
    currentVolunteerIds: string[];
    onEnrollmentComplete: () => void;
}

export function VolunteerSelectionModal({
    isOpen,
    onClose,
    researchId,
    currentVolunteerIds,
    onEnrollmentComplete,
}: VolunteerSelectionModalProps) {
    const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadVolunteers();
            setSelectedIds(new Set());
            setError(null);
        }
    }, [isOpen]);

    const loadVolunteers = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.getVolunteersPaginated(1, 1000);
            setAllVolunteers(response.data || []);
        } catch (err) {
            console.error('Failed to load volunteers:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar voluntários');
        } finally {
            setLoading(false);
        }
    };

    const nonParticipatingVolunteers = allVolunteers.filter(
        v => !currentVolunteerIds.includes(v.id)
    );

    const toggleVolunteer = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleAccept = async () => {
        if (selectedIds.size === 0) {
            setError('Selecione ao menos um voluntário');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const consentDate = new Date().toISOString().split('T')[0];

            for (const volunteerId of selectedIds) {
                await researchService.enrollVolunteer(researchId, {
                    volunteerId,
                    consentDate,
                    consentVersion: '1.0',
                });
            }

            onEnrollmentComplete();
        } catch (err) {
            console.error('Failed to enroll volunteers:', err);
            setError(err instanceof Error ? err.message : 'Erro ao incluir voluntários');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adicionar voluntário a pesquisa"
            size="medium"
            showCloseButton={false}
        >
            <div className="volunteer-selection">
                {error && (
                    <div className="volunteer-selection__error">
                        {error}
                    </div>
                )}

                <div className="volunteer-selection__accordion">
                    <button
                        type="button"
                        className="volunteer-selection__accordion-header"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span>Voluntários não participantes</span>
                        <ChevronDownIcon
                            className={`volunteer-selection__chevron ${expanded ? 'volunteer-selection__chevron--open' : ''}`}
                        />
                    </button>

                    {expanded && (
                        <div className="volunteer-selection__list">
                            {loading && (
                                <div className="volunteer-selection__empty">
                                    Carregando...
                                </div>
                            )}

                            {!loading && nonParticipatingVolunteers.length === 0 && (
                                <div className="volunteer-selection__empty">
                                    Nenhum voluntário disponível
                                </div>
                            )}

                            {!loading && nonParticipatingVolunteers.map(volunteer => {
                                const isSelected = selectedIds.has(volunteer.id);
                                return (
                                    <button
                                        key={volunteer.id}
                                        type="button"
                                        className={`volunteer-selection__item ${isSelected ? 'volunteer-selection__item--selected' : ''}`}
                                        onClick={() => toggleVolunteer(volunteer.id)}
                                        disabled={submitting}
                                    >
                                        <div className="volunteer-selection__item-left">
                                            {isSelected && (
                                                <CheckCircleIcon className="volunteer-selection__check-icon" />
                                            )}
                                            {!isSelected && (
                                                <div className="volunteer-selection__check-placeholder" />
                                            )}
                                            <span className="volunteer-selection__item-name">
                                                {volunteer.name}
                                            </span>
                                        </div>
                                        <span className="volunteer-selection__item-id">
                                            {volunteer.id.slice(0, 5)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="iris-modal__actions">
                    <Button
                        variant="primary"
                        size="medium"
                        icon={<CheckCircleIcon />}
                        iconPosition="left"
                        onClick={handleAccept}
                        disabled={submitting || selectedIds.size === 0}
                        loading={submitting}
                    >
                        Aceitar
                    </Button>
                    <Button
                        variant="outline"
                        size="medium"
                        icon={<XCircleIcon />}
                        iconPosition="left"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Rejeitar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default VolunteerSelectionModal;
