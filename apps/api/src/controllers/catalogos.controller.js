import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMarcas = async (_req, res) => {
    const data = await prisma.marca.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};

export const getTipos = async (_req, res) => {
    const data = await prisma.tipoEquipo.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};

export const getUbicaciones = async (_req, res) => {
    const data = await prisma.ubicacionEquipo.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};

export const getPropietarios = async (_req, res) => {
    const data = await prisma.propietario.findMany({ orderBy: { nombre: "asc" } });
    return res.json({ ok: true, data });
};

export const getParametros = async (_req, res) => {
    const data = await prisma.parametroControl.findMany({ orderBy: { id: "asc" } });
    return res.json({ ok: true, data });
};
