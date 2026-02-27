import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMarcas = async (_req, res) => {
    const data = await prisma.marca.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};
export const createMarca = async (req, res) => {
    try {
        const data = await prisma.marca.create({ data: { nombre: req.body.nombre } });
        return res.json({ ok: true, data });
    } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
};

export const getTipos = async (_req, res) => {
    const data = await prisma.tipoEquipo.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};
export const createTipo = async (req, res) => {
    try {
        const data = await prisma.tipoEquipo.create({ data: { nombre: req.body.nombre } });
        return res.json({ ok: true, data });
    } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
};

export const getUbicaciones = async (_req, res) => {
    const data = await prisma.ubicacionEquipo.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};
export const createUbicacion = async (req, res) => {
    try {
        const data = await prisma.ubicacionEquipo.create({ data: { nombre: req.body.nombre } });
        return res.json({ ok: true, data });
    } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
};

export const getPropietarios = async (_req, res) => {
    const data = await prisma.propietario.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};
export const createPropietario = async (req, res) => {
    try {
        const data = await prisma.propietario.create({ data: { nombre: req.body.nombre } });
        return res.json({ ok: true, data });
    } catch (e) { return res.status(500).json({ ok: false, message: e.message }); }
};

export const getParametros = async (_req, res) => {
    const data = await prisma.parametroControl.findMany({ orderBy: { id: "asc" } });
    return res.json({ ok: true, data });
};
