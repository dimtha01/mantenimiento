// prisma/seeds/maquinaria.js
import { faker } from "@faker-js/faker";

export async function seedMaquinaria(prisma) {
    const N_MAQUINARIAS = 20;
    const estadosPosibles = ["OPERATIVO", "OPERATIVO", "OPERATIVO", "NO_OPERATIVO", "EN_MANTENIMIENTO"];

    const data = Array.from({ length: N_MAQUINARIAS }).map(() => ({
        nombre: `${faker.helpers.arrayElement(["Grúa", "Montacargas", "Compresor", "Generador", "Bomba", "Soldadora", "Torno", "Fresadora"])} ${faker.string.alphanumeric({ length: 4 }).toUpperCase()}`,
        serial: faker.string.alphanumeric({ length: 12 }).toUpperCase(),
        estado: faker.helpers.arrayElement(estadosPosibles),
        ultimaRevision: faker.date.recent({ days: 180 }),
    }));

    await prisma.maquinaria.createMany({ data, skipDuplicates: true });

    console.log(`✅ ${N_MAQUINARIAS} registros de maquinaria creados`);
}
