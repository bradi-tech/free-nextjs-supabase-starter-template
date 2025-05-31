'use server';

import { encodedRedirect } from '@/utils/utils';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { findUnique, create } from './common/db';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Standard server response type
 */
interface ServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export async function signUpAction(formData: FormData): Promise<ServerResponse<{ message: string }>> {
  try {
    // Input validation
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      encodedRedirect('error', '/register', 'Email and password are required');
      return {
        success: false,
        error: 'Email and password are required',
        status: 400
      };
    }

    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // Business logic: Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error.code + ' ' + error.message);
      encodedRedirect('error', '/register', error.message || 'Registration error');
      return {
        success: false,
        error: error?.message || 'Registration error',
        status: 400
      };
    }

    // Extract the user info from the response
    const supabaseUser = data?.user;

    if (supabaseUser) {
      // Store first name and last name in profile if provided
      const firstName = formData.get('firstName')?.toString();
      const lastName = formData.get('lastName')?.toString();
      
      try {
        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: { firstName, lastName }
        });
        
        // Check if user already exists using db.ts function
        const existingUser = await findUnique(
          prisma,
          'user',
          { id: supabaseUser.id }
        );
        
        if (!existingUser) {
          // Create user in our database using db.ts function
          await create(
            prisma,
            'user',
            {
              id: supabaseUser.id, // Supabase Auth UUID 
              email: supabaseUser.email || email,
              name: firstName && lastName ? `${firstName} ${lastName}`.trim() : null,
            }
          );
          
          console.log('User created in database with ID:', supabaseUser.id);
        } else {
          console.log('User already exists in database with ID:', supabaseUser.id);
        }
      } catch (err) {
        console.error('Failed to create user in database:', err);
        // Continue with registration even if database update fails
      }
    }

    encodedRedirect('success', '/register', 'Thanks for signing up! Please check your email for a verification link.');
    return {
      success: true,
      data: { message: 'Thanks for signing up! Please check your email for a verification link.' },
      status: 200
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    encodedRedirect('error', '/register', error.message || 'Registration failed. Please try again.');
    return {
      success: false,
      error: error.message || 'Registration failed. Please try again.',
      status: 500
    };
  }
}

export async function signInAction(formData: FormData): Promise<ServerResponse<{ message: string }>> {
  try {
    // Input validation
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      encodedRedirect('error', '/login', 'Email and password are required');
      return {
        success: false,
        error: 'Email and password are required',
        status: 400
      };
    }

    const supabase = await createClient();

    // Business logic: Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      encodedRedirect('error', '/login', error.message || 'Authentication error');
      return {
        success: false,
        error: error?.message || 'Authentication error',
        status: 400
      };
    }

    // Check if user exists in our database
    const supabaseUser = data?.user;
    if (supabaseUser) {
      const userExists = await findUnique(
        prisma,
        'user',
        { id: supabaseUser.id }
      );

      // If user doesn't exist in our database yet, create them using db.ts function
      if (!userExists) {
        try {
          await create(
            prisma,
            'user',
            {
              id: supabaseUser.id,
              email: supabaseUser.email || email,
              name: supabaseUser.user_metadata?.firstName && supabaseUser.user_metadata?.lastName
                ? `${supabaseUser.user_metadata.firstName} ${supabaseUser.user_metadata.lastName}`.trim()
                : null,
            }
          );
          console.log('User created in database during sign in:', supabaseUser.id);
        } catch (dbError) {
          console.error('Failed to create user in database during sign in:', dbError);
          // Continue with login even if database update fails
        }
      }
    }

    redirect('/dashboard');
    return {
      success: true,
      data: { message: 'Successfully logged in' },
      status: 200
    };
  } catch (error: any) {
    console.error('Login error:', error);
    encodedRedirect('error', '/login', error.message || 'Login failed. Please try again.');
    return {
      success: false,
      error: error.message || 'Login failed. Please try again.',
      status: 500
    };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ServerResponse<{ message: string }>> {
  try {
    // Input validation
    const email = formData.get('email')?.toString();
    const callbackUrl = formData.get('callbackUrl')?.toString();

    if (!email) {
      encodedRedirect('error', '/forgot-password', 'Email is required');
      return {
        success: false,
        error: 'Email is required',
        status: 400
      };
    }

    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // Business logic: Reset password email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
    });

    if (error) {
      console.error(error.message || 'Unknown error');
      encodedRedirect('error', '/forgot-password', 'Could not reset password');
      return {
        success: false,
        error: 'Could not reset password',
        status: 400
      };
    }

    if (callbackUrl) {
      redirect(callbackUrl);
    }

    encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.');
    return {
      success: true,
      data: { message: 'Check your email for a link to reset your password.' },
      status: 200
    };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    encodedRedirect('error', '/forgot-password', error.message || 'Failed to send reset email. Please try again.');
    return {
      success: false,
      error: error.message || 'Failed to send reset email. Please try again.',
      status: 500
    };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<ServerResponse<{ message: string }>> {
  try {
    // Input validation
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || !confirmPassword) {
      encodedRedirect('error', '/dashboard/reset-password', 'Password and confirm password are required');
      return {
        success: false,
        error: 'Password and confirm password are required',
        status: 400
      };
    }

    if (password !== confirmPassword) {
      encodedRedirect('error', '/dashboard/reset-password', 'Passwords do not match');
      return {
        success: false,
        error: 'Passwords do not match',
        status: 400
      };
    }

    const supabase = await createClient();

    // Business logic: Update password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      encodedRedirect('error', '/dashboard/reset-password', error.message || 'Password update failed');
      return {
        success: false,
        error: error?.message || 'Password update failed',
        status: 400
      };
    }

    encodedRedirect('success', '/dashboard/reset-password', 'Password updated successfully');
    return {
      success: true,
      data: { message: 'Password updated successfully' },
      status: 200
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    encodedRedirect('error', '/dashboard/reset-password', error.message || 'Password reset failed. Please try again.');
    return {
      success: false,
      error: error.message || 'Password reset failed. Please try again.',
      status: 500
    };
  }
}

export async function signOutAction(): Promise<ServerResponse<null>> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
    return {
      success: true,
      status: 200
    };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'Sign out failed. Please try again.',
      status: 500
    };
  }
}

export async function verifyOtp(data: { email: string; otp: string; type: string }): Promise<string> {
  try {
    const supabase = await createClient();

    const res = await supabase.auth.verifyOtp({
      email: data.email,
      token: data.otp,
      type: 'email',
    });
    return JSON.stringify(res);
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return JSON.stringify({
      success: false,
      error: error.message || 'OTP verification failed. Please try again.',
      status: 500
    });
  }
}
