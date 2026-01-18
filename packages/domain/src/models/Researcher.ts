export enum ResearcherRole {
    CHIEF = 'chief_researcher',
    RESEARCHER = 'researcher',
}

export interface Researcher{
    researcherId: string;
    researchNodeId: string;
    name: string;
    email: string;
    institution: string;
    role: ResearcherRole;
    orcid: string;
    researches?: ResearcherResearch[];
}

export interface ResearcherResearch{
    researchId: string;
    researchTitle: string;
    isPrincipal: boolean;
}

/**
 * New Researcher Data
 *
 * Data required to create a new researcher
 */
export interface NewResearcherData {
    name: string;
    email: string;
    institution: string;
    orcid: string;
    role: ResearcherRole;
    researchNodeId: string; // Optional - can be provided by backend
}

/**
 * Update Researcher Payload
 *
 * Data that can be updated on an existing researcher
 */
export interface UpdateResearcherPayload extends Record<string, unknown> {
    name?: string;
    email?: string;
    institution?: string;
    role?: string;
    orcid?: string;
}