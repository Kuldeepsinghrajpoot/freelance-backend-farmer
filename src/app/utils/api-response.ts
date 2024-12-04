import { ApiError } from "../types/api-reponse";

export class ApiResponse<T> {
    status: number;          // HTTP status code
           // Indicates if the API call was successful
    message?: string;        // Optional message providing additional details
    data?: T;                // Generic payload containing the response data
    error?: ApiError;        // Optional error information for unsuccessful responses

    constructor(status?:number, message?: string, data?: T, error?: ApiError) {
        this.message = message;
        this.data = data;
        this.error = error;
        this.status = status||200;
    }
}       