"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('email', db_1.sql.NVarChar, email)
            .query('SELECT * FROM [User] WHERE Email = @email AND IsActive = 1');
        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Note: In production, you MUST use bcrypt.compare
        // For demo/seed purposes where passwords might be plain text in SQL:
        const isMatch = password === user.PasswordHash || await bcryptjs_1.default.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.UserID, email: user.Email, role: user.Role, fullName: user.FullName }, (process.env.JWT_SECRET || 'secret'), { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') });
        res.json({
            token,
            role: user.Role,
            email: user.Email,
            fullName: user.FullName,
            userId: user.UserID
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
