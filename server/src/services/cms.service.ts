import { randomUUID } from 'crypto';
import { cmsRepository } from '../repositories/cms.repository';
import { PackageInput, ServiceInput, FAQInput, GalleryItemInput } from '../validations/cms.validation';
import { storageService } from './storage.service';

interface ParsedBase64 {
  buffer: Buffer;
  mimeType: string;
  extension: string;
}

function parseBase64Image(base64Str: string): ParsedBase64 | null {
  const matches = base64Str.match(/^data:(image\/[a-zA-Z+-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  let extension = 'png';
  const parts = mimeType.split('/');
  if (parts.length === 2) {
    extension = parts[1];
    if (extension === 'jpeg') extension = 'jpg';
  }
  
  return {
    buffer,
    mimeType,
    extension
  };
}

export class CMSService {
  // Packages
  async listPackages(onlyActive = false) {
    const packages = await cmsRepository.getAllPackages(onlyActive);
    // Parse features field back to array
    return packages.map(pkg => ({
      ...pkg,
      features: JSON.parse(pkg.features),
    }));
  }

  async getPackage(id: string) {
    const pkg = await cmsRepository.getPackageById(id);
    if (!pkg) throw new Error('Package not found');
    return {
      ...pkg,
      features: JSON.parse(pkg.features),
    };
  }

  async addPackage(data: PackageInput) {
    const pkg = await cmsRepository.createPackage(data);
    return {
      ...pkg,
      features: JSON.parse(pkg.features),
    };
  }

  async updatePackage(id: string, data: Partial<PackageInput>) {
    const pkg = await cmsRepository.updatePackage(id, data);
    return {
      ...pkg,
      features: JSON.parse(pkg.features),
    };
  }

  async deletePackage(id: string) {
    return cmsRepository.deletePackage(id);
  }

  async togglePackageActive(id: string, isActive: boolean) {
    return cmsRepository.togglePackageActive(id, isActive);
  }

  async reorderPackages(ids: string[]) {
    return cmsRepository.updatePackageOrder(ids);
  }

  // Services
  async listServices(onlyActive = false) {
    return cmsRepository.getAllServices(onlyActive);
  }

  async getService(id: string) {
    const service = await cmsRepository.getServiceById(id);
    if (!service) throw new Error('Service not found');
    return service;
  }

  async addService(data: ServiceInput) {
    let imageUrl = data.image;
    const parsed = parseBase64Image(data.image);
    if (parsed) {
      const filename = `${randomUUID()}.${parsed.extension}`;
      imageUrl = await storageService.uploadImage(parsed.buffer, filename, 'services', parsed.mimeType);
    }
    return cmsRepository.createService({
      ...data,
      image: imageUrl,
    });
  }

  async updateService(id: string, data: Partial<ServiceInput>) {
    const existing = await cmsRepository.getServiceById(id);
    if (!existing) throw new Error('Service not found');

    let imageUrl = data.image;
    if (data.image) {
      const parsed = parseBase64Image(data.image);
      if (parsed) {
        const filename = `${randomUUID()}.${parsed.extension}`;
        imageUrl = await storageService.uploadImage(parsed.buffer, filename, 'services', parsed.mimeType);

        if (existing.image) {
          await storageService.deleteImage(existing.image, 'services');
        }
      }
    }

    return cmsRepository.updateService(id, {
      ...data,
      image: imageUrl,
    });
  }

  async deleteService(id: string) {
    const existing = await cmsRepository.getServiceById(id);
    if (!existing) throw new Error('Service not found');

    const result = await cmsRepository.deleteService(id);
    if (existing.image) {
      await storageService.deleteImage(existing.image, 'services');
    }
    return result;
  }

  async toggleServiceActive(id: string, isActive: boolean) {
    return cmsRepository.toggleServiceActive(id, isActive);
  }

  async reorderServices(ids: string[]) {
    return cmsRepository.updateServiceOrder(ids);
  }

  // Testimonials
  async listTestimonials(onlyActive = false) {
    return cmsRepository.getAllTestimonials(onlyActive);
  }

  async getTestimonial(id: string) {
    const test = await cmsRepository.getTestimonialById(id);
    if (!test) throw new Error('Testimonial not found');
    return test;
  }

  async addTestimonial(data: { name: string; event: string; rating: number; avatar?: string; text: string }) {
    let avatarUrl = data.avatar;
    if (data.avatar) {
      const parsed = parseBase64Image(data.avatar);
      if (parsed) {
        const filename = `${randomUUID()}.${parsed.extension}`;
        avatarUrl = await storageService.uploadImage(parsed.buffer, filename, 'testimonials', parsed.mimeType);
      }
    }
    return cmsRepository.createTestimonial({
      ...data,
      avatar: avatarUrl,
    });
  }

  async updateTestimonial(id: string, data: any) {
    const existing = await cmsRepository.getTestimonialById(id);
    if (!existing) throw new Error('Testimonial not found');

    let avatarUrl = data.avatar;
    if (data.avatar) {
      const parsed = parseBase64Image(data.avatar);
      if (parsed) {
        const filename = `${randomUUID()}.${parsed.extension}`;
        avatarUrl = await storageService.uploadImage(parsed.buffer, filename, 'testimonials', parsed.mimeType);

        if (existing.avatar) {
          await storageService.deleteImage(existing.avatar, 'testimonials');
        }
      }
    }

    return cmsRepository.updateTestimonial(id, {
      ...data,
      avatar: avatarUrl,
    });
  }

  async deleteTestimonial(id: string) {
    const existing = await cmsRepository.getTestimonialById(id);
    if (!existing) throw new Error('Testimonial not found');

    const result = await cmsRepository.deleteTestimonial(id);
    if (existing.avatar) {
      await storageService.deleteImage(existing.avatar, 'testimonials');
    }
    return result;
  }

  async toggleTestimonialActive(id: string, isActive: boolean) {
    return cmsRepository.toggleTestimonialActive(id, isActive);
  }

  async reorderTestimonials(ids: string[]) {
    return cmsRepository.updateTestimonialOrder(ids);
  }

  // FAQs
  async listFAQs(onlyActive = false) {
    return cmsRepository.getAllFAQs(onlyActive);
  }

  async getFAQ(id: string) {
    const faq = await cmsRepository.getFAQById(id);
    if (!faq) throw new Error('FAQ not found');
    return faq;
  }

  async addFAQ(data: FAQInput) {
    return cmsRepository.createFAQ(data);
  }

  async updateFAQ(id: string, data: Partial<FAQInput>) {
    return cmsRepository.updateFAQ(id, data);
  }

  async deleteFAQ(id: string) {
    return cmsRepository.deleteFAQ(id);
  }

  async toggleFAQActive(id: string, isActive: boolean) {
    return cmsRepository.toggleFAQActive(id, isActive);
  }

  async reorderFAQs(ids: string[]) {
    return cmsRepository.updateFAQOrder(ids);
  }

  // Gallery Items
  async listGalleryItems(onlyActive = false) {
    return cmsRepository.getAllGalleryItems(onlyActive);
  }

  async getGalleryItem(id: string) {
    const item = await cmsRepository.getGalleryItemById(id);
    if (!item) throw new Error('Gallery item not found');
    return item;
  }

  async addGalleryItem(data: GalleryItemInput) {
    let imageUrl = data.image;
    const parsed = parseBase64Image(data.image);
    if (parsed) {
      const filename = `${randomUUID()}.${parsed.extension}`;
      imageUrl = await storageService.uploadImage(parsed.buffer, filename, 'gallery', parsed.mimeType);
    }
    return cmsRepository.createGalleryItem({
      ...data,
      image: imageUrl,
    });
  }

  async updateGalleryItem(id: string, data: Partial<GalleryItemInput>) {
    const existing = await cmsRepository.getGalleryItemById(id);
    if (!existing) throw new Error('Gallery item not found');

    let imageUrl = data.image;
    if (data.image) {
      const parsed = parseBase64Image(data.image);
      if (parsed) {
        const filename = `${randomUUID()}.${parsed.extension}`;
        imageUrl = await storageService.uploadImage(parsed.buffer, filename, 'gallery', parsed.mimeType);

        if (existing.image) {
          await storageService.deleteImage(existing.image, 'gallery');
        }
      }
    }

    return cmsRepository.updateGalleryItem(id, {
      ...data,
      image: imageUrl,
    });
  }

  async deleteGalleryItem(id: string) {
    const existing = await cmsRepository.getGalleryItemById(id);
    if (!existing) throw new Error('Gallery item not found');

    const result = await cmsRepository.deleteGalleryItem(id);
    if (existing.image) {
      await storageService.deleteImage(existing.image, 'gallery');
    }
    return result;
  }

  async toggleGalleryItemActive(id: string, isActive: boolean) {
    return cmsRepository.toggleGalleryItemActive(id, isActive);
  }

  async reorderGalleryItems(ids: string[]) {
    return cmsRepository.updateGalleryItemOrder(ids);
  }

  // Website Settings
  async listWebsiteSettings() {
    const list = await cmsRepository.getWebsiteSettings();
    // Convert to simple key-value record object
    const settings: Record<string, string> = {};
    for (const item of list) {
      settings[item.key] = item.value;
    }
    return settings;
  }

  async updateBulkSettings(data: Record<string, string>) {
    const results = [];
    for (const [key, value] of Object.entries(data)) {
      const setting = await cmsRepository.updateWebsiteSetting(key, String(value));
      results.push(setting);
    }
    return results;
  }
}

export const cmsService = new CMSService();
