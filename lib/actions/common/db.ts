'use server';

/**
 * lib/domains/common/db.ts
 * Reusable database operations that work with any entity
 */

import { PrismaClient } from '@prisma/client';
import { BaseEntity, TransactionContext, ErrorCode, createDomainError } from './types';

/**
 * Generic find by ID operation
 */
export async function findById<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	id: string,
	ctx?: TransactionContext
): Promise<T | null> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].findUnique({
		where: { id }
	}) as Promise<T | null>;
}

/**
 * Generic find many operation
 */
export async function findMany<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	where: Record<string, any> = {},
	orderBy: Record<string, any> = { createdAt: 'desc' },
	ctx?: TransactionContext
): Promise<T[]> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].findMany({
		where,
		orderBy
	}) as Promise<T[]>;
}

/**
 * Generic create operation
 */
export async function create<T extends BaseEntity, CreateInput, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	data: CreateInput,
	ctx?: TransactionContext
): Promise<T> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].create({
		data
	}) as Promise<T>;
}

/**
 * Generic create many operation
 */
export async function createMany<T extends BaseEntity, CreateInput, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	data: CreateInput[],
	ctx?: TransactionContext
): Promise<number> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	const result = await client[model].createMany({
		data
	});
	return result.count;
}

/**
 * Generic update operation
 */
export async function update<T extends BaseEntity, UpdateInput, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	id: string,
	data: UpdateInput,
	ctx?: TransactionContext
): Promise<T> {
	const client = ctx?.prisma || prisma;

	try {
		// @ts-ignore - Dynamic model access
		return await client[model].update({
			where: { id },
			data
		}) as Promise<T>;
	} catch (error: any) {
		if (error.code === 'P2025') {
			throw createDomainError(`${String(model)} with ID ${id} not found`, ErrorCode.NOT_FOUND);
		}
		throw error;
	}
}

/**
 * Generic delete operation
 */
export async function deleteEntity<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	id: string,
	ctx?: TransactionContext
): Promise<T> {
	const client = ctx?.prisma || prisma;

	try {
		// @ts-ignore - Dynamic model access
		return await client[model].delete({
			where: { id }
		}) as Promise<T>;
	} catch (error: any) {
		if (error.code === 'P2025') {
			throw createDomainError(`${String(model)} with ID ${id} not found`, ErrorCode.NOT_FOUND);
		}
		throw error;
	}
}

/**
 * Generic find by ID operation with relations support
 */
export async function findByIdWithRelations<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	id: string,
	include: Record<string, any> = {},
	ctx?: TransactionContext
): Promise<T | null> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].findUnique({
		where: { id },
		include
	}) as Promise<T | null>;
}

/**
 * Generic find many operation with pagination and relations support
 */
export async function findManyWithRelations<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	options: {
		where?: Record<string, any>;
		orderBy?: Record<string, any>;
		include?: Record<string, any>;
		page?: number;
		pageSize?: number;
	},
	ctx?: TransactionContext
): Promise<T[]> {
	const client = ctx?.prisma || prisma;
	const { where = {}, orderBy = { createdAt: 'desc' }, include = {}, page = 1, pageSize = 10 } = options;

	// @ts-ignore - Dynamic model access
	return client[model].findMany({
		where,
		orderBy,
		relationLoadStrategy: 'join',
		include,
		skip: (page - 1) * pageSize,
		take: pageSize
	}) as Promise<T[]>;
}

/**
 * Generic find unique operation with custom where conditions
 */
export async function findUnique<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	where: Record<string, any>,
	include?: Record<string, any>,
	ctx?: TransactionContext
): Promise<T | null> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].findUnique({
		where,
		...(include && { include })
	}) as Promise<T | null>;
}

/**
 * Generic find first operation with custom where conditions
 */
export async function findFirst<T extends BaseEntity, M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	where: Record<string, any>,
	include?: Record<string, any>,
	ctx?: TransactionContext
): Promise<T | null> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].findFirst({
		where,
		...(include && { include })
	}) as Promise<T | null>;
}

/**
 * Get total count of records
 */
export async function count<M extends keyof PrismaClient & string>(
	prisma: PrismaClient,
	model: M,
	where: Record<string, any> = {},
	ctx?: TransactionContext
): Promise<number> {
	const client = ctx?.prisma || prisma;
	// @ts-ignore - Dynamic model access
	return client[model].count({ where });
} 