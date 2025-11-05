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