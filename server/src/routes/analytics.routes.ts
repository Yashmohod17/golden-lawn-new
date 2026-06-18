import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/security.middleware';

const router = Router();

// Protect all analytics endpoints
router.use(authenticateToken);
router.use(requirePermission('read:analytics'));

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenue);
router.get('/bookings', analyticsController.getBookings);
router.get('/customers', analyticsController.getCustomers);
router.get('/payments', analyticsController.getPayments);
router.get('/occupancy', analyticsController.getOccupancy);
router.get('/leads', analyticsController.getLeads);
router.get('/packages', analyticsController.getPackages);
router.get('/events', analyticsController.getEvents);
router.get('/reports', requirePermission('read:reports'), analyticsController.getReports);
router.get('/export', requirePermission('read:reports'), analyticsController.getExport);

export default router;
