import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { jwtExpiresIn, jwtSecret } from "../config/auth.js";

const signToken = (user) =>
    jwt.sign(
        {
            sub: user._id.toString(),
            email: user.email,
            name: user.name,
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );

export const registerUser = async ({ name, email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const passwordValue = String(password || "");

    if (!normalizedName || !normalizedEmail || !passwordValue) {
        const error = new Error("Name, email, and password are required");
        error.statusCode = 400;
        throw error;
    }

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
        const error = new Error("Email already in use");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(passwordValue, 12);

    const user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
    });

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    };
};

export const loginUser = async ({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const passwordValue = String(password || "");

    if (!normalizedEmail || !passwordValue) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(passwordValue, user.passwordHash);

    if (!passwordMatches) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    };
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        id: user._id,
        name: user.name,
        email: user.email,
    };
};