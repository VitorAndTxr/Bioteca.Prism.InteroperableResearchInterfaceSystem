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