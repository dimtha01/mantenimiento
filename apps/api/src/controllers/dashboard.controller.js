import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ── GET /api/dashboard ──────────────────────────── */
export const getDashboard = async (_req, res) => {
    try {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const hace12M = new Date(ahora.getFullYear() - 1, ahora.getMonth(), 1);
        const en30Dias = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 30);

        // ── KPIs base (paralelo) ────────────────────────────────────
        const [
            totalEquipos,
            totalMantenimientos,
            mantenimientosMes,
            totalPlanes,
            tipos,
            ultimosRegistros,
            costoAgg,
            costoMesAgg,
            certsPorVencer,
            certsVencidas,
            equiposOperativos,
            equiposNoOperativos,
            fallasAbiertas,
        ] = await Promise.all([
            prisma.equipo.count(),
            prisma.registroMantenimiento.count(),
            prisma.registroMantenimiento.count({ where: { fechaServicio: { gte: inicioMes } } }),
            prisma.planPreventivo.count(),
            prisma.tipoMantenimiento.findMany(),
            prisma.registroMantenimiento.findMany({
                take: 8,
                orderBy: { fechaServicio: "desc" },
                include: {
                    tipo: true,
                    equipo: { include: { marca: true, parametro: true } },
                },
            }),
            prisma.registroMantenimiento.aggregate({ _sum: { costoTotal: true } }),
            prisma.registroMantenimiento.aggregate({
                _sum: { costoTotal: true },
                where: { fechaServicio: { gte: inicioMes } },
            }),
            prisma.certificacionHistorial.count({
                where: { vencimiento: { gte: ahora, lte: en30Dias } },
            }),
            prisma.certificacionHistorial.count({
                where: { vencimiento: { lt: ahora } },
            }),
            prisma.equipo.count({ where: { estadoOperativo: "OPERATIVO" } }),
            prisma.equipo.count({ where: { estadoOperativo: "NO_OPERATIVO" } }),
            prisma.registroFalla.count({ where: { estado: { not: "RESUELTA" } } }),
        ]);

        // ── Por tipo ────────────────────────────────────────────────
        const porTipoRaw = await prisma.registroMantenimiento.groupBy({
            by: ["tipoId"],
            _count: { tipoId: true },
            _sum: { costoTotal: true },
        });
        const tipoMap = Object.fromEntries(tipos.map(t => [t.id, t.nombre]));
        const porTipo = porTipoRaw.map(g => ({
            tipo: tipoMap[g.tipoId] ?? "OTRO",
            count: g._count.tipoId,
            costo: Number(g._sum.costoTotal ?? 0),
        }));

        // ── Por mes (últimos 12) — group en JS puro ────────────────
        const registrosMeses = await prisma.registroMantenimiento.findMany({
            where: { fechaServicio: { gte: hace12M } },
            select: { fechaServicio: true, costoTotal: true },
            orderBy: { fechaServicio: "asc" },
        });

        const mesMap = {};
        registrosMeses.forEach(r => {
            const key = `${r.fechaServicio.getFullYear()}-${String(r.fechaServicio.getMonth() + 1).padStart(2, "0")}`;
            if (!mesMap[key]) mesMap[key] = { cantidad: 0, costo: 0, raw: r.fechaServicio };
            mesMap[key].cantidad++;
            mesMap[key].costo += Number(r.costoTotal ?? 0);
        });
        const porMes = Object.entries(mesMap).map(([, v]) => ({
            mes: v.raw.toLocaleDateString("es-VE", { month: "short", year: "2-digit" }),
            cantidad: v.cantidad,
            costo: v.costo,
        }));

        // ── Top equipos ─────────────────────────────────────────────
        const topRaw = await prisma.registroMantenimiento.groupBy({
            by: ["equipoId"],
            _count: { equipoId: true },
            _sum: { costoTotal: true },
            orderBy: { _count: { equipoId: "desc" } },
            take: 5,
        });
        const eqIds = topRaw.map(g => g.equipoId);
        const eqDet = await prisma.equipo.findMany({
            where: { id: { in: eqIds } },
            include: { marca: true },
        });
        const eqMap = Object.fromEntries(eqDet.map(e => [e.id, e]));
        const topEquipos = topRaw.map(g => ({
            equipo: eqMap[g.equipoId] ?? null,
            count: g._count.equipoId,
            costo: Number(g._sum.costoTotal ?? 0),
        }));

        return res.json({
            ok: true,
            data: {
                kpis: {
                    totalEquipos,
                    totalMantenimientos,
                    mantenimientosMes,
                    totalPlanes,
                    costoTotal: Number(costoAgg._sum.costoTotal ?? 0),
                    costoMes: Number(costoMesAgg._sum.costoTotal ?? 0),
                    certsPorVencer,
                    certsVencidas,
                    equiposOperativos,
                    equiposNoOperativos,
                    fallasAbiertas,
                },
                porTipo,
                porMes,
                topEquipos,
                ultimosRegistros,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error generando dashboard" });
    }
};

/* ── GET /api/dashboard/alertas-horas ──────────────────── */
export const getAlertasHoras = async (_req, res) => {
    try {
        const planes = await prisma.planPreventivo.findMany({
            where: { frecuenciaValor: { gt: 0 } },
            include: {
                equipo: {
                    select: {
                        id: true, codigo: true, modelo: true,
                        horasAcumuladas: true, estadoOperativo: true,
                        marca: { select: { nombre: true } },
                        ubicacion: { select: { nombre: true } },
                    },
                },
            },
        });

        const alertas = planes
            .map(plan => {
                const horasEquipo = plan.equipo?.horasAcumuladas ?? 0;
                const base = plan.horasUltimaEjecucion ?? 0;
                const frecuencia = plan.frecuenciaValor;
                const meta = base + frecuencia;
                const umbral = Math.max(2, Math.round(frecuencia * 0.1));
                const horasRestantes = meta - horasEquipo;
                const pct = frecuencia > 0 ? ((horasEquipo - base) / frecuencia) * 100 : 0;

                let nivelAlerta = 'normal';
                if (horasEquipo >= meta) nivelAlerta = 'critico';
                else if (horasEquipo >= meta - umbral) nivelAlerta = 'advertencia';
                else if (pct >= 70) nivelAlerta = 'precaucion';

                return {
                    planId: plan.id,
                    descripcionTarea: plan.descripcionTarea,
                    frecuenciaValor: frecuencia,
                    fechaUltimaEjecucion: plan.fechaUltimaEjecucion,
                    equipoId: plan.equipo?.id,
                    codigo: plan.equipo?.codigo,
                    modelo: plan.equipo?.modelo,
                    marca: plan.equipo?.marca,
                    ubicacion: plan.equipo?.ubicacion,
                    horasEquipo,
                    meta,
                    umbral,
                    horasRestantes: Math.max(0, horasRestantes),
                    porcentajeUsado: Math.min(100, Math.max(0, pct)),
                    nivelAlerta,
                };
            })
            .filter(a => a.nivelAlerta !== 'normal')
            .sort((a, b) => a.horasRestantes - b.horasRestantes);

        return res.json({ ok: true, data: alertas });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo alertas de horas" });
    }
};
