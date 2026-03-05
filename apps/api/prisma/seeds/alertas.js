// prisma/seeds/alertas.js
import { faker } from "@faker-js/faker";

export async function seedAlertas(prisma, equiposCreados) {
    let alertasCreadas = 0;

    for (const equipo of equiposCreados) {
        const horasEquipo = equipo.horometroActual ?? equipo.horasAcumuladas ?? 0;

        for (const plan of equipo.planes) {
            const base = plan.horasUltimaEjecucion ?? 0;
            const frecuencia = plan.frecuenciaHoras > 0 ? plan.frecuenciaHoras : plan.frecuenciaValor;
            const meta = base + frecuencia;
            const umbral = Math.max(2, Math.round(frecuencia * 0.15));
            const horasRestantes = meta - horasEquipo;

            let tipoAlerta = null;
            let mensaje = null;

            if (horasEquipo >= meta) {
                tipoAlerta = "VENCIDO";
                mensaje = `⚠️ VENCIDO: El equipo "${equipo.codigo}" superó las ${meta}h (actual: ${horasEquipo}h). Plan: "${plan.descripcionTarea}" requiere ejecución inmediata.`;
            } else if (horasEquipo >= meta - umbral) {
                tipoAlerta = "CRITICO";
                mensaje = `🔴 CRÍTICO: El equipo "${equipo.codigo}" está a ${horasRestantes}h de su meta de ${meta}h. Plan: "${plan.descripcionTarea}".`;
            } else if (horasEquipo >= meta - umbral * 2) {
                tipoAlerta = "ADVERTENCIA";
                mensaje = `🟡 ADVERTENCIA: El equipo "${equipo.codigo}" se acerca a la meta (${horasRestantes}h restantes). Plan: "${plan.descripcionTarea}".`;
            }

            if (tipoAlerta) {
                await prisma.alertaPreventiva.create({
                    data: {
                        equipoId: equipo.id,
                        planId: plan.id,
                        tipo: tipoAlerta,
                        mensaje,
                        horasEquipoAlMomento: horasEquipo,
                        metaHoras: meta,
                        leida: faker.datatype.boolean({ probability: 0.3 }), // 30% leídas
                        resuelta: false,
                        creadoEn: faker.date.recent({ days: 7 }),
                    },
                });
                alertasCreadas++;
            }
        }
    }

    // Resumen de alertas
    const totalAlertas = await prisma.alertaPreventiva.count();
    const alertasVencidas = await prisma.alertaPreventiva.count({ where: { tipo: "VENCIDO" } });
    const alertasCriticas = await prisma.alertaPreventiva.count({ where: { tipo: "CRITICO" } });
    const alertasAdvertencia = await prisma.alertaPreventiva.count({ where: { tipo: "ADVERTENCIA" } });

    console.log(`✅ ${alertasCreadas} alertas preventivas generadas:`);
    console.log(`      ⚠️  ${alertasVencidas} VENCIDAS`);
    console.log(`      🔴 ${alertasCriticas} CRÍTICAS`);
    console.log(`      🟡 ${alertasAdvertencia} ADVERTENCIAS`);

    return { alertasCreadas, totalAlertas, alertasVencidas, alertasCriticas, alertasAdvertencia };
}
