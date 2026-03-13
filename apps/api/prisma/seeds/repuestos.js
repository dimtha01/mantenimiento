// prisma/seeds/repuestos.js
import { faker } from "@faker-js/faker";

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedRepuestos(prisma, equipos) {
    const TIPOS_REPUESTO = ['FILTRO', 'CORREA', 'ACEITE', 'OTRO'];
    const NOMBROS_REPUESTOS = {
        FILTRO: [
            'Filtro de Aceite HF-101',
            'Filtro de Aire AF-202',
            'Filtro de Combustible FF-301',
            'Filtro Hidráulico FH-401',
            'Filtro de Cabina FC-501'
        ],
        CORREA: [
            'Correa de Transmisión DAYCO',
            'Correa Poly-V Gates',
            'Correa de Alternador Bando',
            'Correa de Distribución SKF',
            'Correa Trapezoidal Contitech'
        ],
        ACEITE: [
            'Aceite Motor 15W-40',
            'Aceite Hidráulico ISO VG 46',
            'Aceite de Transmisión ATF',
            'Grasa NLGI 2',
            'Refrigerante Motor'
        ],
        OTRO: [
            'Bujía de Encendido',
            'Sensor de Temperatura',
            'Bomba de Agua',
            'Termostato',
            'Kit de Empaques'
        ]
    };

    const repuestosCreados = [];

    for (const equipo of equipos) {
        const nRepuestos = randInt(2, 6);

        for (let i = 0; i < nRepuestos; i++) {
            const tipo = faker.helpers.arrayElement(TIPOS_REPUESTO);
            const nombresPosibles = NOMBROS_REPUESTOS[tipo];
            const nombre = faker.helpers.arrayElement(nombresPosibles);

            const repuesto = await prisma.repuesto.create({
                data: {
                    equipoId: equipo.id,
                    nombre: `${nombre} - ${equipo.modelo?.slice(0, 15) || 'Equipo'}`,
                    tipo,
                    codigo: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
                    costo: faker.commerce.price({ min: 5, max: 500 })
                }
            });

            repuestosCreados.push(repuesto);
        }
    }

    console.log(`✅ ${repuestosCreados.length} repuestos creados para ${equipos.length} equipos`);
    return repuestosCreados;
}
