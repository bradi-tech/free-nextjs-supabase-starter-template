/**
 * Standard response type for server actions
 * 
 * @template T - The type of data in the response
 */
export interface ServerResponse<T> {
  /**
   * Whether the server action was successful
   */
  success: boolean;
  
  /**
   * The data returned by the server action (if successful)
   */
  data?: T;
  
  /**
   * Error message (if not successful)
   */
  error?: string;
  
  /**
   * HTTP status code
   */
  status: number;
}