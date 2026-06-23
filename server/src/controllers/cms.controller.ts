import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../services/cms.service';
import { logAuditAction } from '../middleware/security.middleware';
import {
  validatePackageInput,
  validateServiceInput,
  validateFAQInput,
  validateGalleryItemInput,
  validateReorderInput,
} from '../validations/cms.validation';

export class CMSController {
  // ==========================================
  // PUBLIC RETRIEVALS
  // ==========================================
  async getPublicPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listPackages(true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPublicServices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listServices(true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPublicTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listTestimonials(true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPublicFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listFAQs(true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPublicGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listGalleryItems(true);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listWebsiteSettings();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN RETRIEVALS
  // ==========================================
  async getAdminPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listPackages(false);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAdminServices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listServices(false);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAdminTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listTestimonials(false);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAdminFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listFAQs(false);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAdminGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cmsService.listGalleryItems(false);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - PACKAGES
  // ==========================================
  async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validatePackageInput(req.body);
      if (error) return res.status(400).json({ error });
      const pkg = await cmsService.addPackage(value!);
      await logAuditAction(req.user?.id || null, 'CREATE_PACKAGE', { id: pkg.id, name: pkg.name }, req.ip);
      res.status(201).json(pkg);
    } catch (err) {
      next(err);
    }
  }

  async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = validatePackageInput(req.body);
      if (error) return res.status(400).json({ error });
      const pkg = await cmsService.updatePackage(id, value!);
      await logAuditAction(req.user?.id || null, 'UPDATE_PACKAGE', { id, name: pkg.name }, req.ip);
      res.json(pkg);
    } catch (err) {
      next(err);
    }
  }

  async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cmsService.deletePackage(id);
      await logAuditAction(req.user?.id || null, 'DELETE_PACKAGE', { id }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async togglePackageActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean.' });
      await cmsService.togglePackageActive(id, isActive);
      await logAuditAction(req.user?.id || null, 'TOGGLE_PACKAGE_ACTIVE', { id, isActive }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reorderPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateReorderInput(req.body);
      if (error) return res.status(400).json({ error });
      await cmsService.reorderPackages(value!.ids);
      await logAuditAction(req.user?.id || null, 'REORDER_PACKAGES', { ids: value!.ids }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - SERVICES
  // ==========================================
  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateServiceInput(req.body);
      if (error) return res.status(400).json({ error });
      const service = await cmsService.addService(value!);
      await logAuditAction(req.user?.id || null, 'CREATE_SERVICE', { id: service.id, title: service.title }, req.ip);
      res.status(201).json(service);
    } catch (err) {
      next(err);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = validateServiceInput(req.body);
      if (error) return res.status(400).json({ error });
      const service = await cmsService.updateService(id, value!);
      await logAuditAction(req.user?.id || null, 'UPDATE_SERVICE', { id, title: service.title }, req.ip);
      res.json(service);
    } catch (err) {
      next(err);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cmsService.deleteService(id);
      await logAuditAction(req.user?.id || null, 'DELETE_SERVICE', { id }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async toggleServiceActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean.' });
      await cmsService.toggleServiceActive(id, isActive);
      await logAuditAction(req.user?.id || null, 'TOGGLE_SERVICE_ACTIVE', { id, isActive }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reorderServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateReorderInput(req.body);
      if (error) return res.status(400).json({ error });
      await cmsService.reorderServices(value!.ids);
      await logAuditAction(req.user?.id || null, 'REORDER_SERVICES', { ids: value!.ids }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - TESTIMONIALS
  // ==========================================
  async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, event, rating, avatar, text } = req.body;
      if (!name || !event || typeof rating !== 'number' || !text) {
        return res.status(400).json({ error: 'name, event, rating, and text are required fields.' });
      }
      const test = await cmsService.addTestimonial({ name, event, rating, avatar, text });
      await logAuditAction(req.user?.id || null, 'CREATE_TESTIMONIAL', { id: test.id, name: test.name }, req.ip);
      res.status(201).json(test);
    } catch (err) {
      next(err);
    }
  }

  async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, event, rating, avatar, text } = req.body;
      if (!name || !event || typeof rating !== 'number' || !text) {
        return res.status(400).json({ error: 'name, event, rating, and text are required fields.' });
      }
      const test = await cmsService.updateTestimonial(id, { name, event, rating, avatar, text });
      await logAuditAction(req.user?.id || null, 'UPDATE_TESTIMONIAL', { id, name: test.name }, req.ip);
      res.json(test);
    } catch (err) {
      next(err);
    }
  }

  async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cmsService.deleteTestimonial(id);
      await logAuditAction(req.user?.id || null, 'DELETE_TESTIMONIAL', { id }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async toggleTestimonialActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean.' });
      await cmsService.toggleTestimonialActive(id, isActive);
      await logAuditAction(req.user?.id || null, 'TOGGLE_TESTIMONIAL_ACTIVE', { id, isActive }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reorderTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateReorderInput(req.body);
      if (error) return res.status(400).json({ error });
      await cmsService.reorderTestimonials(value!.ids);
      await logAuditAction(req.user?.id || null, 'REORDER_TESTIMONIALS', { ids: value!.ids }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - FAQS
  // ==========================================
  async createFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateFAQInput(req.body);
      if (error) return res.status(400).json({ error });
      const faq = await cmsService.addFAQ(value!);
      await logAuditAction(req.user?.id || null, 'CREATE_FAQ', { id: faq.id, question: faq.question }, req.ip);
      res.status(201).json(faq);
    } catch (err) {
      next(err);
    }
  }

  async updateFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = validateFAQInput(req.body);
      if (error) return res.status(400).json({ error });
      const faq = await cmsService.updateFAQ(id, value!);
      await logAuditAction(req.user?.id || null, 'UPDATE_FAQ', { id, question: faq.question }, req.ip);
      res.json(faq);
    } catch (err) {
      next(err);
    }
  }

  async deleteFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cmsService.deleteFAQ(id);
      await logAuditAction(req.user?.id || null, 'DELETE_FAQ', { id }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async toggleFAQActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean.' });
      await cmsService.toggleFAQActive(id, isActive);
      await logAuditAction(req.user?.id || null, 'TOGGLE_FAQ_ACTIVE', { id, isActive }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reorderFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateReorderInput(req.body);
      if (error) return res.status(400).json({ error });
      await cmsService.reorderFAQs(value!.ids);
      await logAuditAction(req.user?.id || null, 'REORDER_FAQS', { ids: value!.ids }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - GALLERY
  // ==========================================
  async createGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateGalleryItemInput(req.body);
      if (error) return res.status(400).json({ error });
      const item = await cmsService.addGalleryItem(value!);
      await logAuditAction(req.user?.id || null, 'CREATE_GALLERY_ITEM', { id: item.id, title: item.title }, req.ip);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async updateGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = validateGalleryItemInput(req.body);
      if (error) return res.status(400).json({ error });
      const item = await cmsService.updateGalleryItem(id, value!);
      await logAuditAction(req.user?.id || null, 'UPDATE_GALLERY_ITEM', { id, title: item.title }, req.ip);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async deleteGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cmsService.deleteGalleryItem(id);
      await logAuditAction(req.user?.id || null, 'DELETE_GALLERY_ITEM', { id }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async toggleGalleryItemActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be a boolean.' });
      await cmsService.toggleGalleryItemActive(id, isActive);
      await logAuditAction(req.user?.id || null, 'TOGGLE_GALLERY_ITEM_ACTIVE', { id, isActive }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reorderGalleryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateReorderInput(req.body);
      if (error) return res.status(400).json({ error });
      await cmsService.reorderGalleryItems(value!.ids);
      await logAuditAction(req.user?.id || null, 'REORDER_GALLERY_ITEMS', { ids: value!.ids }, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ADMIN WRITES - WEBSITE SETTINGS
  // ==========================================
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Settings payload object is required.' });
      }
      await cmsService.updateBulkSettings(req.body);
      await logAuditAction(req.user?.id || null, 'UPDATE_WEBSITE_SETTINGS', req.body, req.ip);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const cmsController = new CMSController();
