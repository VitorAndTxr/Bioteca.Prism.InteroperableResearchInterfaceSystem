import { BaseService, type MiddlewareServices } from '../BaseService';

import type {
    PaginatedResponse,
    SnomedBodyRegion,
    AddSnomedBodyRegionPayload,
    SnomedBodyStructure,
    AddSnomedBodyStructurePayload,
    SnomedTopographicalModifier,
    ClinicalCondition,
    SnomedClinicalEvent,
    SnomedMedication,
    SnomedAllergyIntolerance
} from '@iris/domain';


export class SnomedService extends BaseService {
    private readonly USE_MOCK = true;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'SnomedService',
            debug: true // Enable for development
        });
    }

    /**
     * Get paginated list of BodyRegion
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated BodyRegion list with metadata
     */
    async getBodyRegionPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedBodyRegion>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedBodyRegion[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `BR-${page}-${i}`,
                        displayName: `Mock Body Region ${page}-${i}`,
                        description: `Description for Mock Body Region ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching body regions (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedBodyRegion>>({
                path: `/api/SNOMED/BodyRegion/GetAllBodyRegionsPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
                });
    
            // Debug: Log full decrypted response
            console.log('[SnomedService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} body regions`);

            // Convert middleware response to domain types
            const bodyRegions = response.data ||[];

            return {
                data: bodyRegions,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || bodyRegions.length,
                totalRecords: response.totalRecords || bodyRegions.length
            };
        });
    }

    async createBodyRegion(
        bodyRegion: AddSnomedBodyRegionPayload
    ): Promise<SnomedBodyRegion> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        snomedCode: bodyRegion.snomedCode,
                        displayName: bodyRegion.displayName,
                        description: bodyRegion.description
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Creating new body region with code: ${bodyRegion.snomedCode}`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Call backend API to create the body region
            const response = await this.middleware.invoke<AddSnomedBodyRegionPayload, SnomedBodyRegion>({
                path: `/api/SNOMED/BodyRegion/New`,
                method: 'POST',
                payload: bodyRegion
            });

            this.log(`Created body region with code: ${response.snomedCode}`);

            return response;
        });
    }



    async getActiveBodyRegions(): Promise<SnomedBodyRegion[]> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { snomedCode: 'BR-001', displayName: 'Mock Active Region 1', description: 'Desc 1' },
                        { snomedCode: 'BR-002', displayName: 'Mock Active Region 2', description: 'Desc 2' }
                    ]);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Fetching active body regions');

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Call backend API to get active body regions
            const response = await this.middleware.invoke<Record<string, unknown>, SnomedBodyRegion[]>({
                path: `/api/SNOMED/BodyRegion/GetActiveBodyRegions`,
                method: 'GET',
                payload: {}
            });

            this.log(`Retrieved ${response.length} active body regions`);

            return response;
        });
    }

    async getBodyStructurePaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedBodyStructure>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedBodyStructure[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `BS-${page}-${i}`,
                        displayName: `Mock Body Structure ${page}-${i}`,
                        description: `Description for Mock Body Structure ${page}-${i}`,
                        structureType: 'Mock Type',
                        parentRegion: {
                            snomedCode: `BR-${page}-${i}`,
                            displayName: `Parent Region ${page}-${i}`,
                            description: `Parent Description`
                        }
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching body structures (page: ${page}, pageSize: ${pageSize})`);
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            // Call backend API with pagination

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedBodyStructure>>({
                path: `/api/SNOMED/BodyStructure/GetAllBodyStructuresPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            }); 
            // Debug: Log full decrypted response
            console.log('[SnomedService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2))
            this.log(`Retrieved ${response.data?.length || 0} body structures`)
            // Convert middleware response to domain types
            // Here we assume the response data is already in the correct format    
            // If conversion is needed, implement it similarly to body regions
            // For now, we directly use the response data
            const bodyStructures = response.data ||[];
            return {
                data: bodyStructures,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || bodyStructures.length,
                totalRecords: response.totalRecords || bodyStructures.length
            };
        });
    }

    async createBodyStructure(
        bodyStructure: AddSnomedBodyStructurePayload
    ): Promise<SnomedBodyStructure> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        snomedCode: bodyStructure.snomedCode,
                        displayName: bodyStructure.displayName,
                        description: bodyStructure.description,
                        structureType: bodyStructure.type,
                        parentRegion: {
                            snomedCode: bodyStructure.bodyRegionCode,
                            displayName: 'Mock Parent Region',
                            description: 'Mock Description'
                        }
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating body structure');

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Call backend API to create the body structure
            const response = await this.middleware.invoke<AddSnomedBodyStructurePayload, SnomedBodyStructure>({
                path: `/api/SNOMED/BodyStructure/New`,
                method: 'POST',
                payload: bodyStructure
            });

            this.log(`Created body structure with code: ${response.snomedCode}`);

            return response;
        });
    }

    async getActiveBodyStructures(): Promise<SnomedBodyStructure[]> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        {
                            snomedCode: 'BS-001',
                            displayName: 'Mock Active Structure 1',
                            description: 'Desc 1',
                            structureType: 'Type A',
                            parentRegion: { snomedCode: 'BR-001', displayName: 'Region 1', description: 'Desc' }
                        },
                        {
                            snomedCode: 'BS-002',
                            displayName: 'Mock Active Structure 2',
                            description: 'Desc 2',
                            structureType: 'Type B',
                            parentRegion: { snomedCode: 'BR-002', displayName: 'Region 2', description: 'Desc' }
                        }
                    ]);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Fetching active body structures');

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Call backend API to get active body structures
            const response = await this.middleware.invoke<Record<string, unknown>, SnomedBodyStructure[]>({
                path: `/api/SNOMED/BodyStructure/GetActiveBodyStructures`,
                method: 'GET',
                payload: {}
            });

            this.log(`Retrieved ${response.length} active body structures`);

            return response;
        });
    }


    async getActiveTopographicalModifiers(): Promise<SnomedTopographicalModifier[]> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { snomedCode: 'TM-001', displayName: 'Mock Modifier 1', category: 'Cat 1', description: 'Desc 1' },
                        { snomedCode: 'TM-002', displayName: 'Mock Modifier 2', category: 'Cat 2', description: 'Desc 2' }
                    ]);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Fetching active topographical modifiers');
            // Ensure we have an authenticated session
            await this.ensureSession();

            // Call backend API to get active topographical modifiers
            const response = await this.middleware.invoke<Record<string, unknown>, SnomedTopographicalModifier[]>({
                path: `/api/SNOMED/TopographicalModifier/GetActiveTopographicalModifiers`, 
                method: 'GET',
                payload: {}
            }); 
            this.log(`Retrieved ${response.length} active topographical modifiers`);
            return response;
        });
    }   

    async createTopographicalModifier(
        topographicalModifier: SnomedTopographicalModifier
    ): Promise<SnomedTopographicalModifier> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(topographicalModifier);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating topographical modifier');
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Call backend API to create the topographical modifier
            const response = await this.middleware.invoke<SnomedTopographicalModifier, SnomedTopographicalModifier>({
                path: `/api/SNOMED/TopographicalModifier/New`,
                method: 'POST',
                payload: topographicalModifier
            });

            this.log(`Created topographical modifier with code: ${response.snomedCode}`);
            return response;
        });
    }

    async getTopographicalModifiersPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedTopographicalModifier>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedTopographicalModifier[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `TM-${page}-${i}`,
                        displayName: `Mock Modifier ${page}-${i}`,
                        category: 'Mock Category',
                        description: `Description for Mock Modifier ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching topographical modifiers (page: ${page}, pageSize: ${pageSize})`);    
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()   
            });
            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedTopographicalModifier>>({
                path: `/api/SNOMED/TopographicalModifier/GetAllTopographicalModifiersPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.data?.length} topographical modifiers (page: ${page})`);
            return response;
        });
    }   


    async getActiveClinicalConditions(): Promise<ClinicalCondition[]> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { snomedCode: 'CC-001', displayName: 'Mock Condition 1', description: 'Desc 1' },
                        { snomedCode: 'CC-002', displayName: 'Mock Condition 2', description: 'Desc 2' }
                    ]);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Fetching active clinical conditions');
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Call backend API to get active clinical conditions
            const response = await this.middleware.invoke<Record<string, unknown>, ClinicalCondition[]>({
                path: `/api/SNOMED/ClinicalCondition/GetActiveClinicalConditions`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.length} active clinical conditions`);
            return response;
        });
    }

    async createClinicalCondition(
        clinicalCondition: ClinicalCondition
    ): Promise<ClinicalCondition> { 
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(clinicalCondition);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating clinical condition');
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Call backend API to create the clinical condition
            const response = await this.middleware.invoke<ClinicalCondition, ClinicalCondition>({  
                path: `/api/SNOMED/ClinicalCondition/New`,
                method: 'POST',
                payload: clinicalCondition
            });
            this.log(`Created clinical condition with SNOMED code: ${response.snomedCode}`);
            return response;
        });
    }

    async getClinicalConditionsPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<ClinicalCondition>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: ClinicalCondition[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `CC-${page}-${i}`,
                        displayName: `Mock Condition ${page}-${i}`,
                        description: `Description for Mock Condition ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching clinical conditions (page: ${page}, pageSize: ${pageSize})`);
            // Ensure we have an authenticated session
            await this.ensureSession();
            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ClinicalCondition>>({
                path: `/api/SNOMED/ClinicalCondition/GetAllClinicalConditionsPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.data?.length} clinical conditions (page: ${page})`);
            return response;
        });
    }

    async getClinicalEventsPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedClinicalEvent>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedClinicalEvent[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `CE-${page}-${i}`,
                        displayName: `Mock Clinical Event ${page}-${i}`,
                        description: `Description for Mock Clinical Event ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching clinical events (page: ${page}, pageSize: ${pageSize})`);
            await this.ensureSession();
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedClinicalEvent>>({
                path: `/api/SNOMED/ClinicalEvent/GetAllClinicalEventsPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.data?.length} clinical events (page: ${page})`);
            return response;
        });
    }

    async createClinicalEvent(
        clinicalEvent: SnomedClinicalEvent
    ): Promise<SnomedClinicalEvent> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(clinicalEvent);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating clinical event');
            await this.ensureSession();
            const response = await this.middleware.invoke<SnomedClinicalEvent, SnomedClinicalEvent>({
                path: `/api/SNOMED/ClinicalEvent/New`,
                method: 'POST',
                payload: clinicalEvent
            });
            this.log(`Created clinical event with SNOMED code: ${response.snomedCode}`);
            return response;
        });
    }

    async getMedicationsPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedMedication>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedMedication[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `MED-${page}-${i}`,
                        displayName: `Mock Medication ${page}-${i}`,
                        description: `Description for Mock Medication ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching medications (page: ${page}, pageSize: ${pageSize})`);
            await this.ensureSession();
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedMedication>>({
                path: `/api/SNOMED/Medication/GetAllMedicationsPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.data?.length} medications (page: ${page})`);
            return response;
        });
    }

    async createMedication(
        medication: SnomedMedication
    ): Promise<SnomedMedication> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(medication);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating medication');
            await this.ensureSession();
            const response = await this.middleware.invoke<SnomedMedication, SnomedMedication>({
                path: `/api/SNOMED/Medication/New`,
                method: 'POST',
                payload: medication
            });
            this.log(`Created medication with SNOMED code: ${response.snomedCode}`);
            return response;
        });
    }

    async getAllergyIntolerancesPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<SnomedAllergyIntolerance>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData: SnomedAllergyIntolerance[] = Array(pageSize).fill(null).map((_, i) => ({
                        snomedCode: `AI-${page}-${i}`,
                        displayName: `Mock Allergy ${page}-${i}`,
                        description: `Description for Mock Allergy ${page}-${i}`
                    }));
                    resolve({
                        data: mockData,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching allergy/intolerances (page: ${page}, pageSize: ${pageSize})`);
            await this.ensureSession();
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SnomedAllergyIntolerance>>({
                path: `/api/SNOMED/AllergyIntolerance/GetAllAllergyIntolerancesPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });
            this.log(`Retrieved ${response.data?.length} allergy/intolerances (page: ${page})`);
            return response;
        });
    }

    async createAllergyIntolerance(
        allergyIntolerance: SnomedAllergyIntolerance
    ): Promise<SnomedAllergyIntolerance> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(allergyIntolerance);
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating allergy/intolerance');
            await this.ensureSession();
            const response = await this.middleware.invoke<SnomedAllergyIntolerance, SnomedAllergyIntolerance>({
                path: `/api/SNOMED/AllergyIntolerance/New`,
                method: 'POST',
                payload: allergyIntolerance
            });
            this.log(`Created allergy/intolerance with SNOMED code: ${response.snomedCode}`);
            return response;
        });
    }
}