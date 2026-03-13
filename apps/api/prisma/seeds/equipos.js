// prisma/seeds/equipos.js
import { faker } from "@faker-js/faker";
import { TAREAS_PREVENTIVAS, TIPOS_CERT, FICHAS_POR_TIPO } from "./constants.js";

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedEquipos(prisma, { marcas, tipos, ubicaciones, propietarios, parametros, tiposMant }) {
    const N_EQUIPOS = 40;
    const PLANES_POR_EQUIPO = [2, 5];
    const MANTS_POR_EQUIPO = [0, 8];
    const CERTS_POR_EQUIPO = [0, 3];
    const IMGS_POR_EQUIPO = [1, 3];
    const FALLAS_POR_EQUIPO = [0, 3];

    const tipoPreventivo = tiposMant.find((t) => t.nombre === "PREVENTIVO") ?? tiposMant[0];
    const tipoCorrectivo = tiposMant.find((t) => t.nombre === "CORRECTIVO") ?? tiposMant[0];
    const tipoPredictivo = tiposMant.find((t) => t.nombre === "PREDICTIVO") ?? tiposMant[0];

    const severidades = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
    const estadosFalla = ["ABIERTA", "EN_PROCESO", "RESUELTA"];
    const estadoOps = ["OPERATIVO", "OPERATIVO", "OPERATIVO", "NO_OPERATIVO"];

    const equiposCreados = [];

    for (let i = 0; i < N_EQUIPOS; i++) {
        const marca = faker.helpers.arrayElement(marcas);
        const tipo = faker.helpers.arrayElement(tipos);
        const ubic = faker.helpers.arrayElement(ubicaciones);
        const prop = faker.helpers.arrayElement(propietarios);
        const param = faker.helpers.arrayElement(parametros);

        const codigo = `EQ-${String(i + 1).padStart(4, "0")}`;

        // Horas realistas
        const horasMantenimiento = faker.helpers.arrayElement([100, 150, 200, 250, 300, 500]);
        const horasAcumuladas = randInt(0, horasMantenimiento + 50);
        const horometroActual = horasAcumuladas;

        const planesN = randInt(PLANES_POR_EQUIPO[0], PLANES_POR_EQUIPO[1]);
        const mantsN = randInt(MANTS_POR_EQUIPO[0], MANTS_POR_EQUIPO[1]);
        const certsN = randInt(CERTS_POR_EQUIPO[0], CERTS_POR_EQUIPO[1]);
        const imgsN = randInt(IMGS_POR_EQUIPO[0], IMGS_POR_EQUIPO[1]);
        const fallasN = randInt(FALLAS_POR_EQUIPO[0], FALLAS_POR_EQUIPO[1]);

        // ── Ficha Técnica ──
        const fichaBase = FICHAS_POR_TIPO[tipo.nombre] ?? FICHAS_POR_TIPO["GENERADOR"];
        const numEspecs = randInt(3, fichaBase.length);
        const fichaSeleccionada = faker.helpers.arrayElements(fichaBase, numEspecs);

        const extrasAleatorias = [
            { clave: "Color", valor: faker.helpers.arrayElement(["Amarillo CAT", "Naranja", "Blanco", "Verde JD", "Azul"]) },
            { clave: "Año de Fabricación", valor: String(randInt(2015, 2024)) },
            { clave: "País de Origen", valor: faker.helpers.arrayElement(["USA", "Japón", "Alemania", "Brasil", "China"]) },
            { clave: "N° de Parte Motor", valor: faker.string.alphanumeric({ length: 10 }).toUpperCase() },
            { clave: "Número de Chasis", valor: faker.vehicle.vin() },
            { clave: "Capacidad del Tanque Hidráulico", valor: `${randInt(50, 300)} Litros` },
            { clave: "Tipo de Correa", valor: `${faker.helpers.arrayElement(["A", "B", "C", "V"])}${randInt(30, 80)}` },
        ];
        const extrasSeleccionadas = faker.helpers.arrayElements(extrasAleatorias, randInt(1, 3));
        const fichaTecnica = [...fichaSeleccionada, ...extrasSeleccionadas];

        // ── Planes preventivos ──
        const planesData = Array.from({ length: planesN }).map(() => {
            const frecuencia = faker.helpers.arrayElement([10, 20, 50, 100, 150, 250, 500]);
            const base = Math.max(0, horasAcumuladas - randInt(0, frecuencia));
            const costoEstimado = Number(faker.commerce.price({ min: 50, max: 500 }));
            return {
                descripcionTarea: faker.helpers.arrayElement(TAREAS_PREVENTIVAS),
                frecuenciaValor: frecuencia,
                frecuenciaHoras: frecuencia,
                horasUltimaEjecucion: base,
                fechaUltimaEjecucion: faker.date.recent({ days: 60 }),
                costoEstimado,
            };
        });

        // ── Certificaciones ──
        const certsData = Array.from({ length: certsN }).map(() => {
            const emision = faker.date.past({ years: 2 });
            const duracionMeses = faker.helpers.arrayElement([6, 12, 24]);
            const venc = new Date(emision);
            venc.setMonth(venc.getMonth() + duracionMeses);
            return {
                nombre: faker.helpers.arrayElement(TIPOS_CERT),
                fechaEmision: emision,
                duracionMeses,
                vencimiento: venc,
            };
        });

        // ── Fallas ──
        const fallasData = Array.from({ length: fallasN }).map(() => {
            const estado = faker.helpers.arrayElement(estadosFalla);
            const responsable = faker.person.fullName();
            const costoReparacion = faker.commerce.price({ min: 50, max: 2000 });
            return {
                fecha: faker.date.recent({ days: 90 }),
                descripcion: faker.lorem.sentence({ min: 5, max: 15 }),
                severidad: faker.helpers.arrayElement(severidades),
                estado,
                solucion: estado === "RESUELTA" ? faker.lorem.sentence() : null,
                fechaResolucion: estado === "RESUELTA" ? faker.date.recent({ days: 30 }) : null,
                responsable,
                costoReparacion: parseFloat(costoReparacion.replace('$', '').replace(',', '.')),
            };
        });

        const equipo = await prisma.equipo.create({
            data: {
                codigo,
                modelo: faker.commerce.productName().slice(0, 40),
                serial: faker.string.alphanumeric({ length: 12 }).toUpperCase(),
                factura: faker.datatype.boolean(),
                marcaId: marca.id,
                tipoId: tipo.id,
                unidadNegocioId: ubic.id,
                propietarioId: prop.id,
                parametroId: param.id,
                horasMantenimientoPreventivo: horasMantenimiento,
                horasAcumuladas,
                horometroActual,
                ultimaFechaHoras: faker.date.recent({ days: 7 }),
                estadoOperativo: faker.helpers.arrayElement(estadoOps),
                fichaTecnica,

                planes: { create: planesData },

                mantenimientos: {
                    create: Array.from({ length: mantsN }).map(() => {
                        const tipoM = faker.helpers.arrayElement([tipoPreventivo, tipoCorrectivo, tipoPredictivo]);
                        const costoMO = Number(faker.commerce.price({ min: 10, max: 200 }));
                        const costoServ = Number(faker.commerce.price({ min: 5, max: 150 }));
                        const costoRep = Number(faker.commerce.price({ min: 0, max: 300 }));
                        return {
                            fechaServicio: faker.date.recent({ days: 365 }),
                            lecturaActual: randInt(0, 5000),
                            observaciones: faker.lorem.sentence(),
                            costoManoObra: costoMO,
                            costoServicios: costoServ,
                            costoRepuestos: costoRep,
                            costoTotal: costoMO + costoServ + costoRep,
                            tipoId: tipoM.id,
                        };
                    }),
                },

                certificaciones: { create: certsData },
                fallas: { create: fallasData },

                imagenes: {
                    create: Array.from({ length: imgsN }).map(() => ({
                        url: `https://picsum.photos/seed/${codigo}-${faker.string.alphanumeric(6)}/600/400`,
                    })),
                },
            },
            include: { planes: true },
        });

        equiposCreados.push(equipo);
    }

    console.log(`✅ ${N_EQUIPOS} equipos creados con planes, mantenimientos, certificaciones, fallas e imágenes`);
    return equiposCreados;
}
