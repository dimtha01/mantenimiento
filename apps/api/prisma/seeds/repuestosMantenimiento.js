// prisma/seeds/repuestosMantenimiento.js
import { faker } from "@faker-js/faker";

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedRepuestosMantenimiento(prisma, mantenimientos, repuestos) {
    const asociaciones = [];

    for (const mantenimiento of mantenimientos) {
        // Solo algunos mantenimientos usan repuestos (70% de probabilidad)
        if (Math.random() > 0.3) {
            // Obtener repuestos del equipo del mantenimiento
            const equipoId = mantenimiento.equipoId;
            const repuestosEquipo = repuestos.filter(r => r.equipoId === equipoId);

            if (repuestosEquipo.length > 0) {
                // Seleccionar 1-3 repuestos aleatorios
                const nRepuestosUsados = randInt(1, Math.min(3, repuestosEquipo.length));
                const repuestosSeleccionados = faker.helpers.arrayElements(repuestosEquipo, nRepuestosUsados);

                for (const repuesto of repuestosSeleccionados) {
                    const cantidad = randInt(1, 3); // 1-3 unidades del mismo repuesto

                    try {
                        const asociacion = await prisma.repuestoMantenimiento.create({
                            data: {
                                mantenimientoId: mantenimiento.id,
                                repuestoId: repuesto.id,
                                cantidad
                            }
                        });

                        asociaciones.push(asociacion);
                    } catch (e) {
                        // Puede haber duplicados, ignorar
                        console.log(`   ⚠️  Asociación ya existe: mantenimiento ${mantenimiento.id}, repuesto ${repuesto.id}`);
                    }
                }
            }
        }
    }

    console.log(`✅ ${asociaciones.length} asociaciones repuesto-mantenimiento creadas`);
    return asociaciones;
}
