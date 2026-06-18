import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { logAuditAction } from '../middleware/security.middleware';
import prisma from '../config/database';
import { format } from 'date-fns';

export class AnalyticsController {
  
  private getCommonParams(req: Request) {
    const filter = String(req.query.filter || 'LAST_30_DAYS').toUpperCase();
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
    const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    return { filter, startDate, endDate, page, limit, sortBy, sortOrder };
  }

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getOverview(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getRevenue(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getBookings(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getCustomers(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getPayments(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getStaff(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getOccupancy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getOccupancy(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getLeads(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getPackages(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const data = await analyticsService.getEvents(filter, startDate, endDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = String(req.query.category || 'REVENUE').toUpperCase();
      const { filter, startDate, endDate, page, limit, sortBy, sortOrder } = this.getCommonParams(req);
      const { start, end } = analyticsService.parseDateFilter(filter, startDate, endDate);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const skip = (page - 1) * limit;

      let records: any[] = [];
      let totalCount = 0;

      if (category === 'REVENUE') {
        const whereClause = {
          paymentStatus: 'PAID',
          paidAt: { gte: start, lte: end }
        };
        totalCount = await prisma.payment.count({ where: whereClause });
        records = await prisma.payment.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: sortBy ? { [sortBy]: sortOrder } : { paidAt: 'desc' }
        });
      } else if (category === 'BOOKINGS') {
        const whereClause = {
          date: { gte: startStr, lte: endStr }
        };
        totalCount = await prisma.booking.count({ where: whereClause });
        records = await prisma.booking.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: sortBy ? { [sortBy]: sortOrder } : { date: 'desc' }
        });
      } else if (category === 'CRM') {
        const whereClause = {
          createdAt: { gte: start, lte: end }
        };
        totalCount = await prisma.lead.count({ where: whereClause });
        records = await prisma.lead.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' }
        });
      } else {
        totalCount = 0;
        records = [];
      }

      res.json({
        category,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        records
      });
    } catch (error) {
      next(error);
    }
  };

  getExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = String(req.query.category || 'REVENUE').toUpperCase();
      const { filter, startDate, endDate } = this.getCommonParams(req);
      const { start, end } = analyticsService.parseDateFilter(filter, startDate, endDate);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      let csvContent = '';
      let filename = `export_${category.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.csv`;

      if (category === 'REVENUE') {
        const payments = await prisma.payment.findMany({
          where: {
            paymentStatus: 'PAID',
            paidAt: { gte: start, lte: end }
          }
        });
        csvContent = 'ID,Booking ID,Amount,Method,Status,Date\n';
        payments.forEach(p => {
          csvContent += `"${p.id}","${p.bookingId}",${p.amount},"${p.paymentMethod}","${p.paymentStatus}","${p.paidAt ? format(p.paidAt, 'yyyy-MM-dd') : ''}"\n`;
        });
      } else if (category === 'BOOKINGS') {
        const bookings = await prisma.booking.findMany({
          where: {
            date: { gte: startStr, lte: endStr }
          }
        });
        csvContent = 'Booking ID,Client Name,Email,Phone,Event Date,Guests,Package,Cost,Status\n';
        bookings.forEach(b => {
          csvContent += `"${b.id}","${b.name}","${b.email}","${b.phone}","${b.date}",${b.guests},"${b.package}",${b.cost},"${b.status}"\n`;
        });
      } else if (category === 'CRM') {
        const leads = await prisma.lead.findMany({
          where: {
            createdAt: { gte: start, lte: end }
          }
        });
        csvContent = 'Lead ID,Name,Phone,Email,Source,Status,Created At\n';
        leads.forEach(l => {
          csvContent += `"${l.id}","${l.name}","${l.phone}","${l.email || ''}","${l.source || ''}","${l.status}","${format(l.createdAt, 'yyyy-MM-dd')}"\n`;
        });
      } else {
        csvContent = 'Employee Code,Name,Email,Phone,Designation,Department,Joining Date,Salary,Status\n';
      }

      // Log the download action
      if (req.user) {
        await logAuditAction(req.user.id, 'ANALYTICS_EXPORT', { category, filter }, req.ip);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
