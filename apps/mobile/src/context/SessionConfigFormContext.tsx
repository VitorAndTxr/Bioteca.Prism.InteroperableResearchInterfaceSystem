/**
 * Session Config Form Context
 *
 * Lifts SessionConfigScreen form state above the navigation stack so that
 * user selections survive screen unmount/remount during sub-screen navigation
 * (TopographySelect, ResearchList, FavoritesManage).
 *
 * Auto-resets all fields when the active clinical session ends (US-SP-017).
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
  FC,
} from 'react';
import type { Volunteer, SnomedTopographicalModifier } from '@iris/domain';
import { useSession } from '@/context/SessionContext';

interface SessionConfigFormState {
  selectedVolunteer: Volunteer | null;
  selectedBodyStructure: string;
  selectedTopographies: SnomedTopographicalModifier[];
  selectedResearchId: string;
  selectedResearchTitle: string;
  selectedDeviceId: string;
}

interface SessionConfigFormActions {
  setSelectedVolunteer: (volunteer: Volunteer | null) => void;
  setSelectedBodyStructure: (code: string) => void;
  setSelectedTopographies: (topographies: SnomedTopographicalModifier[]) => void;
  setSelectedResearchId: (id: string) => void;
  setSelectedResearchTitle: (title: string) => void;
  setSelectedDeviceId: (deviceId: string) => void;
  resetForm: () => void;
}

type SessionConfigFormContextValue = SessionConfigFormState & SessionConfigFormActions;

const INITIAL_FORM_STATE: SessionConfigFormState = {
  selectedVolunteer: null,
  selectedBodyStructure: '',
  selectedTopographies: [],
  selectedResearchId: '',
  selectedResearchTitle: '',
  selectedDeviceId: '',
};

const SessionConfigFormContext = createContext<SessionConfigFormContextValue | null>(null);

interface SessionConfigFormProviderProps {
  children: ReactNode;
}

export const SessionConfigFormProvider: FC<SessionConfigFormProviderProps> = ({ children }) => {
  const { activeSession } = useSession();

  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(INITIAL_FORM_STATE.selectedVolunteer);
  const [selectedBodyStructure, setSelectedBodyStructure] = useState<string>(INITIAL_FORM_STATE.selectedBodyStructure);
  const [selectedTopographies, setSelectedTopographies] = useState<SnomedTopographicalModifier[]>(INITIAL_FORM_STATE.selectedTopographies);
  const [selectedResearchId, setSelectedResearchId] = useState<string>(INITIAL_FORM_STATE.selectedResearchId);
  const [selectedResearchTitle, setSelectedResearchTitle] = useState<string>(INITIAL_FORM_STATE.selectedResearchTitle);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(INITIAL_FORM_STATE.selectedDeviceId);

  const resetForm = useCallback(() => {
    setSelectedVolunteer(INITIAL_FORM_STATE.selectedVolunteer);
    setSelectedBodyStructure(INITIAL_FORM_STATE.selectedBodyStructure);
    setSelectedTopographies(INITIAL_FORM_STATE.selectedTopographies);
    setSelectedResearchId(INITIAL_FORM_STATE.selectedResearchId);
    setSelectedResearchTitle(INITIAL_FORM_STATE.selectedResearchTitle);
    setSelectedDeviceId(INITIAL_FORM_STATE.selectedDeviceId);
  }, []);

  // Auto-reset form when active session ends (S1: placed inside provider for reliability)
  const prevSessionRef = useRef(activeSession);
  useEffect(() => {
    if (prevSessionRef.current && !activeSession) {
      resetForm();
    }
    prevSessionRef.current = activeSession;
  }, [activeSession, resetForm]);

  const value = useMemo<SessionConfigFormContextValue>(
    () => ({
      selectedVolunteer,
      setSelectedVolunteer,
      selectedBodyStructure,
      setSelectedBodyStructure,
      selectedTopographies,
      setSelectedTopographies,
      selectedResearchId,
      setSelectedResearchId,
      selectedResearchTitle,
      setSelectedResearchTitle,
      selectedDeviceId,
      setSelectedDeviceId,
      resetForm,
    }),
    [
      selectedVolunteer,
      selectedBodyStructure,
      selectedTopographies,
      selectedResearchId,
      selectedResearchTitle,
      selectedDeviceId,
      resetForm,
    ]
  );

  return (
    <SessionConfigFormContext.Provider value={value}>
      {children}
    </SessionConfigFormContext.Provider>
  );
};

export function useSessionConfigForm(): SessionConfigFormContextValue {
  const context = useContext(SessionConfigFormContext);
  if (!context) {
    throw new Error('useSessionConfigForm must be used within SessionConfigFormProvider');
  }
  return context;
}
