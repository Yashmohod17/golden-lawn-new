import { getAdminHeaders } from './admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return new Promise(() => {}); // Prevent throw / uncaught exceptions during redirect
      }
    }
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export interface CMSFeature {
  name: string;
  included: boolean;
}

export interface CMSPackage {
  id: string;
  name: string;
  badge: string;
  desc: string;
  price: number;
  color?: string | null;
  accent?: string | null;
  features: CMSFeature[];
  isActive: boolean;
  order: number;
}

export interface CMSServiceItem {
  id: string;
  title: string;
  desc: string;
  image: string;
  iconName: string;
  isActive: boolean;
  order: number;
}

export interface CMSTestimonial {
  id: string;
  name: string;
  event: string;
  rating: number;
  avatar: string | null;
  text: string;
  isActive: boolean;
  order: number;
}

export interface CMSFAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  order: number;
}

export interface CMSGalleryItem {
  id: string;
  category: string;
  title: string;
  image: string;
  aspect: string;
  isActive: boolean;
  order: number;
}

export const cmsService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================
  async getPackages(): Promise<CMSPackage[]> {
    const res = await fetch(`${API_URL}/api/cms/packages`);
    return handleResponse(res);
  },

  async getServices(): Promise<CMSServiceItem[]> {
    const res = await fetch(`${API_URL}/api/cms/services`);
    return handleResponse(res);
  },

  async getTestimonials(): Promise<CMSTestimonial[]> {
    const res = await fetch(`${API_URL}/api/cms/testimonials`);
    return handleResponse(res);
  },

  async getFAQs(): Promise<CMSFAQItem[]> {
    const res = await fetch(`${API_URL}/api/cms/faqs`);
    return handleResponse(res);
  },

  async getGallery(): Promise<CMSGalleryItem[]> {
    const res = await fetch(`${API_URL}/api/cms/gallery`);
    return handleResponse(res);
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${API_URL}/api/cms/settings`);
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN READS
  // ==========================================
  async getAdminPackages(): Promise<CMSPackage[]> {
    const res = await fetch(`${API_URL}/api/cms/admin/packages`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminServices(): Promise<CMSServiceItem[]> {
    const res = await fetch(`${API_URL}/api/cms/admin/services`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminTestimonials(): Promise<CMSTestimonial[]> {
    const res = await fetch(`${API_URL}/api/cms/admin/testimonials`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminFAQs(): Promise<CMSFAQItem[]> {
    const res = await fetch(`${API_URL}/api/cms/admin/faqs`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminGallery(): Promise<CMSGalleryItem[]> {
    const res = await fetch(`${API_URL}/api/cms/admin/gallery`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - PACKAGES
  // ==========================================
  async addPackage(data: Omit<CMSPackage, 'id' | 'order' | 'isActive'>): Promise<CMSPackage> {
    const res = await fetch(`${API_URL}/api/cms/packages`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ...data, features: JSON.stringify(data.features) }),
    });
    return handleResponse(res);
  },

  async updatePackage(id: string, data: Omit<CMSPackage, 'id' | 'order' | 'isActive'>): Promise<CMSPackage> {
    const res = await fetch(`${API_URL}/api/cms/packages/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ...data, features: JSON.stringify(data.features) }),
    });
    return handleResponse(res);
  },

  async deletePackage(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/packages/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async togglePackageActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/packages/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },

  async reorderPackages(ids: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/packages/reorder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - SERVICES
  // ==========================================
  async addService(data: Omit<CMSServiceItem, 'id' | 'order' | 'isActive'>): Promise<CMSServiceItem> {
    const res = await fetch(`${API_URL}/api/cms/services`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateService(id: string, data: Omit<CMSServiceItem, 'id' | 'order' | 'isActive'>): Promise<CMSServiceItem> {
    const res = await fetch(`${API_URL}/api/cms/services/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/services/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async toggleServiceActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/services/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },

  async reorderServices(ids: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/services/reorder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - TESTIMONIALS
  // ==========================================
  async addTestimonial(data: Omit<CMSTestimonial, 'id' | 'order' | 'isActive'>): Promise<CMSTestimonial> {
    const res = await fetch(`${API_URL}/api/cms/testimonials`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTestimonial(id: string, data: Omit<CMSTestimonial, 'id' | 'order' | 'isActive'>): Promise<CMSTestimonial> {
    const res = await fetch(`${API_URL}/api/cms/testimonials/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteTestimonial(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async toggleTestimonialActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/testimonials/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },

  async reorderTestimonials(ids: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/testimonials/reorder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - FAQS
  // ==========================================
  async addFAQ(data: Omit<CMSFAQItem, 'id' | 'order' | 'isActive'>): Promise<CMSFAQItem> {
    const res = await fetch(`${API_URL}/api/cms/faqs`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateFAQ(id: string, data: Omit<CMSFAQItem, 'id' | 'order' | 'isActive'>): Promise<CMSFAQItem> {
    const res = await fetch(`${API_URL}/api/cms/faqs/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteFAQ(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/faqs/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async toggleFAQActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/faqs/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },

  async reorderFAQs(ids: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/faqs/reorder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - GALLERY
  // ==========================================
  async addGalleryItem(data: Omit<CMSGalleryItem, 'id' | 'order' | 'isActive'>): Promise<CMSGalleryItem> {
    const res = await fetch(`${API_URL}/api/cms/gallery`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateGalleryItem(id: string, data: Omit<CMSGalleryItem, 'id' | 'order' | 'isActive'>): Promise<CMSGalleryItem> {
    const res = await fetch(`${API_URL}/api/cms/gallery/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/gallery/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async toggleGalleryItemActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/gallery/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },

  async reorderGalleryItems(ids: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/gallery/reorder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // ADMIN WRITES - WEBSITE SETTINGS
  // ==========================================
  async updateWebsiteSettings(settings: Record<string, string>): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/cms/settings`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};
