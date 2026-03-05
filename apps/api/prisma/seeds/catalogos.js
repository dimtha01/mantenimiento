// prisma/seeds/catalogos.js

export async function seedCatalogos(prisma) {
    await prisma.rol.createMany({
        data: [{ nombre: "ADMIN" }, { nombre: "TECNICO" }, { nombre: "LECTOR" }],
        skipDuplicates: true,
    });

    await prisma.marca.createMany({
        data: [
            { nombre: "Caterpillar" },
            { nombre: "Komatsu" },
            { nombre: "Volvo" },
            { nombre: "John Deere" },
            { nombre: "Hitachi" },
        ],
        skipDuplicates: true,
    });

    await prisma.tipoEquipo.createMany({
        data: [
            { nombre: "EXCAVADORA" },
            { nombre: "RETROEXCAVADORA" },
            { nombre: "GRÚA" },
            { nombre: "GENERADOR" },
            { nombre: "COMPRESOR" },
        ],
        skipDuplicates: true,
    });

    await prisma.ubicacionEquipo.createMany({
        data: [
            { nombre: "Planta Principal" },
            { nombre: "Taller de Mantenimiento" },
            { nombre: "Obra Norte" },
            { nombre: "Almacén Central" },
        ],
        skipDuplicates: true,
    });

    await prisma.propietario.createMany({
        data: [{ nombre: "Empresa" }, { nombre: "Cliente A" }, { nombre: "Cliente B" }],
        skipDuplicates: true,
    });

    await prisma.parametroControl.createMany({
        data: [{ unidad: "horas" }, { unidad: "km" }, { unidad: "ciclos" }],
        skipDuplicates: true,
    });

    await prisma.tipoMantenimiento.createMany({
        data: [
            { nombre: "PREVENTIVO" },
            { nombre: "CORRECTIVO" },
            { nombre: "PREDICTIVO" },
        ],
        skipDuplicates: true,
    });

    // Retornar todos los catálogos cargados
    const [roles, marcas, tipos, ubicaciones, propietarios, parametros, tiposMant] =
        await Promise.all([
            prisma.rol.findMany(),
            prisma.marca.findMany(),
            prisma.tipoEquipo.findMany(),
            prisma.ubicacionEquipo.findMany(),
            prisma.propietario.findMany(),
            prisma.parametroControl.findMany(),
            prisma.tipoMantenimiento.findMany(),
        ]);

    console.log("✅ Catálogos creados");
    return { roles, marcas, tipos, ubicaciones, propietarios, parametros, tiposMant };
}
