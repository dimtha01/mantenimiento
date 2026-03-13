// prisma/seeds/historialHoras.js
import { faker } from "@faker-js/faker";

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedHistorialHoras(prisma, equipos) {
    const registros = [];

    for (const equipo of equipos) {
        const nDias = randInt(5, 15); // 5-15 días diferentes de trabajo
        const fechasUsadas = new Set();

        for (let i = 0; i < nDias * 2; i++) {
            const fecha = faker.date.past({ years: 1 });
            // Normalizar a solo fecha (sin hora) para evitar duplicados
            const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
            const fechaKey = `${equipo.id}-${fechaNormalizada.toISOString()}`;

            if (!fechasUsadas.has(fechaKey)) {
                fechasUsadas.add(fechaKey);

                // Cada día trabajó entre 6-12 horas continuas (no es por hora, es el total del día)
                const horasTrabajadas = randInt(6, 12);

                const registro = await prisma.historialHoras.create({
                    data: {
                        equipoId: equipo.id,
                        fecha: fechaNormalizada,
                        horas: horasTrabajadas
                    }
                });

                registros.push(registro);

                if (fechasUsadas.size >= nDias) break;
            }
        }
    }

    console.log(`✅ ${registros.length} registros de historial de horas creados (un registro por día trabajado con horas totales)`);
    return registros;
}
