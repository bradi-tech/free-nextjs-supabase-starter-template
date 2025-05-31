'use server';

import { PrismaClient } from '@prisma/client';
import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { findById, findMany, findUnique, create, update, findManyWithRelations } from './common/db';
import { 
  Website, 
  CreateWebsiteInput, 
  UpdateWebsiteInput, 
  UpdateWebsiteTextsInput, 
  PasswordProtectionParams 
} from './types/websites';
import { ServerResponse } from './common/server-response';
import { getTemplateById, getDefaultSections } from '@/lib/config/templates';
import { getUser } from '../auth';
import { prisma } from '../prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// Define types for related data
export type WebsiteSection = {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  websiteId: string;
};

export type WebsiteImage = {
  id: string;
  url: string;
  altText?: string | null;
  websiteId: string;
};

export type WebsiteTextField = {
  id: string;
  key: string;
  content: string;
  websiteId: string;
};

// Websites with related data
export type WebsiteWithDetails = Website & {
  images: WebsiteImage[];
  texts: WebsiteTextField[];
  sections: WebsiteSection[];
};

/**
 * Get all websites for the current authenticated user
 * 
 * @returns {Promise<ServerResponse<any[]>>} A promise that resolves to a ServerResponse containing the user's websites
 */
export async function getWebsitesForCurrentUser(): Promise<ServerResponse<any[]>> {
  try {
    // Input validation: Ensure user is authenticated
    noStore();
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error fetching user or no user logged in:', authError);
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }

    // Business logic: Fetch websites using db.ts functions
    const websites = await findManyWithRelations(
      prismaClient,
      'website',
      {
        where: { userId: user.id },
        include: {
          images: {
            select: {
              url: true,
              altText: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' }
      }
    );
    
    // Return successful response
    return {
      success: true,
      data: websites,
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error fetching websites:', error);
    return {
      success: false,
      error: 'Failed to fetch websites',
      status: 500
    };
  }
}

/**
 * Creates a new website with the selected template.
 * 
 * @param {Object} data - The website data
 * @param {string} data.title - The title of the website
 * @param {string} data.template - The template ID to use
 * @returns {Promise<ServerResponse<WebsiteWithDetails>>} A promise that resolves to a ServerResponse containing the created website with details
 */
export async function createWebsite({ 
  title, 
  template 
}: { 
  title: string; 
  template: string; 
}): Promise<ServerResponse<WebsiteWithDetails>> {
  try {
    // Input validation
    if (!title.trim()) {
      return {
        success: false,
        error: 'Website title is required',
        status: 400
      };
    }

    if (!template) {
      return {
        success: false,
        error: 'Template selection is required',
        status: 400
      };
    }

    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to create a website.',
        status: 401
      };
    }

    // Get template configuration
    const templateConfig = getTemplateById(template);
    if (!templateConfig) {
      return {
        success: false,
        error: 'Invalid template selected.',
        status: 400
      };
    }

    // Business logic: Create website with transaction
    const website = await prisma.$transaction(async (tx: any) => {
      // Create the website
      const website = await tx.website.create({
        data: {
          title,
          template,
          userId: user.id,
          isPublished: false,
        },
      });

      // Create default sections based on template
      const defaultSections = getDefaultSections(template);
      await Promise.all(
        defaultSections.map((section) => 
          tx.websiteSection.create({
            data: {
              type: section.type,
              title: section.title,
              enabled: section.defaultEnabled,
              order: section.order,
              websiteId: website.id,
            },
          })
        )
      );

      // Create default text fields
      if (templateConfig?.defaultTexts) {
        await Promise.all(
          Object.entries(templateConfig.defaultTexts).map(([key, content]) =>
            tx.textField.create({
              data: {
                key,
                content,
                websiteId: website.id,
              },
            })
          )
        );
      }

      // Create default images
      if (templateConfig?.defaultImages) {
        await Promise.all(
          Object.entries(templateConfig.defaultImages).map(([key, url]) =>
            tx.image.create({
              data: {
                url,
                altText: key,
                websiteId: website.id,
              },
            })
          )
        );
      }

      return website;
    });

    // Fetch the created website with all related data
    const websiteWithDetails = await prisma.website.findUnique({
      where: { id: website.id },
      include: {
        images: true,
        texts: true,
        sections: true,
      },
    });

    // Return successful response
    return {
      success: true,
      data: websiteWithDetails as WebsiteWithDetails,
      status: 201
    };
  } catch (error) {
    // Error handling
    console.error('Error creating website:', error);
    
    if ((error as any)?.code?.startsWith('P')) {
      // Handle Prisma-specific errors
      if ((error as any).code === 'P2002') {
        return {
          success: false,
          error: 'A website with this information already exists',
          status: 409
        };
      }
    }

    return {
      success: false,
      error: 'Failed to create website. Please try again.',
      status: 500
    };
  }
}

/**
 * Get default text fields for a template
 */
function getDefaultTextFields(template: string) {
  // Common fields for all templates
  const commonFields = [
    { key: 'couple_names', content: 'Partner 1 & Partner 2' },
    { key: 'wedding_date', content: new Date().toISOString().split('T')[0] },
    { key: 'wedding_location', content: 'Wedding Venue, City' },
  ];

  // Template-specific fields
  const templateFields: Record<string, { key: string; content: string }[]> = {
    rustic: [
      { key: 'welcome_message', content: 'We invite you to celebrate our special day with us.' },
      { key: 'story_title', content: 'Our Story' },
      { key: 'story_content', content: 'Share your love story here...' },
    ],
    modern: [
      { key: 'welcome_message', content: 'Join us for our wedding celebration.' },
      { key: 'event_details', content: 'Ceremony followed by reception.' },
    ],
    romantic: [
      { key: 'welcome_message', content: 'With great pleasure, we invite you to our wedding.' },
      { key: 'quote', content: 'Love is patient, love is kind.' },
      { key: 'story_content', content: 'Our journey together began...' },
    ],
  };

  return [...commonFields, ...(templateFields[template] || [])];
}

/**
 * Gets a website by ID.
 * 
 * @param {string} id - The ID of the website to get
 * @returns {Promise<ServerResponse<WebsiteWithDetails>>} A promise that resolves to a ServerResponse containing the website with details
 */
export async function getWebsiteById(id: string): Promise<ServerResponse<WebsiteWithDetails>> {
  try {
    // Input validation
    if (!id) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to view this website.',
        status: 401
      };
    }

    // Business logic: Fetch website
    const website = await prisma.website.findUnique({
      where: { 
        id,
        userId: user.id // Ensure the website belongs to the user
      },
      include: {
        images: true,
        texts: true,
        sections: {
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    if (!website) {
      return {
        success: false,
        error: 'Website not found.',
        status: 404
      };
    }

    // Return successful response
    return {
      success: true,
      data: website as WebsiteWithDetails,
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error getting website:', error);
    return {
      success: false,
      error: 'Failed to get website. Please try again.',
      status: 500
    };
  }
}

/**
 * Update texts for a website
 * 
 * @param {Object} params - Parameters for updating website texts
 * @param {string} params.websiteId - The ID of the website to update
 * @param {Array<{key: string, content: string, websiteId: string}>} params.texts - Array of text fields to update
 * @returns {Promise<ServerResponse<{success: boolean}>>} A promise that resolves to a ServerResponse
 */
export async function updateWebsiteTexts({ 
  websiteId, 
  texts 
}: { 
  websiteId: string; 
  texts: { key: string; content: string; websiteId: string }[] 
}): Promise<ServerResponse<{ success: boolean }>> {
  try {
    // Input validation
    if (!websiteId) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    if (!texts || !texts.length) {
      return {
        success: false,
        error: 'Text fields are required',
        status: 400
      };
    }

    noStore();
    const supabase = await createClient();

    // Ensure user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }

    // Verify ownership
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!website || website.userId !== user.id) {
      return {
        success: false,
        error: 'Not authorized to update this website',
        status: 403
      };
    }

    // Business logic: Update text fields
    for (const text of texts) {
      // Check if the text field exists
      const existingTextField = await findUnique(
        prisma,
        'textField',
        {
          websiteId: websiteId,
          key: text.key,
        }
      );
      
      if (existingTextField) {
        // Update if exists
        await update(
          prisma,
          'textField',
          existingTextField.id,
          { content: text.content }
        );
      } else {
        // Create if not exists
        await create(
          prisma,
          'textField',
          {
            key: text.key,
            content: text.content,
            websiteId,
          }
        );
      }
    }

    // Update website updatedAt
    await update(
      prisma,
      'website',
      websiteId,
      { updatedAt: new Date() }
    );

    revalidatePath(`/dashboard/edit/${websiteId}`);
    revalidatePath(`/dashboard/preview/${websiteId}`);
    
    // Return successful response
    return {
      success: true,
      data: { success: true },
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating website texts:', error);
    return {
      success: false,
      error: 'Failed to update website texts',
      status: 500
    };
  }
}

/**
 * Update a website's title
 * 
 * @param {Object} params - Parameters for updating website title
 * @param {string} params.id - The ID of the website to update
 * @param {string} params.title - The new title for the website
 * @returns {Promise<ServerResponse<{success: boolean}>>} A promise that resolves to a ServerResponse
 */
export async function updateWebsiteTitle({ 
  id, 
  title 
}: { 
  id: string; 
  title: string; 
}): Promise<ServerResponse<{ success: boolean }>> {
  try {
    // Input validation
    if (!id) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    if (!title.trim()) {
      return {
        success: false,
        error: 'Website title is required',
        status: 400
      };
    }

    noStore();
    const supabase = await createClient();

    // Ensure user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }

    // Verify ownership
    const website = await prisma.website.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!website || website.userId !== user.id) {
      return {
        success: false,
        error: 'Not authorized to update this website',
        status: 403
      };
    }

    // Business logic: Update title
    await update(
      prisma,
      'website',
      id,
      { title, updatedAt: new Date() }
    );

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/edit/${id}`);
    
    // Return successful response
    return {
      success: true,
      data: { success: true },
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating website title:', error);
    return {
      success: false,
      error: 'Failed to update website title',
      status: 500
    };
  }
}

/**
 * Update a website's published status
 * 
 * @param {Object} params - Parameters for publishing a website
 * @param {string} params.id - The ID of the website to update
 * @param {boolean} params.isPublished - Whether the website should be published
 * @returns {Promise<ServerResponse<{success: boolean}>>} A promise that resolves to a ServerResponse
 */
export async function publishWebsite({ 
  id, 
  isPublished 
}: { 
  id: string; 
  isPublished: boolean; 
}): Promise<ServerResponse<{ success: boolean }>> {
  try {
    // Input validation
    if (!id) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    noStore();
    const supabase = await createClient();

    // Ensure user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }

    // Verify ownership
    const website = await prisma.website.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!website || website.userId !== user.id) {
      return {
        success: false,
        error: 'Not authorized to update this website',
        status: 403
      };
    }

    // Business logic: Update publish status
    await update(
      prisma,
      'website',
      id,
      { isPublished, updatedAt: new Date() }
    );

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/edit/${id}`);
    
    // Return successful response
    return {
      success: true,
      data: { success: true },
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error publishing website:', error);
    return {
      success: false,
      error: 'Failed to publish website',
      status: 500
    };
  }
}

/**
 * Update a website's password protection settings
 * 
 * @param {Object} params - Parameters for updating password protection
 * @param {string} params.id - The ID of the website to update
 * @param {boolean} params.passwordProtected - Whether the website should be password protected
 * @param {string} [params.password] - The password for the website (required if passwordProtected is true)
 * @returns {Promise<ServerResponse<{success: boolean}>>} A promise that resolves to a ServerResponse
 */
export async function updatePasswordProtection({ 
  id, 
  passwordProtected, 
  password 
}: PasswordProtectionParams): Promise<ServerResponse<{ success: boolean }>> {
  try {
    // Input validation
    if (!id) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    if (passwordProtected && !password?.trim()) {
      return {
        success: false,
        error: 'Password is required when enabling password protection',
        status: 400
      };
    }

    noStore();
    const supabase = await createClient();

    // Ensure user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication error',
        status: 401
      };
    }

    // Verify ownership
    const website = await prisma.website.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!website || website.userId !== user.id) {
      return {
        success: false,
        error: 'Not authorized to update this website',
        status: 403
      };
    }

    // Business logic: Update password protection settings
    await prisma.$transaction(async (tx: any) => {
      await tx.website.update({
        where: { id },
        data: {
          passwordProtected,
          password: passwordProtected ? password : null,
          updatedAt: new Date()
        },
      });
    });

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/manage/${id}`);
    revalidatePath(`/dashboard/edit/${id}`);
    
    // Return successful response
    return {
      success: true,
      data: { success: true },
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating password protection:', error);
    return {
      success: false,
      error: 'Failed to update password protection',
      status: 500
    };
  }
}

/**
 * Updates website section enabled status.
 * 
 * @param {string} sectionId - The ID of the section to update
 * @param {boolean} enabled - Whether the section should be enabled
 * @returns {Promise<ServerResponse<WebsiteSection>>} A promise that resolves to a ServerResponse containing the updated section
 */
export async function updateSectionStatus(
  sectionId: string, 
  enabled: boolean
): Promise<ServerResponse<WebsiteSection>> {
  try {
    // Input validation
    if (!sectionId) {
      return {
        success: false,
        error: 'Section ID is required',
        status: 400
      };
    }

    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update a section.',
        status: 401
      };
    }

    // Check if the section belongs to the user's website
    const section = await prisma.websiteSection.findUnique({
      where: { id: sectionId },
      include: { website: true },
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found.',
        status: 404
      };
    }

    if (section.website.userId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to update this section.',
        status: 403
      };
    }

    // Business logic: Update the section
    const updatedSection = await prisma.websiteSection.update({
      where: { id: sectionId },
      data: { enabled },
    });

    // Return successful response
    return {
      success: true,
      data: updatedSection as WebsiteSection,
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating section:', error);
    return {
      success: false,
      error: 'Failed to update section. Please try again.',
      status: 500
    };
  }
}

/**
 * Updates the order of website sections.
 * 
 * @param {Object} data - The data for updating section orders
 * @param {string} data.websiteId - The ID of the website
 * @param {Array<{id: string, order: number}>} data.sections - Array of section IDs and their new order values
 * @returns {Promise<ServerResponse<WebsiteSection[]>>} A promise that resolves to a ServerResponse containing the updated sections
 */
export async function updateSectionOrders(
  { websiteId, sections }: 
  { websiteId: string; sections: { id: string; order: number }[] }
): Promise<ServerResponse<WebsiteSection[]>> {
  try {
    // Input validation
    if (!websiteId) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    if (!sections || !sections.length) {
      return {
        success: false,
        error: 'Section data is required',
        status: 400
      };
    }

    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update section orders.',
        status: 401
      };
    }

    // Check if the website belongs to the user
    const website = await prisma.website.findUnique({
      where: { 
        id: websiteId,
        userId: user.id 
      },
    });

    if (!website) {
      return {
        success: false,
        error: 'Website not found or you do not have permission to update it.',
        status: 404
      };
    }

    // Business logic: Update section orders
    const updatedSections = await prisma.$transaction(
      sections.map((section) => 
        prisma.websiteSection.update({
          where: { id: section.id },
          data: { order: section.order },
        })
      )
    );

    // Return successful response
    return {
      success: true,
      data: updatedSections as WebsiteSection[],
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating section orders:', error);
    return {
      success: false,
      error: 'Failed to update section orders. Please try again.',
      status: 500
    };
  }
}

/**
 * Gets all websites for the current user.
 * 
 * @returns {Promise<ServerResponse<Website[]>>} A promise that resolves to a ServerResponse containing the user's websites
 */
export async function getUserWebsites(): Promise<ServerResponse<Website[]>> {
  try {
    // Input validation: Ensure user is authenticated
    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to view your websites.',
        status: 401
      };
    }

    // Business logic: Fetch websites
    const websites = await prisma.website.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Return successful response
    return {
      success: true,
      data: websites,
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error getting user websites:', error);
    return {
      success: false,
      error: 'Failed to get websites. Please try again.',
      status: 500
    };
  }
}

/**
 * Update a website's template
 * 
 * @param {Object} params - Parameters for updating website template
 * @param {string} params.id - The ID of the website to update
 * @param {string} params.template - The new template ID
 * @returns {Promise<ServerResponse<{success: boolean}>>} A promise that resolves to a ServerResponse
 */
export async function updateWebsiteTemplate({ 
  id, 
  template 
}: { 
  id: string; 
  template: string; 
}): Promise<ServerResponse<{ success: boolean }>> {
  try {
    // Input validation
    if (!id) {
      return {
        success: false,
        error: 'Website ID is required',
        status: 400
      };
    }

    if (!template) {
      return {
        success: false,
        error: 'Template selection is required',
        status: 400
      };
    }

    // Get template configuration to validate
    const templateConfig = getTemplateById(template);
    if (!templateConfig) {
      return {
        success: false,
        error: 'Invalid template selected',
        status: 400
      };
    }

    const user = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update a website.',
        status: 401
      };
    }

    // Verify ownership
    const website = await prisma.website.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!website || website.userId !== user.id) {
      return {
        success: false,
        error: 'Not authorized to update this website',
        status: 403
      };
    }

    // Business logic: Update template
    await update(
      prisma,
      'website',
      id,
      { template, updatedAt: new Date() }
    );

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/edit/${id}`);
    revalidatePath(`/dashboard/preview/${id}`);
    
    // Return successful response
    return {
      success: true,
      data: { success: true },
      status: 200
    };
  } catch (error) {
    // Error handling
    console.error('Error updating website template:', error);
    return {
      success: false,
      error: 'Failed to update website template',
      status: 500
    };
  }
} 
