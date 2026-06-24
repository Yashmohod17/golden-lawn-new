import prisma from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RegisterInput, LoginInput, ResetPasswordInput, ChangePasswordInput } from '../validations/auth.validation';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'golden_celebrations_secret_key_123_abc_xyz';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'golden_celebrations_refresh_secret_key_987_def_uvw';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

export interface TokenUser {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  private generateAccessToken(user: TokenUser): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES_IN as any }
    );
  }

  private generateRefreshToken(user: TokenUser): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(data: RegisterInput) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new Error('A customer with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const joinedDateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const initials = data.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        address: data.address,
        avatar: initials || 'GC',
        joinedDate: joinedDateStr,
        role: 'CUSTOMER',
      },
    });

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    // Create a welcome notification using template
    try {
      await NotificationService.sendNotification({
        customerId: customer.id,
        templateName: 'welcome_email',
        variables: {
          name: customer.name
        },
        category: 'SYSTEM',
        priority: 'MEDIUM',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to send welcome notification:', err);
    }

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async login(data: LoginInput) {
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, customer.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async refresh(token: string) {
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.id },
    });

    if (!customer || customer.refreshToken !== token) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async logout(token: string) {
    const customer = await prisma.customer.findFirst({
      where: { refreshToken: token },
    });

    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { refreshToken: null },
      });
    }
  }

  async forgotPassword(email: string) {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new Error('A valid email address is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up customer or user (no account enumeration in returned response, but search DB first)
    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const accountExists = !!(customer || user);

    if (accountExists) {
      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save to PasswordResetToken table
      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expiresAt,
        },
      });

      // Send email via Resend (use EmailService)
      const resetLink = `http://localhost:4000/auth/reset-password?token=${token}`;

      try {
        await EmailService.sendPasswordReset(normalizedEmail, {
          resetLink,
          expiresAt
        });

        // Also add system/in-app notification if customer exists
        if (customer) {
          await NotificationService.sendNotification({
            customerId: customer.id,
            title: 'Password Reset Request Sent',
            message: `A password reset link has been dispatched to your email address: ${normalizedEmail}.`,
            category: 'SYSTEM',
            priority: 'HIGH',
            type: 'info',
          });
        }
      } catch (err) {
        console.error('Failed to send reset email:', err);
      }
    }

    // Generic response to prevent account enumeration
    return {
      message: 'If the provided email is registered, a password reset link has been sent to it.',
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    if (!data.token) {
      throw new Error('Reset token is required');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Retrieve the token record
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: data.token },
    });

    if (!resetTokenRecord || resetTokenRecord.used || resetTokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    let accountUpdated = false;
    let accountType: 'customer' | 'admin' = 'customer';

    // Update Customer or User table
    const customer = await prisma.customer.findUnique({
      where: { email: resetTokenRecord.email },
    });
    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          password: hashedPassword,
          refreshToken: null, // invalidate sessions
        },
      });
      accountUpdated = true;
      accountType = 'customer';

      // In-app notification
      try {
        await NotificationService.sendNotification({
          customerId: customer.id,
          title: 'Password Reset Successful',
          message: 'Your portal account password has been successfully updated.',
          category: 'SYSTEM',
          priority: 'MEDIUM',
          type: 'success',
        });
      } catch (err) {
        console.error('Failed to send reset success notification:', err);
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { email: resetTokenRecord.email },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
          },
        });
        accountUpdated = true;
        accountType = 'admin';
      }
    }

    if (!accountUpdated) {
      throw new Error('Account associated with this token was not found.');
    }

    // Mark token as used (single use)
    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { used: true },
    });

    return {
      message: 'Password has been reset successfully. Please login with your new password.',
      accountType,
    };
  }

  async changePassword(id: string, data: ChangePasswordInput) {
    // 1. Try to find in Customer table
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (customer) {
      const isPasswordValid = await bcrypt.compare(data.currentPassword, customer.password);
      if (!isPasswordValid) {
        throw new Error('Incorrect current password');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await prisma.customer.update({
        where: { id },
        data: {
          password: hashedPassword,
          refreshToken: null, // invalidate current refresh sessions
        },
      });

      // Create success notification using NotificationService
      try {
        await NotificationService.sendNotification({
          customerId: id,
          title: 'Password Changed',
          message: 'Your account password has been updated successfully.',
          category: 'SYSTEM',
          priority: 'MEDIUM',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to send change password notification:', err);
      }

      return {
        message: 'Password updated successfully',
      };
    }

    // 2. Try to find in User table (for Owners, Managers, Staff)
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Incorrect current password');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });

      // Create success notification using NotificationService
      try {
        await NotificationService.sendNotification({
          userId: id,
          title: 'Password Changed',
          message: 'Your account password has been updated successfully.',
          category: 'SYSTEM',
          priority: 'MEDIUM',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to send change password notification:', err);
      }

      return {
        message: 'Password updated successfully',
      };
    }

    throw new Error('Account profile not found');
  }
}

export const authService = new AuthService();
