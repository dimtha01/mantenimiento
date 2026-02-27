import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const INCLUDE = { rol: true };

/* ── GET /api/usuarios ─────────────────────────────────────────── */
export const getUsuarios = async (req, res) => {
    try {
        const { search = '', rolId, skip = '0', take = '50' } = req.query;

        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { nombre: { contains: search, mode: 'insensitive' } },
                            { apellido: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                rolId ? { rolId: Number(rolId) } : {},
            ],
        };

        const [data, total] = await Promise.all([
            prisma.usuario.findMany({
                where,
                include: INCLUDE,
                orderBy: { createdAt: 'desc' },
                skip: Number(skip),
                take: Number(take),
            }),
            prisma.usuario.count({ where }),
        ]);

        // Nunca devolvemos la contraseña
        const safe = data.map(({ password, ...u }) => u);
        return res.json({ ok: true, data: safe, total });
    } catch (err) {
        console.error('getUsuarios', err);
        return res.status(500).json({ ok: false, message: 'Error al obtener usuarios' });
    }
};

/* ── GET /api/usuarios/:id ─────────────────────────────────────── */
export const getUsuario = async (req, res) => {
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: Number(req.params.id) },
            include: INCLUDE,
        });
        if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        const { password, ...safe } = user;
        return res.json({ ok: true, data: safe });
    } catch (err) {
        console.error('getUsuario', err);
        return res.status(500).json({ ok: false, message: 'Error al obtener usuario' });
    }
};

/* ── POST /api/usuarios ────────────────────────────────────────── */
export const createUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rolId } = req.body;

        if (!email || !password || !rolId) {
            return res.status(400).json({ ok: false, message: 'email, password y rol son requeridos' });
        }

        const exists = await prisma.usuario.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ ok: false, message: 'El email ya está registrado' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.usuario.create({
            data: { nombre: nombre || null, apellido: apellido || null, email, password: hashed, rolId: Number(rolId) },
            include: INCLUDE,
        });

        const { password: _, ...safe } = user;
        return res.status(201).json({ ok: true, data: safe });
    } catch (err) {
        console.error('createUsuario', err);
        return res.status(500).json({ ok: false, message: 'Error al crear usuario' });
    }
};

/* ── PUT /api/usuarios/:id ─────────────────────────────────────── */
export const updateUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, rolId } = req.body;
        const id = Number(req.params.id);

        // Verificar email único (si cambia)
        if (email) {
            const dup = await prisma.usuario.findFirst({ where: { email, NOT: { id } } });
            if (dup) return res.status(409).json({ ok: false, message: 'El email ya está en uso por otro usuario' });
        }

        const user = await prisma.usuario.update({
            where: { id },
            data: {
                ...(nombre !== undefined ? { nombre } : {}),
                ...(apellido !== undefined ? { apellido } : {}),
                ...(email !== undefined ? { email } : {}),
                ...(rolId !== undefined ? { rolId: Number(rolId) } : {}),
            },
            include: INCLUDE,
        });

        const { password, ...safe } = user;
        return res.json({ ok: true, data: safe });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        console.error('updateUsuario', err);
        return res.status(500).json({ ok: false, message: 'Error al actualizar usuario' });
    }
};

/* ── PUT /api/usuarios/:id/password ───────────────────────────── */
export const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.usuario.update({
            where: { id: Number(req.params.id) },
            data: { password: hashed },
        });

        return res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        console.error('resetPassword', err);
        return res.status(500).json({ ok: false, message: 'Error al actualizar contraseña' });
    }
};

/* ── DELETE /api/usuarios/:id ──────────────────────────────────── */
export const deleteUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Proteger: no eliminar si es el único ADMIN
        const user = await prisma.usuario.findUnique({ where: { id }, include: { rol: true } });
        if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

        if (user.rol.nombre === 'ADMIN') {
            const adminCount = await prisma.usuario.count({ where: { rol: { nombre: 'ADMIN' } } });
            if (adminCount <= 1) {
                return res.status(400).json({ ok: false, message: 'No se puede eliminar el único administrador del sistema' });
            }
        }

        await prisma.usuario.delete({ where: { id } });
        return res.json({ ok: true, message: 'Usuario eliminado' });
    } catch (err) {
        console.error('deleteUsuario', err);
        return res.status(500).json({ ok: false, message: 'Error al eliminar usuario' });
    }
};

/* ── GET /api/usuarios/roles ───────────────────────────────────── */
export const getRoles = async (_req, res) => {
    try {
        const data = await prisma.rol.findMany({ orderBy: { nombre: 'asc' } });
        return res.json({ ok: true, data });
    } catch (err) {
        return res.status(500).json({ ok: false, message: 'Error al obtener roles' });
    }
};
