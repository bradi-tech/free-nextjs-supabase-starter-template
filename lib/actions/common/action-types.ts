/**
 * Standard server response type for server actions
 */
export interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Auth-related server responses
 */
export interface AuthResponse {
  message: string;
}

/**
 * Success response with message
 */
export interface SuccessResponse {
  success: boolean;
}

/**
 * Create the standard success response
 */
export function createSuccessResponse<T>(data: T, status = 200): ServerResponse<T> {
  return {
    success: true,
    data,
    status
  };
}

/**
 * Create the standard error response
 */
export function createErrorResponse(error: string, status = 500): ServerResponse<null> {
  return {
    success: false,
    error,
    status
  };
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(error = 'Authentication error'): ServerResponse<null> {
  return createErrorResponse(error, 401);
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(error = 'Not authorized to perform this action'): ServerResponse<null> {
  return createErrorResponse(error, 403);
}

/**
 * Create not found response
 */
export function createNotFoundResponse(resource = 'Resource'): ServerResponse<null> {
  return createErrorResponse(`${resource} not found`, 404);
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(error: string): ServerResponse<null> {
  return createErrorResponse(error, 400);
} 