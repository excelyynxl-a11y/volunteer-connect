import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorised - No Token Provided."
            }); 
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded.userId, deletedAt: null }).select('-password');

        if (!user) {
            return res.status(401).json({ 
                message: "Unauthorised - User no longer exists."
            });
        }

        if (user.approvalStatus !== "approved") {
            return res.status(403).json({
                message: "Account is not approved.",
                approvalStatus: user.approvalStatus,
                role: user.role,
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log('Error in auth middleware: ', err.message);
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Unauthorised - Invalid or expired token."
            });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin only.'
        });
    }

    next();
}

export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`
            });
        }

        next();
    };
};
