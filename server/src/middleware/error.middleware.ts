import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Unhandled Error:', err);
  const status = err.status || 500;
  let errorMsg = err.message || 'Internal Server Error';
  
  if (status === 500) {
    const isDev = process.env.NODE_ENV === 'development';
    const hasPrismaDetails = errorMsg.includes('Prisma') || errorMsg.includes('prisma') || errorMsg.includes('database') || errorMsg.includes('db.qcpcxvzvcsilncgavdzh.supabase.co');
    if (!isDev || hasPrismaDetails) {
      errorMsg = 'An unexpected server error occurred. Please try again later.';
    }
  }

  res.status(status).json({
    error: errorMsg,
  });
}
