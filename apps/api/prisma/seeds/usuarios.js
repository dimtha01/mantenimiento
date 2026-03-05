// prisma/seeds/usuarios.js
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function seedUsuarios(prisma, { roles }) {
    const rolAdmin = roles.find((r) => r.nombre === "ADMIN");
    const rolTecnico = roles.find((r) => r.nombre === "TECNICO") ?? rolAdmin;
    const rolLector = roles.find((r) => r.nombre === "LECTOR") ?? rolAdmin;

    // ── Usuario administrador fijo ──
    // Contraseña: admin123  →  ingresa con admin@demo.com / admin123
    const adminHash = await bcrypt.hash("admin123", SALT_ROUNDS);
    const admin = await prisma.usuario.upsert({
        where: { email: "admin@demo.com" },
        update: { password: adminHash },
        create: {
            email: "admin@demo.com",
            password: adminHash,
            nombre: "Admin Demo",
            rolId: rolAdmin.id,
        },
    });

    // Imagen para el admin
    await prisma.imagen.create({
        data: { url: "https://picsum.photos/seed/admin/400/400", usuarioId: admin.id },
    });

    // ── Usuarios con nombres reconocibles ──
    //  Patrón de contraseña: primera-parte-del-email + "123"
    //  Ej: juan.perez@ejemplo.com  →  contraseña: juan.perez123
    const usuariosBase = [
        { email: "tecnico@demo.com", nombre: "Carlos Técnico", rolId: rolTecnico.id, pass: "tecnico123" },
        { email: "lector@demo.com", nombre: "María Lectora", rolId: rolLector.id, pass: "lector123" },
    ];

    for (const u of usuariosBase) {
        const hash = await bcrypt.hash(u.pass, SALT_ROUNDS);
        await prisma.usuario.upsert({
            where: { email: u.email },
            update: { password: hash },
            create: { email: u.email, password: hash, nombre: u.nombre, rolId: u.rolId },
        });
    }

    // ── Usuarios adicionales generados con faker (contraseña hasheada) ──
    const N_USUARIOS = 22; // 22 + 3 fijos = 25 total
    const passwordGenericaHash = await bcrypt.hash("usuario123", SALT_ROUNDS);

    const usuariosData = await Promise.all(
        Array.from({ length: N_USUARIOS }).map(async (_, i) => {
            const rol = i % 10 === 0 ? rolTecnico : rolLector;
            return {
                email: faker.internet.email().toLowerCase(),
                password: passwordGenericaHash, // todos los faker usan "usuario123"
                nombre: faker.person.fullName(),
                rolId: rol.id,
            };
        })
    );

    await prisma.usuario.createMany({ data: usuariosData, skipDuplicates: true });

    console.log("✅ Usuarios creados:");
    console.log("   📧 admin@demo.com        →  admin123   (ADMIN)");
    console.log("   📧 tecnico@demo.com      →  tecnico123 (TECNICO)");
    console.log("   📧 lector@demo.com       →  lector123  (LECTOR)");
    console.log(`   👥 ${N_USUARIOS} usuarios faker      →  usuario123`);

    return { admin, rolAdmin, rolTecnico, rolLector };
}
