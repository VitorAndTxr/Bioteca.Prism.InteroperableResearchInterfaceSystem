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
 * Paginated Response
 *
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data?: T[];
    currentPage?: number;
    pageSize?: number;
    totalRecords?: number;
    totalPages?: number;
}