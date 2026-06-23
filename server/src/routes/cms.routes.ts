import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/security.middleware';

const router = Router();

// ==========================================
// 1. PUBLIC ENDPOINTS
// ==========================================
router.get('/packages', cmsController.getPublicPackages);
router.get('/services', cmsController.getPublicServices);
router.get('/testimonials', cmsController.getPublicTestimonials);
router.get('/faqs', cmsController.getPublicFAQs);
router.get('/gallery', cmsController.getPublicGallery);
router.get('/settings', cmsController.getPublicSettings);

// ==========================================
// 2. ADMIN/STAFF ENDPOINTS (REQUIRES AUTH)
// ==========================================
router.use(authenticateToken);

// Admin-only reads (to see inactive items as well)
router.get('/admin/packages', requirePermission('manage:settings'), cmsController.getAdminPackages);
router.get('/admin/services', requirePermission('manage:settings'), cmsController.getAdminServices);
router.get('/admin/testimonials', requirePermission('manage:settings'), cmsController.getAdminTestimonials);
router.get('/admin/faqs', requirePermission('manage:settings'), cmsController.getAdminFAQs);
router.get('/admin/gallery', requirePermission('manage:settings'), cmsController.getAdminGallery);

// Admin-only writes - Packages
router.post('/packages', requirePermission('manage:settings'), cmsController.createPackage);
router.put('/packages/:id', requirePermission('manage:settings'), cmsController.updatePackage);
router.delete('/packages/:id', requirePermission('manage:settings'), cmsController.deletePackage);
router.patch('/packages/:id/toggle', requirePermission('manage:settings'), cmsController.togglePackageActive);
router.post('/packages/reorder', requirePermission('manage:settings'), cmsController.reorderPackages);

// Admin-only writes - Services
router.post('/services', requirePermission('manage:settings'), cmsController.createService);
router.put('/services/:id', requirePermission('manage:settings'), cmsController.updateService);
router.delete('/services/:id', requirePermission('manage:settings'), cmsController.deleteService);
router.patch('/services/:id/toggle', requirePermission('manage:settings'), cmsController.toggleServiceActive);
router.post('/services/reorder', requirePermission('manage:settings'), cmsController.reorderServices);

// Admin-only writes - Testimonials
router.post('/testimonials', requirePermission('manage:settings'), cmsController.createTestimonial);
router.put('/testimonials/:id', requirePermission('manage:settings'), cmsController.updateTestimonial);
router.delete('/testimonials/:id', requirePermission('manage:settings'), cmsController.deleteTestimonial);
router.patch('/testimonials/:id/toggle', requirePermission('manage:settings'), cmsController.toggleTestimonialActive);
router.post('/testimonials/reorder', requirePermission('manage:settings'), cmsController.reorderTestimonials);

// Admin-only writes - FAQs
router.post('/faqs', requirePermission('manage:settings'), cmsController.createFAQ);
router.put('/faqs/:id', requirePermission('manage:settings'), cmsController.updateFAQ);
router.delete('/faqs/:id', requirePermission('manage:settings'), cmsController.deleteFAQ);
router.patch('/faqs/:id/toggle', requirePermission('manage:settings'), cmsController.toggleFAQActive);
router.post('/faqs/reorder', requirePermission('manage:settings'), cmsController.reorderFAQs);

// Admin-only writes - Gallery
router.post('/gallery', requirePermission('manage:settings'), cmsController.createGalleryItem);
router.put('/gallery/:id', requirePermission('manage:settings'), cmsController.updateGalleryItem);
router.delete('/gallery/:id', requirePermission('manage:settings'), cmsController.deleteGalleryItem);
router.patch('/gallery/:id/toggle', requirePermission('manage:settings'), cmsController.toggleGalleryItemActive);
router.post('/gallery/reorder', requirePermission('manage:settings'), cmsController.reorderGalleryItems);

// Admin-only writes - Settings
router.patch('/settings', requirePermission('manage:settings'), cmsController.updateSettings);

export default router;
