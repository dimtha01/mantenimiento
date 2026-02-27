import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || '1283764827163B';
const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  try {
    const { email, password, name, rolId } = req.body;

    if (!email || !password || !rolId) {
      return res.status(400).json({ message: 'email, password y rolId son requeridos' });
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.usuario.create({
      data: {
        email,
        password: hashed,
        nombre: name,
        rolId: Number(rolId),
      },
      select: { id: true, email: true, nombre: true, rol: true },
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

    const user = await prisma.usuario.findUnique({ 
      where: { email },
      include: { rol: true } // ← trae la relación
    });
    
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.rol.nombre // ← incluye rol en el JWT
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        nombre: user.nombre,
        rol: user.rol.nombre // ← devuelve "ADMIN" / "USER"
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno en login' });
  }
};
