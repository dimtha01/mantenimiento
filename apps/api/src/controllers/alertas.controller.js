import { PrismaClient } from "@prisma/client";
import { evaluarAlertasPreventivas } from "../services/cronAlertas.js";

const prisma = new PrismaClient();

/* ── GET /api/alertas ── */
export const getAlertas = async (req, res) => {
    try {
        const { leida, resuelta, equipoId, tipo, take = "100", skip = "0" } = req.query;

        const where = {
            ...(leida !== undefined ? { leida: leida === "true" } : {}),
            ...(resuelta !== undefined ? { resuelta: resuelta === "true" } : {}),
            ...(equipoId ? { equipoId: Number(equipoId) } : {}),
            ...(tipo ? { tipo } : {}),
        };

        const [alertas, total] = await Promise.all([
            prisma.alertaPreventiva.findMany({
                where,
                take: Math.min(parseInt(take) || 100, 500),
                skip: parseInt(skip) || 0,
                orderBy: { creadoEn: "desc" },
                include: {
                    equipo: {
                        select: {
                            id: true,
                            codigo: true,
                            modelo: true,
                            horasAcumuladas: true,
                            horometroActual: true,
                            marca: { select: { nombre: true } },
                            tipo: { select: { nombre: true } },
                            ubicacion: { select: { nombre: true } },
                        },
                    },
                    plan: {
                        select: {
                            id: true,
                            descripcionTarea: true,
                            frecuenciaValor: true,
                            frecuenciaHoras: true,
                            horasUltimaEjecucion: true,
                        },
                    },
                },
            }),
            prisma.alertaPreventiva.count({ where }),
        ]);

        // KPIs
        const [totalNoLeidas, totalCriticas, totalVencidas] = await Promise.all([
            prisma.alertaPreventiva.count({ where: { leida: false, resuelta: false } }),
            prisma.alertaPreventiva.count({ where: { tipo: "CRITICO", resuelta: false } }),
            prisma.alertaPreventiva.count({ where: { tipo: "VENCIDO", resuelta: false } }),
        ]);

        return res.json({
            ok: true,
            data: alertas,
            kpis: { total, totalNoLeidas, totalCriticas, totalVencidas },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo alertas" });
    }
};

/* ── GET /api/alertas/resumen ── */
export const getResumenAlertas = async (_req, res) => {
    try {
        const [noLeidas, criticas, vencidas, advertencias] = await Promise.all([
            prisma.alertaPreventiva.count({ where: { leida: false, resuelta: false } }),
            prisma.alertaPreventiva.count({ where: { tipo: "CRITICO", resuelta: false } }),
            prisma.alertaPreventiva.count({ where: { tipo: "VENCIDO", resuelta: false } }),
            prisma.alertaPreventiva.count({ where: { tipo: "ADVERTENCIA", resuelta: false } }),
        ]);

        return res.json({
            ok: true,
            data: { noLeidas, criticas, vencidas, advertencias, total: criticas + vencidas + advertencias },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo resumen" });
    }
};

/* ── PUT /api/alertas/:id/leer ── */
export const marcarLeida = async (req, res) => {
    try {
        const alerta = await prisma.alertaPreventiva.update({
            where: { id: Number(req.params.id) },
            data: { leida: true },
        });
        return res.json({ ok: true, data: alerta });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error marcando alerta como leída" });
    }
};

/* ── PUT /api/alertas/leer-todas ── */
export const marcarTodasLeidas = async (_req, res) => {
    try {
        await prisma.alertaPreventiva.updateMany({
            where: { leida: false },
            data: { leida: true },
        });
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error marcando alertas" });
    }
};

/* ── PUT /api/alertas/:id/resolver ── */
export const resolverAlerta = async (req, res) => {
    try {
        const alerta = await prisma.alertaPreventiva.update({
            where: { id: Number(req.params.id) },
            data: { resuelta: true, leida: true },
        });
        return res.json({ ok: true, data: alerta });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error resolviendo alerta" });
    }
};

/* ── POST /api/alertas/evaluar ── Ejecutar evaluación manual */
export const ejecutarEvaluacion = async (_req, res) => {
    try {
        const resultado = await evaluarAlertasPreventivas();
        return res.json({ ok: true, data: resultado });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error evaluando alertas" });
    }
};
