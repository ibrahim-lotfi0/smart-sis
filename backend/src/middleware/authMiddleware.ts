import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Case-insensitive role comparison to handle DB inconsistencies (admin vs Admin vs ADMIN)
    const userRole = (req.user?.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());
    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    next();
  };
};
