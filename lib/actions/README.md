# Server Actions Structure

This directory contains server actions for the WeddySite application, using Next.js server actions.

## Standard Structure

All server actions follow a consistent pattern as defined in `common/server-action-structure.md`:

```ts
export async function serverAction<T>(params: any): Promise<ServerResponse<T>> {
  try {
    // 1. Input validation
    // Validate your input parameters here
    
    // 2. Business logic
    // Implement your main functionality here
    
    // 3. Return successful response
    return createSuccessResponse(data); // From action-types.ts
  } catch (error) {
    // 4. Error handling
    console.error('Server action failed:', error);
    return createErrorResponse('Operation failed');
  }
}
```

## Common Utilities

### Database Operations

Use the utility functions from `common/db.ts` for database operations:

- `findById<T, M>` - Find a record by ID
- `findMany<T, M>` - Find multiple records
- `findUnique<T, M>` - Find a single record by custom criteria
- `create<T, CreateInput, M>` - Create a new record
- `update<T, UpdateInput, M>` - Update an existing record
- `deleteEntity<T, M>` - Delete a record

Example:
```ts
// Find a user by ID
const user = await findById(prisma, 'user', userId);

// Create a new website
const website = await create(prisma, 'website', {
  title: 'My Wedding',
  template: 'modern',
  userId: user.id
});
```

### Response Utilities

Use the response utilities from `common/action-types.ts`:

- `createSuccessResponse<T>(data: T, status?: number)` - Create a success response
- `createErrorResponse(error: string, status?: number)` - Create an error response
- `createUnauthorizedResponse(error?: string)` - Create a 401 unauthorized response
- `createForbiddenResponse(error?: string)` - Create a 403 forbidden response
- `createNotFoundResponse(resource?: string)` - Create a 404 not found response
- `createValidationErrorResponse(error: string)` - Create a 400 validation error response

## Type Definitions

- Common types are in `common/types.ts`
- Response types are in `common/action-types.ts`
- Domain-specific types are in `types/[domain].ts`

## Best Practices

1. Always validate input parameters
2. Organize related actions in domain-specific files
3. Use try/catch blocks for proper error handling
4. Return standardized responses
5. Use the provided utility functions for database operations
6. Type your functions and parameters
7. Provide descriptive error messages 