import { getCurrentUser, loginUser, registerUser } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const me = async (req, res) => {
    try {
        const user = await getCurrentUser(req.user.id);
        res.json({ user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};