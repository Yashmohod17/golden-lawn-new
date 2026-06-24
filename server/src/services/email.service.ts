import https from 'https';
import fs from 'fs';
import path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export class EmailService {
  private static getApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private static getFromAddress(): string {
    return process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'Golden Celebration Lawn <onboarding@resend.dev>';
  }

  private static getOwnerEmail(): string {
    return process.env.OWNER_NOTIFICATION_EMAIL || process.env.OWNER_EMAIL || 'shalini.meshram@gmail.com';
  }

  /**
   * Primary wrapper for professional branding HTML email template
   */
  private static getHtmlTemplate(subject: string, contentHtml: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #FAF9F6;
      color: #1c1917;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1c1917 0%, #2e2a24 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 3px solid #D4AF37;
    }
    .logo {
      font-family: 'Georgia', serif;
      font-size: 24px;
      font-weight: bold;
      color: #D4AF37;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }
    .tagline {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 5px 0 0 0;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    h1 {
      font-family: 'Georgia', serif;
      font-size: 20px;
      color: #1c1917;
      margin-top: 0;
      margin-bottom: 18px;
      font-weight: 700;
    }
    p {
      font-size: 14px;
      color: #44403c;
      margin-bottom: 18px;
    }
    .highlight-card {
      background-color: #FAF9F6;
      border-left: 4px solid #D4AF37;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .grid-table th, .grid-table td {
      padding: 12px 15px;
      text-align: left;
      font-size: 13px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }
    .grid-table th {
      color: #78716c;
      font-weight: 600;
      width: 40%;
    }
    .grid-table td {
      color: #1c1917;
      font-weight: 700;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #c5a880 0%, #d4af37 100%);
      color: #1c1917 !important;
      text-decoration: none;
      padding: 12px 30px;
      font-weight: bold;
      border-radius: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 10px;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.15);
      text-align: center;
    }
    .footer {
      background-color: #faf9f6;
      padding: 25px;
      text-align: center;
      font-size: 11px;
      color: #78716c;
      border-top: 1px solid rgba(212, 175, 55, 0.05);
    }
    .footer p {
      margin: 5px 0;
      font-size: 11px;
      color: #78716c;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Golden Celebrations</div>
      <div class="tagline">Where Every Milestone Glimmers</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>The Golden Celebrations Lawn</strong></p>
      <p>Golden Celebrations Lawn, Narsala Road, Near Hudkeshwar, Nagpur, MH - 440034</p>
      <p>Phone: +91 9823464705 | Email: shalini.meshram@gmail.com</p>
      <p>&copy; 2026 Golden Celebrations Lawn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Helper to perform exponential retry on actual sendEmail execution
   */
  private static async sendEmailWithRetry(
    options: EmailOptions,
    retries = 3,
    delayMs = 500
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let attempt = 0;
    while (attempt < retries) {
      attempt++;
      try {
        const res = await this.sendEmail(options);
        if (res.success) {
          return res;
        }
        console.warn(`[EmailService] Attempt ${attempt} failed: ${res.error}`);
      } catch (err: any) {
        console.warn(`[EmailService] Attempt ${attempt} caught error: ${err.message}`);
      }
      if (attempt < retries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
    console.error(`[EmailService] All ${retries} attempts failed to deliver email to ${options.to}`);
    return { success: false, error: `Failed to deliver email after ${retries} attempts.` };
  }

  /**
   * Low-level send method. Checks key, formats HTML/body, calls Resend API or writes mock logs.
   */
  public static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.getApiKey();
    const from = this.getFromAddress();
    let { to, subject, body, html } = options;

    let htmlContent = html || body.replace(/\n/g, '<br />');

    // Sandbox redirect: Resend onboarding sandbox only allows sending to the account owner
    if (apiKey && apiKey !== 'mock' && apiKey !== 'YOUR_RESEND_API_KEY' && from.includes('onboarding@resend.dev') && to !== 'goldencelebrationlawn@gmail.com') {
      console.log(`[Resend Sandbox Redirect] Redirecting email from ${to} to goldencelebrationlawn@gmail.com to comply with Resend Sandbox restrictions.`);
      const redirectNotice = `<div style="background-color: #ffedd5; border: 1px solid #f97316; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #c2410c; font-family: sans-serif;">
        <strong>[Resend Sandbox Redirect]</strong> This email was originally generated for <strong>${to}</strong>. It was routed here because the Resend Sandbox key only permits delivery to the registered owner's inbox.
      </div>`;
      htmlContent = redirectNotice + htmlContent;
      to = 'goldencelebrationlawn@gmail.com';
    }

    if (!apiKey || apiKey === 'mock' || apiKey === 'YOUR_RESEND_API_KEY') {
      const logMessage = `
========================================
[MOCK EMAIL DELIVERED]
Timestamp: ${new Date().toISOString()}
From: ${from}
To: ${to}
Subject: ${subject}
----------------------------------------
HTML Content:
${htmlContent}
========================================
`;
      console.log(`[Mock Email] Sent to ${to} - Subject: ${subject}`);

      try {
        const scratchDir = path.join(__dirname, '../../scratch');
        if (!fs.existsSync(scratchDir)) {
          fs.mkdirSync(scratchDir, { recursive: true });
        }
        const logFilePath = path.join(scratchDir, 'email-logs.txt');
        fs.appendFileSync(logFilePath, logMessage);
      } catch (err) {
        console.error('Failed to write mock email to file:', err);
      }

      return { success: true, messageId: `mock-msg-${Date.now()}` };
    }

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        from,
        to: [to],
        subject,
        html: htmlContent,
      });

      const reqOptions = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(reqOptions, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(responseBody);
              resolve({ success: true, messageId: result.id });
            } catch (err) {
              resolve({ success: true, messageId: 'unknown-id' });
            }
          } else {
            console.error(`Resend API returned status code ${res.statusCode}: ${responseBody}`);
            resolve({
              success: false,
              error: `Resend API Error (Status ${res.statusCode}): ${responseBody}`,
            });
          }
        });
      });

      req.on('error', (err) => {
        console.error('Failed to send email via Resend API:', err);
        resolve({
          success: false,
          error: `Network Error: ${err.message}`,
        });
      });

      req.write(postData);
      req.end();
    });
  }

  // ==========================================
  // TRANSACTIONAL BUSINESS METHODS
  // ==========================================

  /**
   * Phase 2 - Booking Confirmation Email
   */
  public static async sendBookingConfirmation(
    to: string,
    data: {
      customerName: string;
      bookingId: string;
      eventDate: string;
      eventType: string;
      advanceAmount: number;
      remainingAmount: number;
      lawnName: string;
      contactInfo: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Booking Confirmed: ${data.eventType} - ID ${data.bookingId}`;
    const bodyHtml = `
      <h1>Your Event is Scheduled!</h1>
      <p>Dear ${data.customerName},</p>
      <p>We are delighted to confirm that your event reservation fee has been successfully received, and your booking is officially confirmed on our lawn calendar.</p>
      
      <div class="highlight-card">
        <h3>Reservation Details</h3>
        <table class="grid-table">
          <tr>
            <th>Booking ID</th>
            <td>${data.bookingId}</td>
          </tr>
          <tr>
            <th>Event Type</th>
            <td>${data.eventType}</td>
          </tr>
          <tr>
            <th>Event Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Lawn Location</th>
            <td>${data.lawnName}</td>
          </tr>
          <tr>
            <th>Advance Amount Paid</th>
            <td>₹${data.advanceAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <th>Remaining Balance</th>
            <td>₹${data.remainingAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <th>Point of Contact</th>
            <td>${data.contactInfo}</td>
          </tr>
        </table>
      </div>

      <p>Please note that your date is frozen. Please arrange a visit to the venue or connect with your coordinator within the next 48 hours to complete layout design mapping and food tasting finalization.</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Dear ${data.customerName}, your booking ${data.bookingId} is confirmed for ${data.eventDate}.`,
      html,
    });
  }

  /**
   * Date Reserved Email (Replaces Booking Confirmation immediately after payment)
   */
  public static async sendDateReserved(
    to: string,
    data: {
      customerName: string;
      bookingId: string;
      eventDate: string;
      amountPaid: number;
      expiresAt: string;
      contactPhone: string;
      contactEmail: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Date Reserved Successfully – Action Required Within 48 Hours`;
    const bodyHtml = `
      <h1>Date Reserved Successfully!</h1>
      <p>Dear ${data.customerName},</p>
      <p>Thank you for choosing Golden Celebrations Lawn.</p>
      <p>We have successfully received your reservation amount of ₹${data.amountPaid.toLocaleString()} and your selected event date has been reserved temporarily.</p>
      
      <div class="highlight-card">
        <h3>Reservation Details</h3>
        <table class="grid-table">
          <tr>
            <th>Reservation ID</th>
            <td>${data.bookingId}</td>
          </tr>
          <tr>
            <th>Event Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Reservation Amount Paid</th>
            <td>₹${data.amountPaid.toLocaleString()}</td>
          </tr>
          <tr style="color: #b91c1c;">
            <th>Reservation Valid Until</th>
            <td><strong>${data.expiresAt}</strong></td>
          </tr>
        </table>
      </div>

      <div class="highlight-card" style="border-left-color: #b91c1c; background-color: #fef2f2;">
        <h3 style="color: #b91c1c; margin-top: 0;">⚠️ Important Notice</h3>
        <p style="font-size: 13px; color: #7f1d1d; margin-bottom: 0;">
          This payment reserves your selected date for <strong>48 hours only</strong>.
          To confirm your booking permanently, you must visit Golden Celebrations Lawn and complete the booking process within the reservation period.
        </p>
        <p style="font-size: 13px; color: #7f1d1d; margin-top: 10px; margin-bottom: 0;">
          If the booking is not completed within 48 hours:
        </p>
        <ul style="font-size: 13px; color: #7f1d1d; margin-top: 5px; margin-bottom: 0; padding-left: 20px;">
          <li>The reserved date will be released automatically.</li>
          <li>The slot may become available to other customers.</li>
          <li>The reservation amount of ₹${data.amountPaid.toLocaleString()} will not be refunded.</li>
        </ul>
      </div>

      <p>For assistance, please contact our coordinator:</p>
      <p style="margin-bottom: 5px;">📞 <strong>Phone:</strong> ${data.contactPhone}</p>
      <p>✉️ <strong>Email:</strong> ${data.contactEmail}</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Dear ${data.customerName}, your selected date ${data.eventDate} has been reserved. Complete your booking within 48 hours (by ${data.expiresAt}) to avoid forfeiture.`,
      html,
    });
  }

  /**
   * Phase 3 - Owner Booking Notification
   */
  public static async sendOwnerBookingNotification(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventDate: string;
    eventType: string;
    bookingId: string;
    amountPaid: number;
  }): Promise<{ success: boolean; error?: string }> {
    const to = this.getOwnerEmail();
    const subject = `[ALERT] New Confirmed Booking - ${data.customerName}`;
    const bodyHtml = `
      <h1>New Confirmed Event Booking</h1>
      <p>Owner Dashboard Alert,</p>
      <p>A new customer has successfully completed their slot reservation payment.</p>
      
      <div class="highlight-card">
        <h3>Booking Summary</h3>
        <table class="grid-table">
          <tr>
            <th>Customer Name</th>
            <td>${data.customerName}</td>
          </tr>
          <tr>
            <th>Customer Email</th>
            <td>${data.customerEmail}</td>
          </tr>
          <tr>
            <th>Customer Phone</th>
            <td>${data.customerPhone}</td>
          </tr>
          <tr>
            <th>Booking ID</th>
            <td>${data.bookingId}</td>
          </tr>
          <tr>
            <th>Event Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Event Type</th>
            <td>${data.eventType}</td>
          </tr>
          <tr>
            <th>Amount Received</th>
            <td>₹${data.amountPaid.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p>Please review coordinates and assign layout staging milestones in the Admin Dashboard.</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `New confirmed booking ${data.bookingId} by ${data.customerName} on ${data.eventDate}.`,
      html,
    });
  }

  /**
   * Phase 4 - Contact Form Inquiry Acknowledgement
   */
  public static async sendInquiryAcknowledgement(
    to: string,
    data: {
      customerName: string;
      eventType: string;
      eventDate: string;
      guests: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Thank You for Your Inquiry - Golden Celebrations Lawn`;
    const bodyHtml = `
      <h1>We've Received Your Event Inquiry!</h1>
      <p>Dear ${data.customerName},</p>
      <p>Thank you for reaching out to Golden Celebrations Lawn. We are excited about the possibility of hosting your milestone event.</p>
      
      <div class="highlight-card">
        <h3>Inquiry Details</h3>
        <table class="grid-table">
          <tr>
            <th>Event Type</th>
            <td>${data.eventType}</td>
          </tr>
          <tr>
            <th>Planned Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Estimated Guests</th>
            <td>${data.guests}</td>
          </tr>
          ${data.notes ? `<tr><th>Customer Notes</th><td>${data.notes}</td></tr>` : ''}
        </table>
      </div>

      <p>Our staging coordinators are reviewing your details. <strong>Note:</strong> To freeze this date on our public calendar immediately, please visit the portal page and submit the slot reservation deposit.</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Dear ${data.customerName}, thank you for your inquiry for a ${data.eventType} on ${data.eventDate}.`,
      html,
    });
  }

  /**
   * Phase 4 - Owner Inquiry Notification
   */
  public static async sendOwnerInquiryNotification(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventType: string;
    eventDate: string;
    guests: number;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const to = this.getOwnerEmail();
    const subject = `[INQUIRY] New Event Inquiry - ${data.customerName}`;
    const bodyHtml = `
      <h1>New Customer Event Inquiry</h1>
      <p>A new inquiry was submitted via the contact form:</p>
      
      <div class="highlight-card">
        <h3>Inquiry Details</h3>
        <table class="grid-table">
          <tr>
            <th>Name</th>
            <td>${data.customerName}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${data.customerEmail}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>${data.customerPhone}</td>
          </tr>
          <tr>
            <th>Event Type</th>
            <td>${data.eventType}</td>
          </tr>
          <tr>
            <th>Requested Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Guests Count</th>
            <td>${data.guests}</td>
          </tr>
          ${data.notes ? `<tr><th>Special Requests</th><td>${data.notes}</td></tr>` : ''}
        </table>
      </div>
      
      <p>This lead is listed in the CRM panel. Please check and assign a follow-up date.</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `New event inquiry from ${data.customerName} (${data.customerEmail}) for ${data.eventDate}.`,
      html,
    });
  }

  /**
   * Phase 5 - Password Reset Email
   */
  public static async sendPasswordReset(
    to: string,
    data: {
      resetLink: string;
      expiresAt: Date;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Password Reset Request - Golden Celebrations`;
    const formattedExpiry = data.expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bodyHtml = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password for the Golden Celebrations dashboard. If you didn't make this request, you can safely ignore this email.</p>
      
      <div class="highlight-card" style="text-align: center;">
        <p>This secure reset link is valid for <strong>1 hour</strong> (expires at ${formattedExpiry}).</p>
        <a href="${data.resetLink}" class="btn" style="color: #1c1917 !important;">Reset Password</a>
      </div>

      <p>Alternatively, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #78716c;">${data.resetLink}</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Please reset your password using the link: ${data.resetLink}`,
      html,
    });
  }

  /**
   * Phase 6 - Payment Receipt Email
   */
  public static async sendPaymentReceipt(
    to: string,
    data: {
      customerName: string;
      bookingId: string;
      transactionId: string;
      amount: number;
      remainingBalance: number;
      paymentDate: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Payment Receipt - Golden Celebrations Lawn`;
    const bodyHtml = `
      <h1>Payment Receipt Received</h1>
      <p>Dear ${data.customerName},</p>
      <p>Thank you for your payment. This email serves as an official receipt for the transaction listed below.</p>
      
      <div class="highlight-card">
        <h3>Transaction Record</h3>
        <table class="grid-table">
          <tr>
            <th>Booking ID</th>
            <td>${data.bookingId}</td>
          </tr>
          <tr>
            <th>Transaction Reference</th>
            <td>${data.transactionId}</td>
          </tr>
          <tr>
            <th>Payment Date</th>
            <td>${data.paymentDate}</td>
          </tr>
          <tr>
            <th>Amount Paid</th>
            <td>₹${data.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <th>Remaining Balance Due</th>
            <td>₹${data.remainingBalance.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Dear ${data.customerName}, receipt for payment of ₹${data.amount} for booking ${data.bookingId}. Remaining balance is ₹${data.remainingBalance}.`,
      html,
    });
  }

  /**
   * Staging - Booking Cancellation Notice
   */
  public static async sendBookingCancellation(
    to: string,
    data: {
      customerName: string;
      bookingId: string;
      eventDate: string;
      eventType: string;
      refundInfo?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Booking Cancellation: Event ID ${data.bookingId}`;
    const refundStatusHtml = data.refundInfo 
      ? `<tr><th>Refund Details</th><td>${data.refundInfo}</td></tr>` 
      : `<tr><th>Refund Details</th><td>Standard refund terms apply. Subject to review within 7-10 business days.</td></tr>`;

    const bodyHtml = `
      <h1>Booking Cancelled</h1>
      <p>Dear ${data.customerName},</p>
      <p>This email confirms that your event booking for <strong>${data.eventType}</strong> on <strong>${data.eventDate}</strong> has been cancelled.</p>
      
      <div class="highlight-card">
        <h3>Cancellation Summary</h3>
        <table class="grid-table">
          <tr>
            <th>Booking ID</th>
            <td>${data.bookingId}</td>
          </tr>
          <tr>
            <th>Event Date</th>
            <td>${data.eventDate}</td>
          </tr>
          <tr>
            <th>Event Type</th>
            <td>${data.eventType}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td style="color: #b91c1c;">CANCELLED</td>
          </tr>
          ${refundStatusHtml}
        </table>
      </div>

      <p>If this was done in error or if you have questions regarding our refund policies, please immediately contact our coordinator Shalini Meshram at +91 9823464705.</p>
    `;

    const html = this.getHtmlTemplate(subject, bodyHtml);
    return this.sendEmailWithRetry({
      to,
      subject,
      body: `Dear ${data.customerName}, booking ${data.bookingId} has been cancelled.`,
      html,
    });
  }
}
