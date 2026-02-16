/**
 * Navigation Type Definitions
 *
 * Defines the parameter lists for all navigators in the app.
 * Used for type-safe navigation throughout the application.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack Navigator
 * Top-level navigator handling authentication flow
 */
export type RootStackParamList = {
  Login: { sessionExpiredMessage?: string } | undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  History: undefined;
  Bluetooth: undefined;
  Settings: undefined;
};

/**
 * Projection of a selected topographical modifier.
 * Carries all info needed for display and filtering (including Lateralidade constraint).
 */
export interface SelectedModifier {
  snomedCode: string;
  displayName: string;
  category: string;
}

/**
 * Home Stack Navigator
 * Nested stack within the Home tab for session workflows and research management
 */
export type HomeStackParamList = {
  SessionConfig: { updatedTopographies?: SelectedModifier[] } | undefined;
  TopographySelect: { selectedModifiers: SelectedModifier[] };
  ActiveSession: { sessionId: string };
  Capture: { sessionId: string };
  AnnotationsList: { sessionId: string };
  NewAnnotation: { sessionId: string };
  // Research management flow
  ResearchList: undefined;
  ResearchDetail: { researchId: string };
  ResearchResearchers: { researchId: string };
  ResearchVolunteers: { researchId: string };
  ResearchApplications: { researchId: string };
  ResearchDevices: { researchId: string };
  ResearchDeviceSensors: { researchId: string; deviceId: string; deviceName: string };
  ApplicationForm: { researchId: string; applicationId?: string };
  EnrollVolunteerForm: { researchId: string };
  FavoritesManage: undefined;
};
