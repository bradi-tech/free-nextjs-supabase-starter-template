import { BaseEntity } from '../common/types';

/**
 * Website entity with extended fields
 */
export interface Website extends BaseEntity {
  title: string;
  template: string;
  isPublished: boolean;
  passwordProtected: boolean;
  password?: string | null;
  userId: string;
}

/**
 * Input for creating a website
 */
export interface CreateWebsiteInput {
  title: string;
  template: string;
  userId: string;
}

/**
 * Input for updating a website
 */
export interface UpdateWebsiteInput {
  title?: string;
  isPublished?: boolean;
  passwordProtected?: boolean;
  password?: string | null;
  updatedAt?: Date;
}

/**
 * Inputs for updating website texts
 */
export interface UpdateWebsiteTextsInput {
  websiteId: string;
  texts: WebsiteTextField[];
}

/**
 * Website text field
 */
export interface WebsiteTextField {
  key: string;
  content: string;
  websiteId: string;
}

/**
 * Password protection parameters
 */
export interface PasswordProtectionParams {
  id: string;
  passwordProtected: boolean;
  password?: string;
} 