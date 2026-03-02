import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

/**
 * Evalúa todos los equipos con planes preventivos y genera alertas
 * cuando el horómetro actual esté próximo a vencer o haya superado
 * la frecuencia configurada en cada plan.
 */
export const evaluarAlertasPreventivas = async () => {
    console.log(`[CRON] Evaluando alertas preventivas - ${new Date().toISOString()}`);

    try {
        const planes = await prisma.planPreventivo.findMany({
            where: {
                frecuenciaValor: { gt: 0 },
            },
            include: {
                equipo: {
                    select: {
                        id: true,
                        codigo: true,
                        modelo: true,
                        horasAcumuladas: true,
                        horometroActual: true,
                        estadoOperativo: true,
                    },
                },
            },
        });

        let alertasGeneradas = 0;
        let alertasActualizadas = 0;

        for (const plan of planes) {
            const horasEquipo = plan.equipo.horometroActual ?? plan.equipo.horasAcumuladas ?? 0;
            const base = plan.horasUltimaEjecucion ?? 0;
            const frecuencia = plan.frecuenciaHoras > 0 ? plan.frecuenciaHoras : plan.frecuenciaValor;
            const meta = base + frecuencia;
            const umbral = Math.max(2, Math.round(frecuencia * 0.15)); // 15% de la frecuencia
            const horasRestantes = meta - horasEquipo;

            let tipoAlerta = null;
            let mensaje = null;

            if (horasEquipo >= meta) {
                tipoAlerta = "VENCIDO";
                mensaje = `⚠️ VENCIDO: El equipo "${plan.equipo.codigo}" superó las ${meta}h (actual: ${horasEquipo}h). Plan: "${plan.descripcionTarea}" requiere ejecución inmediata.`;
            } else if (horasEquipo >= meta - umbral) {
                tipoAlerta = "CRITICO";
                mensaje = `🔴 CRÍTICO: El equipo "${plan.equipo.codigo}" está a ${horasRestantes}h de su meta de ${meta}h. Plan: "${plan.descripcionTarea}".`;
            } else if (horasEquipo >= meta - umbral * 2) {
                tipoAlerta = "ADVERTENCIA";
                mensaje = `🟡 ADVERTENCIA: El equipo "${plan.equipo.codigo}" se acerca a la meta (${horasRestantes}h restantes). Plan: "${plan.descripcionTarea}".`;
            }

            if (tipoAlerta) {
                // Verificar si ya existe una alerta no resuelta para este plan
                const alertaExistente = await prisma.alertaPreventiva.findFirst({
                    where: {
                        planId: plan.id,
                        equipoId: plan.equipoId,
                        resuelta: false,
                    },
                });

                if (alertaExistente) {
                    // Actualizar si el nivel cambió (ej: pasó de ADVERTENCIA a CRITICO)
                    if (alertaExistente.tipo !== tipoAlerta) {
                        await prisma.alertaPreventiva.update({
                            where: { id: alertaExistente.id },
                            data: {
                                tipo: tipoAlerta,
                                mensaje,
                                horasEquipoAlMomento: horasEquipo,
                            },
                        });
                        alertasActualizadas++;
                    }
                } else {
                    // Crear nueva alerta
                    await prisma.alertaPreventiva.create({
                        data: {
                            equipoId: plan.equipoId,
                            planId: plan.id,
                            tipo: tipoAlerta,
                            mensaje,
                            horasEquipoAlMomento: horasEquipo,
                            metaHoras: meta,
                        },
                    });
                    alertasGeneradas++;
                }
            }
        }

        console.log(`[CRON] Resultado: ${alertasGeneradas} alertas nuevas, ${alertasActualizadas} actualizadas.`);
        return { alertasGeneradas, alertasActualizadas };
    } catch (err) {
        console.error("[CRON] Error evaluando alertas preventivas:", err);
        throw err;
    }
};

/**
 * Inicia el cron job que evalúa alertas preventivas.
 * Se ejecuta cada hora por defecto.
 * Recibe de forma opcional la expresión cron y el flag de ejecución inmediata.
 */
export const iniciarCronAlertas = (cronExpression = "0 * * * *", runOnStart = true) => {
    console.log(`[CRON] Cron de alertas preventivas programado: "${cronExpression}"`);

    // Ejecutar una vez al iniciar si se solicita
    if (runOnStart) {
        setTimeout(() => {
            evaluarAlertasPreventivas().catch(console.error);
        }, 5000); // Esperar 5 seg para que Prisma esté conectado
    }

    const task = cron.schedule(cronExpression, async () => {
        await evaluarAlertasPreventivas().catch(console.error);
    });

    return task;
};
