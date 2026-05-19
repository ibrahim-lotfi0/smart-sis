import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { poolPromise, sql } from '../config/db';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE Email = @email AND IsActive = 1');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Note: In production, you MUST use bcrypt.compare
    // For demo/seed purposes where passwords might be plain text in SQL:
    const isMatch = password === user.PasswordHash || await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role, fullName: user.FullName },
      (process.env.JWT_SECRET || 'secret') as jwt.Secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
    );

    res.json({
      token,
      role: user.Role,
      email: user.Email,
      fullName: user.FullName,
      userId: user.UserID
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
