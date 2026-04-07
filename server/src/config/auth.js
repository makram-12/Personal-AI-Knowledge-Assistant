import dotenv from "dotenv";

dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || "dev-only-secret-change-me";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";