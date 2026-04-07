import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/auth.js";

export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);
        req.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};