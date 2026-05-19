"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};
exports.verifyJWT = verifyJWT;
const authorize = (roles) => {
    return (req, res, next) => {
        // Case-insensitive role comparison to handle DB inconsistencies (admin vs Admin vs ADMIN)
        const userRole = (req.user?.role || '').toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());
        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access Denied' });
        }
        next();
    };
};
exports.authorize = authorize;
