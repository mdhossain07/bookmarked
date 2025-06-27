// Pagination utility types and helpers
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Helper function types for pagination calculations
export type CalculatePaginationFn = (
  total: number,
  page: number,
  limit: number
) => {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
};

// Common pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  sortOrder: 'desc' as const,
} as const;

// Pagination query parameters interface
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
