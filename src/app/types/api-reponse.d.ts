// apiResponses.d.ts

// General API Response Structure
export interface ApiResponse<T> {
    success: boolean;         // Indicates if the API call was successful
    message?: string;         // Optional message providing additional details
    data?: T;                 // Generic payload containing the response data
    // error?: ApiError;         // Optional error information for unsuccessful responses
}

// Error Information
export interface ApiError {
    code: string;             // Error code for identification
    details?: string;         // Additional details about the error
}

// Example: User Data Response
export interface User {
    id: string;               // Unique identifier for the user
    name: string;             // Full name of the user
    email: string;            // Email address
    isActive: boolean;        // Indicates if the user account is active
}

// Example: Paginated Response Structure
export interface PaginatedResponse<T> {
    items: T[];               // List of items
    total: number;            // Total number of items
    page: number;             // Current page number
    pageSize: number;         // Number of items per page
}

// Example: Specific Response Types
export type UserListResponse = ApiResponse<PaginatedResponse<User>>;
export type UserDetailResponse = ApiResponse<User>;
