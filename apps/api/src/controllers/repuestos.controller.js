import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ── GET /api/repuestos?equipoId=1 ── */
export const getRepuestos = async (req, res) => {
    try {
        const { equipoId } = req.query;

        if (!equipoId) {
            return res.status(400).json({ ok: false, message: "Se requiere el parámetro equipoId" });
        }

        const repuestos = await prisma.repuesto.findMany({
            where: { equipoId: Number(equipoId) },
            orderBy: { nombre: "asc" },
            include: {
                mantenimientos: {
                    include: {
                        mantenimiento: { select: { id: true, fechaServicio: true } },
                    },
                },
            },
        });

        return res.json({ ok: true, data: repuestos });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo repuestos" });
    }
};

/* ── POST /api/repuestos ── */
export const createRepuesto = async (req, res) => {
    try {
        const { equipoId, nombre, tipo, codigo, costo } = req.body;

        if (!equipoId || !nombre) {
            return res.status(400).json({ ok: false, message: "Se requieren equipoId y nombre" });
        }

        const TIPOS_VALIDOS = ["FILTRO", "CORREA", "ACEITE", "OTRO"];
        const tipoFinal = tipo && TIPOS_VALIDOS.includes(tipo.toUpperCase()) ? tipo.toUpperCase() : "OTRO";

        const repuesto = await prisma.repuesto.create({
            data: {
                equipoId: Number(equipoId),
                nombre: nombre.trim(),
                tipo: tipoFinal,
                codigo: codigo?.trim() || null,
                costo: costo != null ? Number(costo) : null,
            },
        });

        return res.status(201).json({ ok: true, data: repuesto });
    } catch (err) {
        console.error(err);
        if (err.code === "P2003") {
            return res.status(400).json({ ok: false, message: "Equipo no encontrado" });
        }
        return res.status(500).json({ ok: false, message: "Error creando repuesto" });
    }
};

/* ── PUT /api/repuestos/:id ── */
export const updateRepuesto = async (req, res) => {
    try {
        const { nombre, tipo, codigo, costo } = req.body;
        const TIPOS_VALIDOS = ["FILTRO", "CORREA", "ACEITE", "OTRO"];

        const data = {};
        if (nombre) data.nombre = nombre.trim();
        if (tipo && TIPOS_VALIDOS.includes(tipo.toUpperCase())) data.tipo = tipo.toUpperCase();
        if (codigo !== undefined) data.codigo = codigo?.trim() || null;
        if (costo !== undefined) data.costo = costo != null ? Number(costo) : null;

        const repuesto = await prisma.repuesto.update({
            where: { id: Number(req.params.id) },
            data,
        });

        return res.json({ ok: true, data: repuesto });
    } catch (err) {
        console.error(err);
        if (err.code === "P2025") {
            return res.status(404).json({ ok: false, message: "Repuesto no encontrado" });
        }
        return res.status(500).json({ ok: false, message: "Error actualizando repuesto" });
    }
};

/* ── DELETE /api/repuestos/:id ── */
export const deleteRepuesto = async (req, res) => {
    try {
        await prisma.repuesto.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true, message: "Repuesto eliminado" });
    } catch (err) {
        console.error(err);
        if (err.code === "P2025") {
            return res.status(404).json({ ok: false, message: "Repuesto no encontrado" });
        }
        return res.status(500).json({ ok: false, message: "Error eliminando repuesto" });
    }
};

/* ── POST /api/repuestos/asociar ── */
/* Asociar repuestos a un registro de mantenimiento */
export const asociarRepuestosMantenimiento = async (req, res) => {
    try {
        const { mantenimientoId, repuestos } = req.body;
        // repuestos: [{ repuestoId: 1, cantidad: 2 }]

        if (!mantenimientoId || !Array.isArray(repuestos) || repuestos.length === 0) {
            return res.status(400).json({ ok: false, message: "Se requieren mantenimientoId y un array de repuestos" });
        }

        // Eliminar asociaciones anteriores y recrearlas
        await prisma.repuestoMantenimiento.deleteMany({
            where: { mantenimientoId: Number(mantenimientoId) },
        });

        const creados = await prisma.repuestoMantenimiento.createMany({
            data: repuestos.map((r) => ({
                mantenimientoId: Number(mantenimientoId),
                repuestoId: Number(r.repuestoId),
                cantidad: Number(r.cantidad) || 1,
            })),
        });

        return res.status(201).json({ ok: true, data: creados });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error asociando repuestos al mantenimiento" });
    }
};
