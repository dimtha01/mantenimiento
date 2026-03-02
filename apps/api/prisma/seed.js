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

/* ── Fichas técnicas realistas por tipo de equipo ── */
const FICHAS_POR_TIPO = {
  EXCAVADORA: [
    { clave: "Peso Operacional", valor: "22,000 kg" },
    { clave: "Capacidad del Cucharón", valor: "1.2 m³" },
    { clave: "Potencia del Motor", valor: "173 HP" },
    { clave: "Capacidad de Gasoil", valor: "410 Litros" },
    { clave: "Capacidad de Aceite Hidráulico", valor: "230 Litros" },
    { clave: "Presión Hidráulica Máx.", valor: "350 bar" },
    { clave: "Profundidad Máx. Excavación", valor: "6.7 m" },
    { clave: "Tipo de Aceite Motor", valor: "SAE 15W-40" },
    { clave: "Filtro de Aceite", valor: "1R-0751" },
    { clave: "Filtro de Combustible", valor: "1R-0762" },
  ],
  RETROEXCAVADORA: [
    { clave: "Peso Operacional", valor: "8,500 kg" },
    { clave: "Potencia del Motor", valor: "97 HP" },
    { clave: "Capacidad de Gasoil", valor: "160 Litros" },
    { clave: "Capacidad de Aceite Motor", valor: "12 Litros" },
    { clave: "Capacidad Cucharón Frontal", valor: "1.0 m³" },
    { clave: "Amperaje de Batería", valor: "900 CCA" },
    { clave: "Voltaje del Sistema", valor: "12V" },
    { clave: "Tipo de Aceite Hidráulico", valor: "ISO VG 46" },
    { clave: "Presión de Neumáticos (delanteros)", valor: "35 PSI" },
    { clave: "Presión de Neumáticos (traseros)", valor: "28 PSI" },
  ],
  "GRÚA": [
    { clave: "Capacidad Máx. de Izaje", valor: "50 Toneladas" },
    { clave: "Alcance Máx. de Pluma", valor: "40 m" },
    { clave: "Potencia del Motor", valor: "330 HP" },
    { clave: "Capacidad de Gasoil", valor: "600 Litros" },
    { clave: "Capacidad de Aceite Motor", valor: "28 Litros" },
    { clave: "Contrapeso Total", valor: "12,000 kg" },
    { clave: "Velocidad de Izaje", valor: "120 m/min" },
    { clave: "Cable de Acero (diámetro)", valor: "16 mm" },
    { clave: "Refrigerante", valor: "50/50 Etilenglicol" },
  ],
  GENERADOR: [
    { clave: "Potencia Nominal", valor: "500 kVA" },
    { clave: "Potencia de Emergencia", valor: "550 kVA" },
    { clave: "Voltaje de Salida", valor: "480V / 277V" },
    { clave: "Amperaje Nominal", valor: "601A" },
    { clave: "Frecuencia", valor: "60 Hz" },
    { clave: "RPM", valor: "1800" },
    { clave: "Capacidad de Gasoil", valor: "1,200 Litros" },
    { clave: "Consumo (75% carga)", valor: "85 L/h" },
    { clave: "Capacidad de Aceite Motor", valor: "42 Litros" },
    { clave: "Tipo de Aceite", valor: "SAE 15W-40 CI-4" },
    { clave: "Filtro de Aire", valor: "AF-26557" },
    { clave: "Nivel de Ruido", valor: "75 dB(A) @ 7m" },
  ],
  COMPRESOR: [
    { clave: "Capacidad (CFM)", valor: "375 CFM" },
    { clave: "Presión de Trabajo", valor: "125 PSI" },
    { clave: "Potencia del Motor", valor: "100 HP" },
    { clave: "Capacidad de Gasoil", valor: "180 Litros" },
    { clave: "Capacidad de Aceite", valor: "24 Litros" },
    { clave: "Tipo de Aceite", valor: "Compressor Oil ISO 46" },
    { clave: "Filtro de Aceite", valor: "250025-525" },
    { clave: "Filtro Separador", valor: "250034-085" },
    { clave: "Temperatura Máx. Operación", valor: "46°C" },
  ],
};

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

  // 5) Equipos con planes, mantenimientos, certificaciones, fallas, ficha técnica y alertas
  const equiposCreados = [];

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
    const horometroActual = horasAcumuladas; // Sincronizar horómetro con horas acumuladas
    const estadoOps = ["OPERATIVO", "OPERATIVO", "OPERATIVO", "NO_OPERATIVO"];

    const planesN = randInt(PLANES_POR_EQUIPO[0], PLANES_POR_EQUIPO[1]);
    const mantsN = randInt(MANTS_POR_EQUIPO[0], MANTS_POR_EQUIPO[1]);
    const certsN = randInt(CERTS_POR_EQUIPO[0], CERTS_POR_EQUIPO[1]);
    const imgsN = randInt(IMGS_POR_EQUIPO[0], IMGS_POR_EQUIPO[1]);
    const fallasN = randInt(FALLAS_POR_EQUIPO[0], FALLAS_POR_EQUIPO[1]);

    // ── Ficha Técnica Dinámica ──
    // Obtener ficha base del tipo y tomar un subconjunto aleatorio
    const fichaBase = FICHAS_POR_TIPO[tipo.nombre] ?? FICHAS_POR_TIPO["GENERADOR"];
    const numEspecs = randInt(3, fichaBase.length);
    const fichaSeleccionada = faker.helpers.arrayElements(fichaBase, numEspecs);

    // Agregar alguna especificación extra personalizada aleatoria
    const extrasAleatorias = [
      { clave: "Color", valor: faker.helpers.arrayElement(["Amarillo CAT", "Naranja", "Blanco", "Verde JD", "Azul"]) },
      { clave: "Año de Fabricación", valor: String(randInt(2015, 2024)) },
      { clave: "País de Origen", valor: faker.helpers.arrayElement(["USA", "Japón", "Alemania", "Brasil", "China"]) },
      { clave: "N° de Parte Motor", valor: faker.string.alphanumeric({ length: 10 }).toUpperCase() },
      { clave: "Número de Chasis", valor: faker.vehicle.vin() },
      { clave: "Capacidad del Tanque Hidráulico", valor: `${randInt(50, 300)} Litros` },
      { clave: "Tipo de Correa", valor: `${faker.helpers.arrayElement(["A", "B", "C", "V"])}${randInt(30, 80)}` },
    ];
    const extrasN = randInt(1, 3);
    const extrasSeleccionadas = faker.helpers.arrayElements(extrasAleatorias, extrasN);

    const fichaTecnica = [...fichaSeleccionada, ...extrasSeleccionadas];

    // ── Planes preventivos con frecuencias y frecuenciaHoras ──
    const planesData = Array.from({ length: planesN }).map(() => {
      const frecuencia = faker.helpers.arrayElement([10, 20, 50, 100, 150, 250, 500]);
      // La base (horasUltimaEjecucion) es un valor anterior al horómetro actual
      const base = Math.max(0, horasAcumuladas - randInt(0, frecuencia));
      return {
        descripcionTarea: faker.helpers.arrayElement(TAREAS_PREVENTIVAS),
        frecuenciaValor: frecuencia,
        frecuenciaHoras: frecuencia, // frecuenciaHoras = frecuenciaValor por defecto
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
      include: {
        planes: true,
      },
    });

    equiposCreados.push(equipo);
  }

  // 6) Generar alertas preventivas simuladas basadas en los equipos creados
  console.log("📊 Generando alertas preventivas...");
  let alertasCreadas = 0;

  for (const equipo of equiposCreados) {
    const horasEquipo = equipo.horometroActual ?? equipo.horasAcumuladas ?? 0;

    for (const plan of equipo.planes) {
      const base = plan.horasUltimaEjecucion ?? 0;
      const frecuencia = plan.frecuenciaHoras > 0 ? plan.frecuenciaHoras : plan.frecuenciaValor;
      const meta = base + frecuencia;
      const umbral = Math.max(2, Math.round(frecuencia * 0.15));
      const horasRestantes = meta - horasEquipo;

      let tipoAlerta = null;
      let mensaje = null;

      if (horasEquipo >= meta) {
        tipoAlerta = "VENCIDO";
        mensaje = `⚠️ VENCIDO: El equipo "${equipo.codigo}" superó las ${meta}h (actual: ${horasEquipo}h). Plan: "${plan.descripcionTarea}" requiere ejecución inmediata.`;
      } else if (horasEquipo >= meta - umbral) {
        tipoAlerta = "CRITICO";
        mensaje = `🔴 CRÍTICO: El equipo "${equipo.codigo}" está a ${horasRestantes}h de su meta de ${meta}h. Plan: "${plan.descripcionTarea}".`;
      } else if (horasEquipo >= meta - umbral * 2) {
        tipoAlerta = "ADVERTENCIA";
        mensaje = `🟡 ADVERTENCIA: El equipo "${equipo.codigo}" se acerca a la meta (${horasRestantes}h restantes). Plan: "${plan.descripcionTarea}".`;
      }

      if (tipoAlerta) {
        // Crear la alerta con un estado variable (algunas leídas, algunas no)
        await prisma.alertaPreventiva.create({
          data: {
            equipoId: equipo.id,
            planId: plan.id,
            tipo: tipoAlerta,
            mensaje,
            horasEquipoAlMomento: horasEquipo,
            metaHoras: meta,
            leida: faker.datatype.boolean({ probability: 0.3 }), // 30% leídas
            resuelta: false,
            creadoEn: faker.date.recent({ days: 7 }),
          },
        });
        alertasCreadas++;
      }
    }
  }

  // Imagen para admin
  await prisma.imagen.create({
    data: { url: "https://picsum.photos/seed/admin/400/400", usuarioId: admin.id },
  });

  // Resumen final
  const totalAlertas = await prisma.alertaPreventiva.count();
  const alertasVencidas = await prisma.alertaPreventiva.count({ where: { tipo: "VENCIDO" } });
  const alertasCriticas = await prisma.alertaPreventiva.count({ where: { tipo: "CRITICO" } });
  const alertasAdvertencia = await prisma.alertaPreventiva.count({ where: { tipo: "ADVERTENCIA" } });
  const equiposConFicha = await prisma.equipo.count({ where: { fichaTecnica: { not: { equals: null } } } });

  console.log(`\n✅ Seed completado:`);
  console.log(`   📦 ${N_EQUIPOS} equipos con planes, fallas y certificaciones`);
  console.log(`   📋 ${equiposConFicha} equipos con ficha técnica dinámica`);
  console.log(`   🔔 ${totalAlertas} alertas preventivas generadas:`);
  console.log(`      ⚠️  ${alertasVencidas} VENCIDAS`);
  console.log(`      🔴 ${alertasCriticas} CRÍTICAS`);
  console.log(`      🟡 ${alertasAdvertencia} ADVERTENCIAS`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
