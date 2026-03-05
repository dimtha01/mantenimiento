// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { seedCatalogos } from "./seeds/catalogos.js";
import { seedUsuarios } from "./seeds/usuarios.js";
import { seedEquipos } from "./seeds/equipos.js";
import { seedAlertas } from "./seeds/alertas.js";
import { seedMaquinaria } from "./seeds/maquinaria.js";

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

  // 4) Alertas preventivas basadas en los planes de los equipos
  // AlertaPreventiva
  console.log("\n📊 Generando alertas preventivas...");
  await seedAlertas(prisma, equipos);

  // 5) Maquinaria (independiente, sin FK)
  // Maquinaria
  await seedMaquinaria(prisma);

  // Resumen final
  const equiposConFicha = await prisma.equipo.count({
    where: { fichaTecnica: { not: { equals: null } } },
  });

  console.log(`\n✅ Seed completado:`);
  console.log(`   📦 ${equipos.length} equipos con planes, fallas y certificaciones`);
  console.log(`   📋 ${equiposConFicha} equipos con ficha técnica dinámica`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
