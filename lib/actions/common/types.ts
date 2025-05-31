/**
 * lib/domains/common/types.ts
 * Shared interfaces and types used across multiple domains
 */

import { Prisma } from '@prisma/client';

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Base repository interface with common CRUD operations
 */
export interface BaseRepository<T extends BaseEntity, CreateInput, UpdateInput> {
	findById(id: string, ctx?: TransactionContext): Promise<T | null>;
	findMany(params?: any, ctx?: TransactionContext): Promise<T[]>;
	create(data: CreateInput, ctx?: TransactionContext): Promise<T>;
	update(id: string, data: UpdateInput, ctx?: TransactionContext): Promise<T>;
	delete(id: string, ctx?: TransactionContext): Promise<T>;
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
	orderBy?: string;
	orderDirection?: 'asc' | 'desc';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasMore?: boolean; // Whether there are more items to load (for infinite scroll)
	};
}

/**
 * Transaction context for database operations
 */
export type TransactionContext = {
	prisma?: Prisma.TransactionClient;
};

/**
 * Error codes for domain-specific errors
 */
export const ErrorCode = {
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	CONFLICT: 'CONFLICT',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Domain error type
 */
export type DomainError = {
	message: string;
	code: ErrorCode;
	details?: Record<string, any>;
};

/**
 * Create a domain error
 */
export function createDomainError(
	message: string, 
	code: ErrorCode, 
	details?: Record<string, any>
): DomainError & Error {
	const error = new Error(message) as Error & DomainError;
	error.name = 'DomainError';
	error.code = code;
	error.details = details;
	return error;
}

/**
 * Action types for limit checking
 */
export const ActionType = {
	UPLOAD_PRODUCT: 'UPLOAD_PRODUCT',
	CREATE_CATALOG: 'CREATE_CATALOG',
	UPLOAD_MODEL: 'UPLOAD_MODEL',
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType]; 