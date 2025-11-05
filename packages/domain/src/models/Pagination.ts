/**
 * Pagination Request
 *
 * Matches backend RequestPaging structure
 */
export interface PaginationRequest {
    page: number;
    pageSize: number;
}

/**
 * Pagination Response
 *
 * Matches backend ResponsePaging structure
 */
export interface PaginationResponse {
    currentRecord: number;
    pageSize: number;
    totalRecords: number;
}

/**
 * Paginated Response
 *
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationResponse;
}