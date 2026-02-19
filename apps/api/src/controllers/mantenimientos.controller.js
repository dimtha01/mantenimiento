import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const INCLUDE_MANT = {
    tipo: true,
    equipo: {
        include: {
            marca: true,
            tipo: true,
            ubicacion: true,
            parametro: true,
        },
    },
};

/* ── GET /api/mantenimientos ── */
export const getMantenimientos = async (req, res) => {
    try {
        const { equipoId, take = "200", skip = "0", tipoNombre } = req.query;

        const where = {
            ...(equipoId ? { equipoId: Number(equipoId) } : {}),
            ...(tipoNombre ? { tipo: { nombre: tipoNombre } } : {}),
        };

        const [registros, total] = await Promise.all([
            prisma.registroMantenimiento.findMany({
                where,
                take: Math.min(parseInt(take) || 200, 500),
                skip: parseInt(skip) || 0,
                orderBy: { fechaServicio: "desc" },
                include: INCLUDE_MANT,
            }),
            prisma.registroMantenimiento.count({ where }),
        ]);

        // KPIs globales
        const tiposAgg = await prisma.registroMantenimiento.groupBy({
            by: ["tipoId"],
            _count: { tipoId: true },
            _sum: { costoTotal: true },
        });
        const tiposMant = await prisma.tipoMantenimiento.findMany();
        const tipoMap = Object.fromEntries(tiposMant.map((t) => [t.id, t.nombre]));

        const kpis = {
            total,
            porTipo: tiposAgg.map((g) => ({
                tipo: tipoMap[g.tipoId] ?? "DESCONOCIDO",
                count: g._count.tipoId,
                costo: Number(g._sum.costoTotal ?? 0),
            })),
        };

        return res.json({ ok: true, data: registros, kpis });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo mantenimientos" });
    }
};

/* ── GET /api/mantenimientos/:id ── */
export const getMantenimientoById = async (req, res) => {
    try {
        const registro = await prisma.registroMantenimiento.findUnique({
            where: { id: Number(req.params.id) },
            include: INCLUDE_MANT,
        });
        if (!registro)
            return res.status(404).json({ ok: false, message: "Registro no encontrado" });
        return res.json({ ok: true, data: registro });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo registro" });
    }
};

/* ── POST /api/mantenimientos ── */
export const createMantenimiento = async (req, res) => {
    try {
        const { equipoId, fechaServicio, lecturaActual, observaciones, costoTotal, tipoId } = req.body;

        const registro = await prisma.registroMantenimiento.create({
            data: {
                equipoId: Number(equipoId),
                fechaServicio: new Date(fechaServicio),
                lecturaActual: Number(lecturaActual),
                observaciones: observaciones ?? null,
                costoTotal: costoTotal != null ? Number(costoTotal) : null,
                tipoId: Number(tipoId),
            },
            include: INCLUDE_MANT,
        });

        return res.status(201).json({ ok: true, data: registro });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error creando registro de mantenimiento" });
    }
};

/* ── PUT /api/mantenimientos/:id ── */
export const updateMantenimiento = async (req, res) => {
    try {
        const { fechaServicio, lecturaActual, observaciones, costoTotal, tipoId } = req.body;

        const registro = await prisma.registroMantenimiento.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(fechaServicio ? { fechaServicio: new Date(fechaServicio) } : {}),
                ...(lecturaActual != null ? { lecturaActual: Number(lecturaActual) } : {}),
                ...(observaciones !== undefined ? { observaciones } : {}),
                ...(costoTotal !== undefined ? { costoTotal: costoTotal != null ? Number(costoTotal) : null } : {}),
                ...(tipoId != null ? { tipoId: Number(tipoId) } : {}),
            },
            include: INCLUDE_MANT,
        });

        return res.json({ ok: true, data: registro });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error actualizando registro" });
    }
};

/* ── DELETE /api/mantenimientos/:id ── */
export const deleteMantenimiento = async (req, res) => {
    try {
        await prisma.registroMantenimiento.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error eliminando registro" });
    }
};

/* ── GET /api/planes ── */
export const getPlanes = async (req, res) => {
    try {
        const { equipoId } = req.query;
        const where = equipoId ? { equipoId: Number(equipoId) } : {};
        const planes = await prisma.planPreventivo.findMany({
            where,
            orderBy: { id: "asc" },
            include: {
                equipo: { include: { marca: true, tipo: true, ubicacion: true, parametro: true } },
            },
        });
        return res.json({ ok: true, data: planes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo planes" });
    }
};

/* ── POST /api/planes ── */
export const createPlan = async (req, res) => {
    try {
        const { equipoId, descripcionTarea, frecuenciaValor } = req.body;
        const plan = await prisma.planPreventivo.create({
            data: {
                equipoId: Number(equipoId),
                descripcionTarea,
                frecuenciaValor: Number(frecuenciaValor),
            },
            include: { equipo: { include: { parametro: true } } },
        });
        return res.status(201).json({ ok: true, data: plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error creando plan" });
    }
};

/* ── PUT /api/planes/:id ── */
export const updatePlan = async (req, res) => {
    try {
        const { descripcionTarea, frecuenciaValor } = req.body;
        const plan = await prisma.planPreventivo.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(descripcionTarea ? { descripcionTarea } : {}),
                ...(frecuenciaValor != null ? { frecuenciaValor: Number(frecuenciaValor) } : {}),
            },
            include: { equipo: { include: { parametro: true } } },
        });
        return res.json({ ok: true, data: plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error actualizando plan" });
    }
};

/* ── DELETE /api/planes/:id ── */
export const deletePlan = async (req, res) => {
    try {
        await prisma.planPreventivo.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error eliminando plan" });
    }
};

/* ── GET /api/tipos-mantenimiento ── */
export const getTiposMantenimiento = async (_req, res) => {
    try {
        const data = await prisma.tipoMantenimiento.findMany({ orderBy: { nombre: "asc" } });
        return res.json({ ok: true, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo tipos" });
    }
};
