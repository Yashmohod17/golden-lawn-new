import { bookingRepository } from '../repositories/booking.repository';
import { BookingInput } from '../validations/booking.validation';
import { NotificationService } from './notification.service';
import prisma from '../config/database';
import { EmailService } from './email.service';

export class BookingService {
  async getBookings() {
    return bookingRepository.getAll();
  }

  async createBooking(data: BookingInput) {
    const booking = await bookingRepository.create(data);

    // Asynchronously send contact form acknowledgements (Phase 4)
    EmailService.sendInquiryAcknowledgement(booking.email, {
      customerName: booking.name,
      eventType: booking.eventType,
      eventDate: booking.date,
      guests: booking.guests,
      notes: booking.notes || undefined
    }).catch(err => console.error('Failed to send customer inquiry acknowledgement email:', err));

    EmailService.sendOwnerInquiryNotification({
      customerName: booking.name,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      eventType: booking.eventType,
      eventDate: booking.date,
      guests: booking.guests,
      notes: booking.notes || undefined
    }).catch(err => console.error('Failed to send owner inquiry email:', err));

    if (booking.customerId) {
      try {
        await NotificationService.sendNotification({
          customerId: booking.customerId,
          templateName: 'booking_confirmation',
          variables: {
            eventType: booking.eventType,
            date: booking.date,
            bookingId: booking.id
          },
          category: 'BOOKING',
          priority: 'HIGH',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to dispatch booking creation notification:', err);
      }
    }
    return booking;
  }

  async updateBooking(id: string, data: any, changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, data, changedBy);
    if (booking.customerId) {
      try {
        if (data.status === 'CONFIRMED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_confirmation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'HIGH',
            type: 'success'
          });
        } else if (data.status === 'CANCELLED') {
          EmailService.sendBookingCancellation(booking.email, {
            customerName: booking.name,
            bookingId: booking.id,
            eventDate: booking.date,
            eventType: booking.eventType,
            refundInfo: booking.paid > 0 
              ? `Processed cancellation for booking with ₹${booking.paid.toLocaleString()} paid. Refund is subject to cancellation terms.` 
              : 'No deposit was paid. No refund is due.'
          }).catch(err => console.error('Failed to send booking cancellation email:', err));

          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_cancellation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'URGENT',
            type: 'warning'
          });
        } else {
          // General config changes
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            title: 'Booking Details Updated',
            message: `Your booking details for ${booking.eventType} on ${booking.date} have been updated.`,
            category: 'BOOKING',
            priority: 'MEDIUM',
            type: 'info'
          });
        }
      } catch (err) {
        console.error('Failed to dispatch booking update notification:', err);
      }
    }
    return booking;
  }

  async updateBookingStatus(id: string, status: 'PENDING' | 'TEMP_RESERVED' | 'VISIT_SCHEDULED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED', changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, { status }, changedBy);
    if (booking.customerId) {
      try {
        if (status === 'CONFIRMED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_confirmation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'HIGH',
            type: 'success'
          });
        } else if (status === 'CANCELLED') {
          EmailService.sendBookingCancellation(booking.email, {
            customerName: booking.name,
            bookingId: booking.id,
            eventDate: booking.date,
            eventType: booking.eventType,
            refundInfo: booking.paid > 0 
              ? `Processed cancellation for booking with ₹${booking.paid.toLocaleString()} paid. Refund is subject to cancellation terms.` 
              : 'No deposit was paid. No refund is due.'
          }).catch(err => console.error('Failed to send booking cancellation email:', err));

          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_cancellation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'URGENT',
            type: 'warning'
          });
        }
      } catch (err) {
        console.error('Failed to dispatch booking status update notification:', err);
      }
    }
    return booking;
  }

  async cancelBooking(id: string, changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, { status: 'CANCELLED' }, changedBy);

    // Asynchronously send booking cancellation email
    EmailService.sendBookingCancellation(booking.email, {
      customerName: booking.name,
      bookingId: booking.id,
      eventDate: booking.date,
      eventType: booking.eventType,
      refundInfo: booking.paid > 0 
        ? `Processed cancellation for booking with ₹${booking.paid.toLocaleString()} paid. Refund is subject to cancellation terms.` 
        : 'No deposit was paid. No refund is due.'
    }).catch(err => console.error('Failed to send booking cancellation email:', err));

    if (booking.customerId) {
      try {
        await NotificationService.sendNotification({
          customerId: booking.customerId,
          templateName: 'booking_cancellation',
          variables: {
            eventType: booking.eventType,
            date: booking.date,
            bookingId: booking.id
          },
          category: 'BOOKING',
          priority: 'URGENT',
          type: 'warning'
        });
      } catch (err) {
        console.error('Failed to dispatch booking cancel notification:', err);
      }
    }
    return booking;
  }

  async getStatusHistory(bookingId: string) {
    return bookingRepository.getStatusHistory(bookingId);
  }

  async getTimelineEvents(bookingId: string) {
    return bookingRepository.getTimelineEvents(bookingId);
  }

  async deleteBooking(id: string) {
    return bookingRepository.delete(id);
  }

  async getAvailability(month?: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        date: month ? { startsWith: month } : undefined,
        status: { notIn: ['CANCELLED', 'EXPIRED'] }
      },
      select: { date: true, status: true }
    });

    const blocked = await prisma.blockedDate.findMany({
      where: {
        date: month ? { startsWith: month } : undefined
      },
      select: { date: true }
    });

    return [
      ...bookings.map(b => ({ date: b.date, type: b.status === 'CONFIRMED' ? 'booked' : 'reserved' })),
      ...blocked.map(b => ({ date: b.date, type: 'blocked' }))
    ];
  }

  async payReservation(id: string, amount: number) {
    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      throw new Error(`Booking not found with ID ${id}`);
    }

    if (booking.status === 'EXPIRED') {
      throw new Error('This temporary reservation has expired and dates have been released.');
    }
    if (booking.status === 'CANCELLED') {
      throw new Error('This booking has been cancelled.');
    }

    const newPaid = booking.paid + amount;
    const newPending = Math.max(0, booking.cost - newPaid);
    const transactionId = `pay_reserve_${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48-hour holds on paid slots

      // Update booking
      const updated = await tx.booking.update({
        where: { id },
        data: {
          paid: newPaid,
          pending: newPending,
          status: 'TEMP_RESERVED',
          expiresAt: newExpiresAt
        }
      });

      // Create Payment log
      await tx.payment.create({
        data: {
          bookingId: id,
          customerId: booking.customerId,
          amount,
          paymentType: 'ADVANCE',
          paymentStatus: 'PAID',
          paymentMethod: 'Razorpay Sandbox',
          transactionId,
          paidAt: new Date(),
          method: 'Razorpay Sandbox',
          status: 'SUCCESS',
          date: new Date().toISOString().substring(0, 10),
          description: `Reservation fee of ₹${amount.toLocaleString()} paid successfully. Date blocked temporarily.`
        }
      });

      // Update Availability Date if it exists
      await tx.availabilityDate.upsert({
        where: { date: booking.date },
        update: { status: 'PENDING', notes: `Temporary reservation for ${booking.eventType} (₹500 paid).` },
        create: { date: booking.date, status: 'PENDING', notes: `Temporary reservation for ${booking.eventType} (₹500 paid).` }
      });

      // Log status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          oldStatus: booking.status,
          newStatus: 'TEMP_RESERVED',
          changedBy: 'CUSTOMER',
          notes: `Reservation fee of ₹${amount.toLocaleString()} paid. Date frozen for 48 hours.`
        }
      });

      // Log timeline event
      await tx.bookingTimelineEvent.create({
        data: {
          bookingId: id,
          title: 'Reservation Fee Received',
          description: `Reservation fee of ₹${amount.toLocaleString()} received. Date frozen temporarily.`,
          type: 'PAYMENT_RECEIVED',
          date: new Date().toISOString().split('T')[0]
        }
      });

      return updated;
    });

    // Send dynamic date reserved hold notice, owner notification, and payment receipt
    const expiresAtStr = result.expiresAt 
      ? new Date(result.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    EmailService.sendDateReserved(result.email, {
      customerName: result.name,
      bookingId: result.id,
      eventDate: result.date,
      amountPaid: amount,
      expiresAt: expiresAtStr,
      contactPhone: result.coordinatorPhone,
      contactEmail: 'shalini.meshram@gmail.com'
    }).catch(err => console.error('Failed to send date reserved email:', err));

    EmailService.sendOwnerBookingNotification({
      customerName: result.name,
      customerEmail: result.email,
      customerPhone: result.phone,
      eventDate: result.date,
      eventType: result.eventType,
      bookingId: result.id,
      amountPaid: amount
    }).catch(err => console.error('Failed to send owner booking confirmation email:', err));

    EmailService.sendPaymentReceipt(result.email, {
      customerName: result.name,
      bookingId: result.id,
      transactionId,
      amount,
      remainingBalance: result.pending,
      paymentDate: new Date().toLocaleDateString()
    }).catch(err => console.error('Failed to send payment receipt email:', err));

    return result;
  }

  async processExpiredReservations() {
    const now = new Date();
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'TEMP_RESERVED',
        expiresAt: {
          lt: now
        }
      }
    });

    if (expiredBookings.length === 0) return;

    console.log(`[Auto-Expiry] Found ${expiredBookings.length} expired reservations to release.`);

    for (const booking of expiredBookings) {
      try {
        await prisma.$transaction(async (tx) => {
          // Update status to EXPIRED
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: 'EXPIRED' }
          });

          // Log to status history
          await tx.bookingStatusHistory.create({
            data: {
              bookingId: booking.id,
              oldStatus: 'TEMP_RESERVED',
              newStatus: 'EXPIRED',
              changedBy: 'SYSTEM',
              notes: 'Reservation expired automatically after 48-hour timeout.'
            }
          });

          // Log timeline event
          await tx.bookingTimelineEvent.create({
            data: {
              bookingId: booking.id,
              title: 'Reservation Expired',
              description: 'The 48-hour temporary reservation window closed without payment. Date released.',
              type: 'STATUS_CHANGE',
              date: now.toISOString().split('T')[0]
            }
          });

          // Delete from availabilityDate
          await tx.availabilityDate.deleteMany({
            where: { date: booking.date }
          });
        });

        // Notify customer
        if (booking.customerId) {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            title: 'Reservation Expired',
            message: `Your reservation for ${booking.eventType} on ${booking.date} has expired as the reservation fee was not paid.`,
            category: 'BOOKING',
            priority: 'HIGH',
            type: 'warning'
          }).catch(err => console.error('Failed to notify client of expiration:', err));
        }

        console.log(`[Auto-Expiry] Successfully expired booking ${booking.id} and released date ${booking.date}`);
      } catch (err) {
        console.error(`[Auto-Expiry] Failed to expire booking ${booking.id}:`, err);
      }
    }
  }
}

export const bookingService = new BookingService();
