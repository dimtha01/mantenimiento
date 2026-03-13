// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { seedCatalogos } from "./seeds/catalogos.js";
import { seedUsuarios } from "./seeds/usuarios.js";
import { seedEquipos } from "./seeds/equipos.js";
import { seedAlertas } from "./seeds/alertas.js";
import { seedMaquinaria } from "./seeds/maquinaria.js";
import { seedRepuestos } from "./seeds/repuestos.js";
import { seedHistorialHoras } from "./seeds/historialHoras.js";
import { seedAttachments } from "./seeds/attachments.js";
import { seedRepuestosMantenimiento } from "./seeds/repuestosMantenimiento.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1) Catálogos base
  // Rol, Marca, TipoEquipo, UbicacionEquipo, Propietario, ParametroControl, TipoMantenimiento
  const catalogos = await seedCatalogos(prisma);

  // 2) Usuarios (admin + tecnico + lector + 22 faker con contraseñas hasheadas) + Imagen del admin
  // Usuario, Imagen
  await seedUsuarios(prisma, catalogos);

  // 3) Equipos con todos sus relacionados anidados
  // Equipo, PlanPreventivo, RegistroMantenimiento, CertificacionHistorial, RegistroFalla, Imagen
  const equipos = await seedEquipos(prisma, catalogos);

  // 4) Repuestos para los equipos
  console.log("\n🔧 Generando repuestos...");
  const repuestos = await seedRepuestos(prisma, equipos);

  // 5) Historial de horas para cálculo de promedios
  console.log("\n⏰ Generando historial de horas...");
  await seedHistorialHoras(prisma, equipos);

  // 6) Archivos adjuntos (Attachments) para certificaciones y fallas
  console.log("\n📎 Generando archivos adjuntos...");
  await seedAttachments(prisma, equipos);

  // 7) Asociar repuestos con mantenimientos
  console.log("\n🔗 Asociando repuestos con mantenimientos...");
  const mantenimientos = await prisma.registroMantenimiento.findMany({ take: 50 });
  await seedRepuestosMantenimiento(prisma, mantenimientos, repuestos);

  // 8) Alertas preventivas basadas en los planes de los equipos
  // AlertaPreventiva
  console.log("\n📊 Generando alertas preventivas...");
  await seedAlertas(prisma, equipos);

  // 9) Maquinaria (independiente, sin FK)
  // Maquinaria
  await seedMaquinaria(prisma);

  // Resumen final
  const equiposConFicha = await prisma.equipo.count({
    where: { fichaTecnica: { not: { equals: null } } },
  });

  const totalAttachments = await prisma.attachment.count();
  const totalAsociaciones = await prisma.repuestoMantenimiento.count();

  console.log(`\n✅ Seed completado:`);
  console.log(`   📦 ${equipos.length} equipos con planes, fallas y certificaciones`);
  console.log(`   🔧 ${repuestos.length} repuestos creados`);
  console.log(`   📎 ${totalAttachments} archivos adjuntos creados`);
  console.log(`   🔗 ${totalAsociaciones} asociaciones repuesto-mantenimiento`);
  console.log(`   📋 ${equiposConFicha} equipos con ficha técnica dinámica`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
