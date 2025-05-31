```ts
/**
 * Standard structure for Next.js server actions
 * 
 * @template T The expected return data type
 * @param {any} params The parameters required for the server action
 * @returns {Promise<ServerResponse<T>>} A standardized server response
 */
export async function serverAction<T>(
  params: any
): Promise<ServerResponse<T>> {
  try {
    // 1. Input validation
    // Validate your input parameters here
    
    // 2. Business logic
    // Implement your main functionality here
    // Example: const result = await prisma.someModel.someOperation({...})
    
    // 3. Return successful response
    return {
      success: true,
      data: {} as T, // Replace with actual data
      status: 200
    };
  } catch (error) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      // Map specific Prisma errors to appropriate responses
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Resource not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: 'Operation failed',
      status: 500
    };
  }
}
```