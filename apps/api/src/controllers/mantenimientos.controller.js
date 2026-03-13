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
    repuestos: {
        include: {
            repuesto: true
        }
    }
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
        const { equipoId, fechaServicio, lecturaActual, observaciones, costoManoObra, costoServicios, costoRepuestos, costoTotal, tipoId, reiniciarHoras, planId, repuestosUtilizados } = req.body;

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
                ...(repuestosUtilizados?.length > 0 && {
                    repuestos: {
                        create: repuestosUtilizados.map(r => ({
                            repuestoId: Number(r.id),
                            cantidad: Number(r.cantidad) || 1
                        }))
                    }
                })
            },
            include: INCLUDE_MANT,
        });

        const equipo = await prisma.equipo.findUnique({
            where: { id: Number(equipoId) },
            select: { horasAcumuladas: true },
        });

        const nuevaLectura = Math.max(Number(lecturaActual), equipo?.horasAcumuladas ?? 0);

        // Actualizar el equipo con la nueva lectura de horas
        await prisma.equipo.update({
            where: { id: Number(equipoId) },
            data: {
                horasAcumuladas: nuevaLectura,
            },
        });

        // Si se especifica un planId, marcar ESE plan como ejecutado
        if (planId) {
            await prisma.planPreventivo.update({
                where: { id: Number(planId) },
                data: {
                    horasUltimaEjecucion: nuevaLectura,
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
        const { equipoId, descripcionTarea, frecuenciaValor, costoEstimado } = req.body;

        if (!equipoId || !descripcionTarea || !frecuenciaValor) {
            return res.status(400).json({ ok: false, message: 'equipoId, descripcionTarea y frecuenciaValor son obligatorios' });
        }

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
                costoEstimado: costoEstimado != null && costoEstimado !== '' ? Number(costoEstimado) : null,
                horasUltimaEjecucion: equipo?.horasAcumuladas ?? 0,
                fechaUltimaEjecucion: new Date(),
            },
            include: { equipo: { include: { parametro: true } } },
        });
        return res.status(201).json({ ok: true, data: plan });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error creando plan' });
    }
};

/* ── PUT /api/planes/:id ── */
export const updatePlan = async (req, res) => {
    try {
        const { descripcionTarea, frecuenciaValor, costoEstimado, marcarEjecutado } = req.body;

        let data = {
            ...(descripcionTarea ? { descripcionTarea } : {}),
            ...(frecuenciaValor != null ? { frecuenciaValor: Number(frecuenciaValor) } : {}),
            ...(costoEstimado !== undefined ? { costoEstimado: costoEstimado != null && costoEstimado !== '' ? Number(costoEstimado) : null } : {}),
        };

        // Si se marca como ejecutado, actualizar la base de ESTE plan al horómetro actual
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
        return res.status(500).json({ ok: false, message: 'Error actualizando plan' });
    }
};

/* ── DELETE /api/planes/:id ── */
export const deletePlan = async (req, res) => {
    try {
        await prisma.planPreventivo.delete({ where: { id: Number(req.params.id) } });
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error eliminando plan' });
    }
};

/* ── GET /api/tipos-mantenimiento ── */
export const getTiposMantenimiento = async (_req, res) => {
    try {
        const data = await prisma.tipoMantenimiento.findMany({ orderBy: { nombre: 'asc' } });
        return res.json({ ok: true, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error obteniendo tipos' });
    }
};

/* ── GET /api/mantenimientos/analisis-financiero?equipoId= ── */
export const getAnalisisFinanciero = async (req, res) => {
    try {
        const { equipoId } = req.query;
        const where = equipoId ? { equipoId: Number(equipoId) } : {};

        const [planes, registros, fallas] = await Promise.all([
            prisma.planPreventivo.findMany({
                where,
                orderBy: { id: 'asc' },
            }),
            prisma.registroMantenimiento.findMany({
                where,
                include: { tipo: true, repuestos: { include: { repuesto: true } } },
                orderBy: { fechaServicio: 'desc' },
            }),
            prisma.registroFalla.findMany({
                where,
                orderBy: { fecha: 'desc' },
            }),
        ]);

        // 1. Presupuestado: suma de costoEstimado de todos los planes preventivos activos
        const totalPresupuestado = planes.reduce((s, p) => s + Number(p.costoEstimado ?? 0), 0);

        // 2. Costo Real de Mantenimientos: suma de todos los registros ejecutados
        const costoMantenimientos = registros.reduce((s, r) => {
            const sub = (Number(r.costoManoObra ?? 0) + Number(r.costoServicios ?? 0) + Number(r.costoRepuestos ?? 0));
            return s + (sub > 0 ? sub : Number(r.costoTotal ?? 0));
        }, 0);

        // 3. Costo Real de Repuestos: suma de todos los repuestos usados
        const costoRepuestosUsados = registros.reduce((s, r) => {
            return s + (r.repuestos?.reduce((sum, rm) => {
                return sum + (Number(rm.repuesto?.costo) || 0) * (rm.cantidad || 1);
            }, 0) || 0);
        }, 0);

        // 4. Costo Real de Fallas: suma de costos de reparación
        const costoFallas = fallas.reduce((s, f) => s + Number(f.costoReparacion ?? 0), 0);

        // Total Real: Mantenimientos + Repuestos + Fallas
        const totalReal = costoMantenimientos + costoRepuestosUsados + costoFallas;

        const delta = totalReal - totalPresupuestado;
        const porcentajeDiferencia = totalPresupuestado > 0 ? ((delta / totalPresupuestado) * 100) : 0;

        // Desglose por plan: cuánto se estimó vs cuánto costó
        const desglosePlanes = planes.map(p => {
            // Buscar registros preventivos relacionados con este plan
            const fechaBase = p.fechaUltimaEjecucion ? new Date(p.fechaUltimaEjecucion) : new Date(0);
            const registrosAsociados = registros.filter(r => {
                const fechaServ = new Date(r.fechaServicio);
                return r.tipo?.nombre === 'PREVENTIVO' && fechaServ >= fechaBase;
            });

            const costoRealEjecuciones = registrosAsociados.reduce((s, r) => {
                const sub = (Number(r.costoManoObra ?? 0) + Number(r.costoServicios ?? 0) + Number(r.costoRepuestos ?? 0));
                return s + (sub > 0 ? sub : Number(r.costoTotal ?? 0));
            }, 0);

            const repuestosUsados = registrosAsociados.reduce((s, r) => {
                return s + (r.repuestos?.reduce((sum, rm) => {
                    return sum + (Number(rm.repuesto?.costo) || 0) * (rm.cantidad || 1);
                }, 0) || 0);
            }, 0);

            return {
                planId: p.id,
                descripcionTarea: p.descripcionTarea,
                frecuenciaValor: p.frecuenciaValor,
                costoEstimado: Number(p.costoEstimado ?? 0),
                costoRealEjecuciones: Math.round(costoRealEjecuciones * 100) / 100,
                costoRepuestos: Math.round(repuestosUsados * 100) / 100,
                totalReal: Math.round((costoRealEjecuciones + repuestosUsados) * 100) / 100,
                delta: Math.round(((costoRealEjecuciones + repuestosUsados) - Number(p.costoEstimado ?? 0)) * 100) / 100,
                ejecuciones: registrosAsociados.length,
            };
        });

        // Desglose por tipo de mantenimiento
        const tiposUnique = [...new Set(registros.map(r => r.tipo?.nombre ?? 'DESCONOCIDO'))];
        const desgloseTipos = tiposUnique.map(tipo => {
            const regs = registros.filter(r => (r.tipo?.nombre ?? 'DESCONOCIDO') === tipo);
            const costoManoObra = regs.reduce((s, r) => s + Number(r.costoManoObra ?? 0), 0);
            const costoServicios = regs.reduce((s, r) => s + Number(r.costoServicios ?? 0), 0);
            const costoRepuestos = regs.reduce((s, r) => s + Number(r.costoRepuestos ?? 0), 0);
            const costoTotal = costoManoObra + costoServicios + costoRepuestos;

            return {
                tipo,
                count: regs.length,
                costoManoObra: Math.round(costoManoObra * 100) / 100,
                costoServicios: Math.round(costoServicios * 100) / 100,
                costoRepuestos: Math.round(costoRepuestos * 100) / 100,
                costoTotal: Math.round(costoTotal * 100) / 100,
            };
        });

        // Análisis temporal (últimos 12 meses)
        const hace12Meses = new Date();
        hace12Meses.setMonth(hace12Meses.getMonth() - 12);
        const registrosUltimoAnio = registros.filter(r => new Date(r.fechaServicio) >= hace12Meses);
        const costoUltimoAnio = registrosUltimoAnio.reduce((s, r) => {
            const sub = (Number(r.costoManoObra ?? 0) + Number(r.costoServicios ?? 0) + Number(r.costoRepuestos ?? 0));
            return s + (sub > 0 ? sub : Number(r.costoTotal ?? 0));
        }, 0);

        // Promedio mensual
        const promedioMensual = costoUltimoAnio / 12;

        return res.json({
            ok: true,
            data: {
                resumen: {
                    totalPresupuestado: Math.round(totalPresupuestado * 100) / 100,
                    costoMantenimientos: Math.round(costoMantenimientos * 100) / 100,
                    costoRepuestosUsados: Math.round(costoRepuestosUsados * 100) / 100,
                    costoFallas: Math.round(costoFallas * 100) / 100,
                    totalReal: Math.round(totalReal * 100) / 100,
                    delta: Math.round(delta * 100) / 100,
                    porcentajeDiferencia: Math.round(porcentajeDiferencia * 100) / 100,
                    variacionText: delta > 0 ? 'Sobre presupuesto' : delta < 0 ? 'Bajo presupuesto' : 'Presupuesto exacto',
                },
                temporal: {
                    costoUltimoAnio: Math.round(costoUltimoAnio * 100) / 100,
                    promedioMensual: Math.round(promedioMensual * 100) / 100,
                    totalRegistrosAnio: registrosUltimoAnio.length,
                },
                totalRegistros: registros.length,
                totalPlanes: planes.length,
                totalFallas: fallas.length,
                desglosePlanes,
                desgloseTipos,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error en análisis financiero' });
    }
};
