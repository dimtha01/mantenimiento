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

export const deleteMarca = async (req, res) => {
    try {
        await prisma.marca.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(400).json({ ok: false, message: 'No se puede eliminar: está en uso por equipos.' });
    }
};

export const deleteTipo = async (req, res) => {
    try {
        await prisma.tipoEquipo.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(400).json({ ok: false, message: 'No se puede eliminar: está en uso por equipos.' });
    }
};

export const deleteUbicacion = async (req, res) => {
    try {
        await prisma.ubicacionEquipo.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(400).json({ ok: false, message: 'No se puede eliminar: está en uso por equipos.' });
    }
};

export const deletePropietario = async (req, res) => {
    try {
        await prisma.propietario.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(400).json({ ok: false, message: 'No se puede eliminar: está en uso por equipos.' });
    }
};

/* ── Tipos de Repuesto ───────────────────────────────────── */
export const getTiposRepuesto = async (_req, res) => {
    const data = await prisma.tipoRepuesto.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" }
    });
    return res.json({ ok: true, data });
};

export const createTipoRepuesto = async (req, res) => {
    try {
        const data = await prisma.tipoRepuesto.create({
            data: { nombre: req.body.nombre }
        });
        return res.json({ ok: true, data });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
};

export const deleteTipoRepuesto = async (req, res) => {
    try {
        await prisma.tipoRepuesto.delete({
            where: { id: Number(req.params.id) }
        });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(400).json({
            ok: false,
            message: 'No se puede eliminar: está en uso por repuestos.'
        });
    }
};
