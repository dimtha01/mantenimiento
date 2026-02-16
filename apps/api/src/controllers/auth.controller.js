import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';
const SALT_ROUNDS = 10;

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email y password son requeridos' });
        }

        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.usuario.create({
            data: { email, password: hashed, name },
            select: { id: true, email: true, name: true },
        });

        return res.status(201).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno en registro', error: err.message, stack: err.stack });

    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email y password son requeridos' });
        }

        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno en login' });
    }
};
