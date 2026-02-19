// prisma/seed.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1) Catálogos (pocos)
  await prisma.rol.createMany({
    data: [{ nombre: "ADMIN" }, { nombre: "TECNICO" }, { nombre: "LECTOR" }],
    skipDuplicates: true,
  });

  await prisma.marca.createMany({
    data: [{ nombre: "Siemens" }, { nombre: "Bosch" }],
    skipDuplicates: true,
  });

  await prisma.tipoEquipo.createMany({
    data: [{ nombre: "BALANZA" }, { nombre: "MICROSCOPIO" }],
    skipDuplicates: true,
  });

  await prisma.ubicacionEquipo.createMany({
    data: [{ nombre: "Laboratorio" }, { nombre: "Almacén" }],
    skipDuplicates: true,
  });

  await prisma.propietario.createMany({
    data: [{ nombre: "Empresa" }, { nombre: "Cliente A" }],
    skipDuplicates: true,
  });

  await prisma.parametroControl.createMany({
    data: [{ unidad: "horas" }, { unidad: "ciclos" }],
    skipDuplicates: true,
  });

  await prisma.tipoMantenimiento.createMany({
    data: [{ nombre: "PREVENTIVO" }, { nombre: "CORRECTIVO" }],
    skipDuplicates: true,
  });

  // 2) Obtener IDs para FKs
  const rolAdmin = await prisma.rol.findFirst({ where: { nombre: "ADMIN" } });
  const [marca1] = await prisma.marca.findMany({ take: 1 });
  const [tipo1] = await prisma.tipoEquipo.findMany({ take: 1 });
  const [ubic1] = await prisma.ubicacionEquipo.findMany({ take: 1 });
  const [prop1] = await prisma.propietario.findMany({ take: 1 });
  const [param1] = await prisma.parametroControl.findMany({ take: 1 });
  const tipoMant = await prisma.tipoMantenimiento.findFirst({ where: { nombre: "PREVENTIVO" } });

  // 3) Usuario demo
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: "admin123",
      nombre: "Admin",
      rolId: rolAdmin.id,
    },
  });

  // 4) Equipos (pocos) + hijos con nested create
  const equipos = [
    { codigo: "EQ-0001", modelo: "M-1", serial: "SER-0001", factura: true },
    { codigo: "EQ-0002", modelo: "M-2", serial: "SER-0002", factura: false },
    { codigo: "EQ-0003", modelo: "M-3", serial: "SER-0003", factura: true },
  ];

  for (const e of equipos) {
    await prisma.equipo.create({
      data: {
        ...e,
        marcaId: marca1.id,
        tipoId: tipo1.id,
        unidadNegocioId: ubic1.id,
        propietarioId: prop1.id,
        parametroId: param1.id,

        planes: {
          create: [{ descripcionTarea: "Inspección general", frecuenciaValor: 30 }],
        },
        mantenimientos: {
          create: [
            {
              fechaServicio: new Date(),
              lecturaActual: 100,
              observaciones: "OK",
              costoTotal: 10.5,
              tipoId: tipoMant.id,
            },
          ],
        },
        certificaciones: {
          create: [
            {
              fechaEmision: new Date(),
              duracionMeses: 12,
              vencimiento: new Date(new Date().setMonth(new Date().getMonth() + 12)),
            },
          ],
        },
        imagenes: {
          create: [{ url: `https://picsum.photos/seed/${e.codigo}/600/400` }],
        },
      },
    });
  }

  // Imagen para el usuario (opcional)
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
