// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

function randInt(min, max) {
  return faker.number.int({ min, max });
}

async function main() {
  // Cantidades configurables
  const N_USUARIOS = 25;
  const N_EQUIPOS = 80;
  const PLANES_POR_EQUIPO = [1, 3];            // min,max
  const MANTS_POR_EQUIPO = [0, 6];
  const CERTS_POR_EQUIPO = [0, 2];
  const IMGS_POR_EQUIPO = [1, 4];

  // 1) Catálogos
  await prisma.rol.createMany({
    data: [{ nombre: "ADMIN" }, { nombre: "TECNICO" }, { nombre: "LECTOR" }],
    skipDuplicates: true,
  });

  await prisma.marca.createMany({
    data: [{ nombre: "Siemens" }, { nombre: "Bosch" }, { nombre: "Mettler Toledo" }, { nombre: "Thermo" }],
    skipDuplicates: true,
  });

  await prisma.tipoEquipo.createMany({
    data: [{ nombre: "BALANZA" }, { nombre: "MICROSCOPIO" }, { nombre: "CENTRIFUGA" }, { nombre: "PHMETRO" }],
    skipDuplicates: true,
  });

  await prisma.ubicacionEquipo.createMany({
    data: [{ nombre: "Laboratorio" }, { nombre: "Almacén" }, { nombre: "Producción" }, { nombre: "Calidad" }],
    skipDuplicates: true,
  });

  await prisma.propietario.createMany({
    data: [{ nombre: "Empresa" }, { nombre: "Cliente A" }, { nombre: "Cliente B" }],
    skipDuplicates: true,
  });

  await prisma.parametroControl.createMany({
    data: [{ unidad: "horas" }, { unidad: "ciclos" }, { unidad: "días" }],
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


  // 2) Traer catálogos para usar IDs al azar
  const [roles, marcas, tipos, ubicaciones, propietarios, parametros, tiposMant] = await Promise.all([
    prisma.rol.findMany(),
    prisma.marca.findMany(),
    prisma.tipoEquipo.findMany(),
    prisma.ubicacionEquipo.findMany(),
    prisma.propietario.findMany(),
    prisma.parametroControl.findMany(),
    prisma.tipoMantenimiento.findMany(),
  ]);

  const rolAdmin = roles.find((r) => r.nombre === "ADMIN");
  const rolTecnico = roles.find((r) => r.nombre === "TECNICO") ?? rolAdmin;
  const rolLector = roles.find((r) => r.nombre === "LECTOR") ?? rolAdmin;

const tipoPreventivo = tiposMant.find((t) => t.nombre === "PREVENTIVO") ?? tiposMant[0];
const tipoCorrectivo = tiposMant.find((t) => t.nombre === "CORRECTIVO") ?? tiposMant[0];
const tipoPredictivo = tiposMant.find((t) => t.nombre === "PREDICTIVO") ?? tiposMant[0];

  // 3) Usuario admin demo (igual que el tuyo)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: "admin123", // en real: hashear
      nombre: "Admin",
      rolId: rolAdmin.id,
    },
  });

  // 4) Más usuarios demo
  // Nota: createMany no devuelve ids; si luego necesitas ids, usa create en loop o createMany + findMany.
  const usuariosData = Array.from({ length: N_USUARIOS }).map((_, i) => {
    const rol = i % 10 === 0 ? rolTecnico : rolLector;
    return {
      email: faker.internet.email().toLowerCase(),
      password: "123456",
      nombre: faker.person.fullName(),
      rolId: rol.id,
    };
  });

  await prisma.usuario.createMany({ data: usuariosData, skipDuplicates: true });

  // 5) Equipos con hijos
  for (let i = 0; i < N_EQUIPOS; i++) {
    const marca = faker.helpers.arrayElement(marcas);
    const tipo = faker.helpers.arrayElement(tipos);
    const ubic = faker.helpers.arrayElement(ubicaciones);
    const prop = faker.helpers.arrayElement(propietarios);
    const param = faker.helpers.arrayElement(parametros);

    const codigo = `EQ-${String(i + 1).padStart(5, "0")}`;

    const planesN = randInt(PLANES_POR_EQUIPO[0], PLANES_POR_EQUIPO[1]);
    const mantsN = randInt(MANTS_POR_EQUIPO[0], MANTS_POR_EQUIPO[1]);
    const certsN = randInt(CERTS_POR_EQUIPO[0], CERTS_POR_EQUIPO[1]);
    const imgsN = randInt(IMGS_POR_EQUIPO[0], IMGS_POR_EQUIPO[1]);

    await prisma.equipo.create({
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

        planes: {
          create: Array.from({ length: planesN }).map(() => ({
            descripcionTarea: faker.lorem.sentence({ min: 3, max: 7 }),
            frecuenciaValor: randInt(7, 180),
          })),
        },

        mantenimientos: {
          create: Array.from({ length: mantsN }).map(() => {
            const esCorrectivo = faker.datatype.boolean();
            const fecha = faker.date.recent({ days: 365 });
            return {
              fechaServicio: fecha,
              lecturaActual: randInt(0, 5000),
              observaciones: faker.lorem.sentence(),
              costoTotal: Number(faker.commerce.price({ min: 5, max: 500 })),
              tipoId: (esCorrectivo ? tipoCorrectivo : tipoPreventivo).id,
            };
          }),
        },

        certificaciones: {
          create: Array.from({ length: certsN }).map(() => {
            const emision = faker.date.past({ years: 2 });
            const duracionMeses = faker.helpers.arrayElement([6, 12, 24]);
            const venc = new Date(emision);
            venc.setMonth(venc.getMonth() + duracionMeses);
            return {
              fechaEmision: emision,
              duracionMeses,
              vencimiento: venc,
            };
          }),
        },

        imagenes: {
          create: Array.from({ length: imgsN }).map(() => ({
            url: `https://picsum.photos/seed/${codigo}-${faker.string.alphanumeric(6)}/600/400`,
          })),
        },
      },
    });
  }

  // Imagen para el admin (opcional)
  await prisma.imagen.create({
    data: { url: "https://picsum.photos/seed/admin/400/400", usuarioId: admin.id },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
