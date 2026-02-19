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
