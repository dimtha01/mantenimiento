// prisma/seeds/repuestos.js
import { faker } from "@faker-js/faker";

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedRepuestos(prisma, equipos) {
    // Crear tipos de repuesto si no existen
    const tiposRepuestoCount = await prisma.tipoRepuesto.count();
    let tiposRepuesto = [];

    if (tiposRepuestoCount === 0) {
        console.log('📝 Creando tipos de repuesto...');

        const tiposDatos = [
            { nombre: 'FILTRO' },
            { nombre: 'CORREA' },
            { nombre: 'ACEITE' },
            { nombre: 'OTRO' }
        ];

        for (const tipoDatos of tiposDatos) {
            const tipo = await prisma.tipoRepuesto.create({
                data: tipoDatos
            });
            tiposRepuesto.push(tipo);
        }

        console.log(`✅ ${tiposRepuesto.length} tipos de repuesto creados`);
    } else {
        tiposRepuesto = await prisma.tipoRepuesto.findMany();
        console.log(`✅ Usando ${tiposRepuesto.length} tipos de repuesto existentes`);
    }

    const NOMBROS_REPUESTOS = {
        'FILTRO': [
            'Filtro de Aceite HF-101',
            'Filtro de Aire AF-202',
            'Filtro de Combustible FF-301',
            'Filtro Hidráulico FH-401',
            'Filtro de Cabina FC-501',
            'Filtro de Partículas',
            'Prefiltro de Aire',
            'Cartucho Filtrante'
        ],
        'CORREA': [
            'Correa de Transmisión DAYCO',
            'Correa Poly-V Gates',
            'Correa de Alternador Bando',
            'Correa de Distribución SKF',
            'Correa Trapezoidal Contitech'
        ],
        'ACEITE': [
            'Aceite Motor 15W-40',
            'Aceite Hidráulico ISO VG 46',
            'Aceite de Transmisión ATF',
            'Grasa NLGI 2',
            'Refrigerante Motor',
            'Aceite Sintético 5W-30'
        ],
        'OTRO': [
            'Rodamiento Rígido de Bolas 6204',
            'Bomba de Agua',
            'Bujía de Encendido NGK',
            'Sensor de Temperatura',
            'Kit de Empaques de Motor',
            'Junta Homocinética',
            'Termostato',
            'Amortiguador'
        ]
    };

    const CODIGOS_FABRICANTES = [
        'SKF', 'NSK', 'TIMKEN', 'GATES', 'DAYCO',
        'BOSCH', 'NGK', 'DENSO', 'ACDelco', 'MANN',
        'CAT', 'JOHN DEERE', 'KUBOTA'
    ];

    const repuestosCreados = [];

    for (const equipo of equipos) {
        const nRepuestos = randInt(3, 8);

        for (let i = 0; i < nRepuestos; i++) {
            const tipoRepuesto = faker.helpers.arrayElement(tiposRepuesto);
            const nombresPosibles = NOMBROS_REPUESTOS[tipoRepuesto.nombre] || NOMBROS_REPUESTOS.OTRO;
            const nombreBase = faker.helpers.arrayElement(nombresPosibles);

            // Generar código más realista
            const fabricante = faker.helpers.arrayElement(CODIGOS_FABRICANTES);
            const modeloParte = faker.string.alphanumeric({ length: 5 }).toUpperCase();
            const codigo = `${fabricante}-${modeloParte}`;

            // Generar costo según tipo
            let costoBase;
            switch (tipoRepuesto.nombre) {
                case 'FILTRO':
                    costoBase = faker.number.float({ min: 10, max: 80, fractionDigits: 2 });
                    break;
                case 'CORREA':
                    costoBase = faker.number.float({ min: 25, max: 150, fractionDigits: 2 });
                    break;
                case 'ACEITE':
                    costoBase = faker.number.float({ min: 15, max: 60, fractionDigits: 2 });
                    break;
                default:
                    costoBase = faker.number.float({ min: 20, max: 300, fractionDigits: 2 });
            }

            const repuesto = await prisma.repuesto.create({
                data: {
                    equipoId: equipo.id,
                    nombre: `${nombreBase} ${fabricante}`,
                    tipoRepuestoId: tipoRepuesto.id,
                    codigo: codigo,
                    costo: costoBase
                }
            });

            repuestosCreados.push(repuesto);
        }
    }

    console.log(`✅ ${repuestosCreados.length} repuestos creados para ${equipos.length} equipos`);
    return repuestosCreados;
}
