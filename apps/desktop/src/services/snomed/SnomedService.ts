import { BaseService, type MiddlewareServices } from '../BaseService';

import type {
    PaginatedResponse,
    SnomedBodyRegion,
    AddSnomedBodyRegionPayload,
    SnomedBodyStructure,
    AddSnomedBodyStructurePayload
} from '@iris/domain';


export class SnomedService extends BaseService {
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
                path: `/api/SNOMED/BodyRegion/GetAllBodyRegionsPaginate?${queryParams.toString()}`,
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
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || bodyRegions.length,
                totalRecords: response.totalRecords || bodyRegions.length
            };
        });
    }

    async createBodyRegion(
        bodyRegion: AddSnomedBodyRegionPayload
    ): Promise<SnomedBodyRegion> {
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
                path: `/api/SNOMED/BodyStructure/GetAllBodyStructuresPaginate?${queryParams.toString()}`,
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
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || bodyStructures.length,
                totalRecords: response.totalRecords || bodyStructures.length
            };
        });
    }

    async createBodyStructure(
        bodyStructure: AddSnomedBodyStructurePayload
    ): Promise<SnomedBodyStructure> {
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
}