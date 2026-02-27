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
        const { equipoId, fechaServicio, lecturaActual, observaciones, costoManoObra, costoServicios, costoRepuestos, costoTotal, tipoId, reiniciarHoras, planId } = req.body;

        const manoObra = costoManoObra != null ? Number(costoManoObra) : 0;
        const servicios = costoServicios != null ? Number(costoServicios) : 0;
        const repuestos = costoRepuestos != null ? Number(costoRepuestos) : 0;
        const totalCalculado = manoObra + servicios + repuestos;

        const registro = await prisma.registroMantenimiento.create({
            data: {
                equipoId: Number(equipoId),
                fechaServicio: new Date(fechaServicio),
                lecturaActual: Number(lecturaActual),
                observaciones: observaciones ?? null,
                costoManoObra: manoObra || null,
                costoServicios: servicios || null,
                costoRepuestos: repuestos || null,
                costoTotal: costoTotal != null ? Number(costoTotal) : (totalCalculado > 0 ? totalCalculado : null),
                tipoId: Number(tipoId),
            },
            include: INCLUDE_MANT,
        });

        // Si se especifica un planId, marcar ESE plan como ejecutado
        // La base del plan se actualiza al horómetro actual del equipo
        // Las horas acumuladas del equipo NUNCA se reinician (es un horómetro total)
        if (planId) {
            const equipo = await prisma.equipo.findUnique({
                where: { id: Number(equipoId) },
                select: { horasAcumuladas: true },
            });
            await prisma.planPreventivo.update({
                where: { id: Number(planId) },
                data: {
                    horasUltimaEjecucion: equipo?.horasAcumuladas ?? 0,
                    fechaUltimaEjecucion: new Date(),
                },
            });
        }

        return res.status(201).json({ ok: true, data: registro });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error creando registro de mantenimiento" });
    }
};

/* ── PUT /api/mantenimientos/:id ── */
export const updateMantenimiento = async (req, res) => {
    try {
        const { fechaServicio, lecturaActual, observaciones, costoManoObra, costoServicios, costoRepuestos, costoTotal, tipoId } = req.body;

        let data = {
            ...(fechaServicio ? { fechaServicio: new Date(fechaServicio) } : {}),
            ...(lecturaActual != null ? { lecturaActual: Number(lecturaActual) } : {}),
            ...(observaciones !== undefined ? { observaciones } : {}),
            ...(costoManoObra !== undefined ? { costoManoObra: costoManoObra != null ? Number(costoManoObra) : null } : {}),
            ...(costoServicios !== undefined ? { costoServicios: costoServicios != null ? Number(costoServicios) : null } : {}),
            ...(costoRepuestos !== undefined ? { costoRepuestos: costoRepuestos != null ? Number(costoRepuestos) : null } : {}),
            ...(tipoId != null ? { tipoId: Number(tipoId) } : {}),
        };

        if ((costoManoObra !== undefined || costoServicios !== undefined || costoRepuestos !== undefined) && costoTotal === undefined) {
            const manoObra = costoManoObra != null ? Number(costoManoObra) : 0;
            const servicios = costoServicios != null ? Number(costoServicios) : 0;
            const repuestos = costoRepuestos != null ? Number(costoRepuestos) : 0;
            const totalCalculado = manoObra + servicios + repuestos;
            if (totalCalculado > 0) data.costoTotal = totalCalculado;
        } else if (costoTotal !== undefined) {
            data.costoTotal = costoTotal != null ? Number(costoTotal) : null;
        }

        const registro = await prisma.registroMantenimiento.update({
            where: { id: Number(req.params.id) },
            data,
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

        // Calcular alerta con flujo: Meta = horasUltimaEjecucion + frecuencia
        // Umbral = 10% de frecuencia (mínimo 2h)
        // Alerta cuando horasEquipo >= Meta - Umbral
        const planesConAlerta = planes.map(plan => {
            const horasEquipo = plan.equipo?.horasAcumuladas ?? 0;
            const base = plan.horasUltimaEjecucion ?? 0;
            const frecuencia = plan.frecuenciaValor;
            const meta = base + frecuencia;
            const umbral = Math.max(2, Math.round(frecuencia * 0.1));
            const horasRestantes = meta - horasEquipo;
            const porcentaje = frecuencia > 0
                ? ((horasEquipo - base) / frecuencia) * 100
                : 0;

            let nivelAlerta = 'normal';
            if (horasEquipo >= meta) nivelAlerta = 'critico';                   // Ya pasó la meta
            else if (horasEquipo >= meta - umbral) nivelAlerta = 'advertencia'; // Dentro del umbral
            else if (porcentaje >= 70) nivelAlerta = 'precaucion';              // >70% avance

            return {
                ...plan,
                meta,
                umbral,
                horasEquipo,
                horasRestantes: Math.max(0, horasRestantes),
                porcentajeAvance: Math.min(100, Math.max(0, porcentaje)),
                nivelAlerta,
            };
        });

        return res.json({ ok: true, data: planesConAlerta });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo planes" });
    }
};

/* ── POST /api/planes ── */
export const createPlan = async (req, res) => {
    try {
        const { equipoId, descripcionTarea, frecuenciaValor } = req.body;

        // Obtener horas actuales del equipo para registrar como punto de inicio
        const equipo = await prisma.equipo.findUnique({
            where: { id: Number(equipoId) },
            select: { horasAcumuladas: true },
        });

        const plan = await prisma.planPreventivo.create({
            data: {
                equipoId: Number(equipoId),
                descripcionTarea,
                frecuenciaValor: Number(frecuenciaValor),
                horasUltimaEjecucion: equipo?.horasAcumuladas ?? 0,
                fechaUltimaEjecucion: new Date(),
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
        const { descripcionTarea, frecuenciaValor, marcarEjecutado } = req.body;

        let data = {
            ...(descripcionTarea ? { descripcionTarea } : {}),
            ...(frecuenciaValor != null ? { frecuenciaValor: Number(frecuenciaValor) } : {}),
        };

        // Si se marca como ejecutado, actualizar la base de ESTE plan al horómetro actual
        // Las horas del equipo NO se reinician (múltiples planes comparten el mismo horómetro)
        if (marcarEjecutado) {
            const planExistente = await prisma.planPreventivo.findUnique({
                where: { id: Number(req.params.id) },
                include: { equipo: { select: { horasAcumuladas: true } } },
            });
            data.horasUltimaEjecucion = planExistente?.equipo?.horasAcumuladas ?? 0;
            data.fechaUltimaEjecucion = new Date();
        }

        const plan = await prisma.planPreventivo.update({
            where: { id: Number(req.params.id) },
            data,
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
