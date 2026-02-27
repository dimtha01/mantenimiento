// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

function randInt(min, max) {
  return faker.number.int({ min, max });
}

const TAREAS_PREVENTIVAS = [
  "Cambio de aceite y filtros",
  "Revisión de rodamientos",
  "Ajuste de correas de transmisión",
  "Lubricación general",
  "Inspección de sistema eléctrico",
  "Cambio de filtro de aire",
  "Calibración de sensores",
  "Limpieza de ductos y ventilación",
  "Revisión de frenos y embrague",
  "Cambio de refrigerante",
  "Inspección de sistema hidráulico",
  "Verificación de presión de neumáticos",
  "Cambio de bujías",
  "Revisión de nivel de fluidos",
];

const TIPOS_CERT = [
  "Certificación ISO 9001",
  "Inspección Técnica Vehicular",
  "Certificado de Calibración",
  "Inspección de Seguridad",
  "Certificación Ambiental",
  "Permiso de Operación",
];

async function main() {
  const N_USUARIOS = 25;
  const N_EQUIPOS = 40;
  const PLANES_POR_EQUIPO = [2, 5];
  const MANTS_POR_EQUIPO = [0, 8];
  const CERTS_POR_EQUIPO = [0, 3];
  const IMGS_POR_EQUIPO = [1, 3];
  const FALLAS_POR_EQUIPO = [0, 3];

  // 1) Catálogos
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

  // 2) Traer catálogos
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

  const rolAdmin = roles.find((r) => r.nombre === "ADMIN");
  const rolTecnico = roles.find((r) => r.nombre === "TECNICO") ?? rolAdmin;
  const rolLector = roles.find((r) => r.nombre === "LECTOR") ?? rolAdmin;
  const tipoPreventivo = tiposMant.find((t) => t.nombre === "PREVENTIVO") ?? tiposMant[0];
  const tipoCorrectivo = tiposMant.find((t) => t.nombre === "CORRECTIVO") ?? tiposMant[0];
  const tipoPredictivo = tiposMant.find((t) => t.nombre === "PREDICTIVO") ?? tiposMant[0];

  // 3) Admin
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: "admin123",
      nombre: "Admin Demo",
      rolId: rolAdmin.id,
    },
  });

  // 4) Más usuarios
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

  // 5) Equipos con planes, mantenimientos, certificaciones, fallas
  for (let i = 0; i < N_EQUIPOS; i++) {
    const marca = faker.helpers.arrayElement(marcas);
    const tipo = faker.helpers.arrayElement(tipos);
    const ubic = faker.helpers.arrayElement(ubicaciones);
    const prop = faker.helpers.arrayElement(propietarios);
    const param = faker.helpers.arrayElement(parametros);

    const codigo = `EQ-${String(i + 1).padStart(4, "0")}`;

    // Generar horas realistas
    const horasMantenimiento = faker.helpers.arrayElement([100, 150, 200, 250, 300, 500]);
    const horasAcumuladas = randInt(0, horasMantenimiento + 50); // Algunas pasarán la meta
    const estadoOps = ["OPERATIVO", "OPERATIVO", "OPERATIVO", "NO_OPERATIVO"];

    const planesN = randInt(PLANES_POR_EQUIPO[0], PLANES_POR_EQUIPO[1]);
    const mantsN = randInt(MANTS_POR_EQUIPO[0], MANTS_POR_EQUIPO[1]);
    const certsN = randInt(CERTS_POR_EQUIPO[0], CERTS_POR_EQUIPO[1]);
    const imgsN = randInt(IMGS_POR_EQUIPO[0], IMGS_POR_EQUIPO[1]);
    const fallasN = randInt(FALLAS_POR_EQUIPO[0], FALLAS_POR_EQUIPO[1]);

    // Planes preventivos con frecuencias realistas
    const planesData = Array.from({ length: planesN }).map(() => {
      const frecuencia = faker.helpers.arrayElement([10, 20, 50, 100, 150, 250, 500]);
      // La base (horasUltimaEjecucion) es un valor anterior al horómetro actual
      const base = Math.max(0, horasAcumuladas - randInt(0, frecuencia));
      return {
        descripcionTarea: faker.helpers.arrayElement(TAREAS_PREVENTIVAS),
        frecuenciaValor: frecuencia,
        horasUltimaEjecucion: base,
        fechaUltimaEjecucion: faker.date.recent({ days: 60 }),
      };
    });

    // Certificaciones con nombre
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

    // Fallas
    const severidades = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
    const estadosFalla = ["ABIERTA", "EN_PROCESO", "RESUELTA"];
    const fallasData = Array.from({ length: fallasN }).map(() => {
      const estado = faker.helpers.arrayElement(estadosFalla);
      return {
        fecha: faker.date.recent({ days: 90 }),
        descripcion: faker.lorem.sentence({ min: 5, max: 15 }),
        severidad: faker.helpers.arrayElement(severidades),
        estado,
        solucion: estado === "RESUELTA" ? faker.lorem.sentence() : null,
        fechaResolucion: estado === "RESUELTA" ? faker.date.recent({ days: 30 }) : null,
      };
    });

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
        horasMantenimientoPreventivo: horasMantenimiento,
        horasAcumuladas,
        ultimaFechaHoras: faker.date.recent({ days: 7 }),
        estadoOperativo: faker.helpers.arrayElement(estadoOps),

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
    });
  }

  // Imagen para admin
  await prisma.imagen.create({
    data: { url: "https://picsum.photos/seed/admin/400/400", usuarioId: admin.id },
  });

  console.log(`✅ Seed completado: ${N_EQUIPOS} equipos con planes, fallas y certificaciones`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
