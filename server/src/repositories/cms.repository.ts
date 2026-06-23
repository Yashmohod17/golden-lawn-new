import prisma from '../config/database';
import { PackageInput, ServiceInput, FAQInput, GalleryItemInput, WebsiteSettingInput } from '../validations/cms.validation';

export class CMSRepository {
  // ==========================================
  // 1. PACKAGES
  // ==========================================
  async getAllPackages(onlyActive = false) {
    return prisma.package.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getPackageById(id: string) {
    return prisma.package.findUnique({ where: { id } });
  }

  async createPackage(data: PackageInput) {
    // Determine order
    const count = await prisma.package.count();
    return prisma.package.create({
      data: {
        ...data,
        order: count,
        isActive: true,
      },
    });
  }

  async updatePackage(id: string, data: Partial<PackageInput>) {
    return prisma.package.update({
      where: { id },
      data,
    });
  }

  async deletePackage(id: string) {
    return prisma.package.delete({ where: { id } });
  }

  async togglePackageActive(id: string, isActive: boolean) {
    return prisma.package.update({
      where: { id },
      data: { isActive },
    });
  }

  async updatePackageOrder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.package.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ==========================================
  // 2. SERVICES
  // ==========================================
  async getAllServices(onlyActive = false) {
    return prisma.service.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getServiceById(id: string) {
    return prisma.service.findUnique({ where: { id } });
  }

  async createService(data: ServiceInput) {
    const count = await prisma.service.count();
    return prisma.service.create({
      data: {
        ...data,
        order: count,
        isActive: true,
      },
    });
  }

  async updateService(id: string, data: Partial<ServiceInput>) {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: string) {
    return prisma.service.delete({ where: { id } });
  }

  async toggleServiceActive(id: string, isActive: boolean) {
    return prisma.service.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateServiceOrder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ==========================================
  // 3. TESTIMONIALS
  // ==========================================
  async getAllTestimonials(onlyActive = false) {
    return prisma.testimonial.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getTestimonialById(id: string) {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  async createTestimonial(data: Omit<PackageInput, 'features' | 'price' | 'badge' | 'desc'> & { event: string; rating: number; avatar?: string; text: string }) {
    const count = await prisma.testimonial.count();
    return prisma.testimonial.create({
      data: {
        ...data,
        order: count,
        isActive: true,
      },
    });
  }

  async updateTestimonial(id: string, data: any) {
    return prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async deleteTestimonial(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  }

  async toggleTestimonialActive(id: string, isActive: boolean) {
    return prisma.testimonial.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateTestimonialOrder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.testimonial.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ==========================================
  // 4. FAQS
  // ==========================================
  async getAllFAQs(onlyActive = false) {
    return prisma.fAQ.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getFAQById(id: string) {
    return prisma.fAQ.findUnique({ where: { id } });
  }

  async createFAQ(data: FAQInput) {
    const count = await prisma.fAQ.count();
    return prisma.fAQ.create({
      data: {
        ...data,
        order: count,
        isActive: true,
      },
    });
  }

  async updateFAQ(id: string, data: Partial<FAQInput>) {
    return prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async deleteFAQ(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  }

  async toggleFAQActive(id: string, isActive: boolean) {
    return prisma.fAQ.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateFAQOrder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.fAQ.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ==========================================
  // 5. GALLERY ITEMS
  // ==========================================
  async getAllGalleryItems(onlyActive = false) {
    return prisma.galleryItem.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getGalleryItemById(id: string) {
    return prisma.galleryItem.findUnique({ where: { id } });
  }

  async createGalleryItem(data: GalleryItemInput) {
    const count = await prisma.galleryItem.count();
    return prisma.galleryItem.create({
      data: {
        ...data,
        order: count,
        isActive: true,
      },
    });
  }

  async updateGalleryItem(id: string, data: Partial<GalleryItemInput>) {
    return prisma.galleryItem.update({
      where: { id },
      data,
    });
  }

  async deleteGalleryItem(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  }

  async toggleGalleryItemActive(id: string, isActive: boolean) {
    return prisma.galleryItem.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateGalleryItemOrder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.galleryItem.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ==========================================
  // 6. WEBSITE SETTINGS
  // ==========================================
  async getWebsiteSettings() {
    return prisma.websiteSetting.findMany();
  }

  async updateWebsiteSetting(key: string, value: string) {
    return prisma.websiteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export const cmsRepository = new CMSRepository();
