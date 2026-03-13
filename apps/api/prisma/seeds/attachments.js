// prisma/seeds/attachments.js
import { faker } from "@faker-js/faker";
import { promises as fs } from 'fs';
import path from 'path';

function randInt(min, max) {
    return faker.number.int({ min, max });
}

export async function seedAttachments(prisma, equipos) {
    // Asegurar que el directorio uploads existe
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
    } catch (e) {
        // Directorio ya existe, está bien
    }

    const attachments = [];
    const TIPOS_ARCHIVO = ['pdf', 'jpg', 'png', 'docx'];

    for (const equipo of equipos) {
        // Agregar attachments a algunas certificaciones
        const certificaciones = await prisma.certificacionHistorial.findMany({
            where: { equipoId: equipo.id },
            take: 2
        });

        for (const cert of certificaciones) {
            if (Math.random() > 0.5) {
                const tipo = faker.helpers.arrayElement(TIPOS_ARCHIVO);
                const fileName = `cert_${cert.id}_${faker.string.alphanumeric(6)}.${tipo}`;

                const attachment = await prisma.attachment.create({
                    data: {
                        filePath: `uploads/${fileName}`,
                        fileType: tipo === 'pdf' ? 'application/pdf' :
                                  tipo === 'jpg' ? 'image/jpeg' :
                                  tipo === 'png' ? 'image/png' :
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        fileName: `Certificación ${cert.nombre} - ${equipo.modelo}.${tipo}`,
                        attachableId: cert.id,
                        attachableType: 'certificacion',
                        creadoEn: faker.date.recent({ days: randInt(1, 365) })
                    }
                });

                attachments.push(attachment);
            }
        }

        // Agregar attachments a algunas fallas
        const fallas = await prisma.registroFalla.findMany({
            where: { equipoId: equipo.id },
            take: 2
        });

        for (const falla of fallas) {
            if (Math.random() > 0.5) {
                const tipo = faker.helpers.arrayElement(['jpg', 'png']);
                const fileName = `falla_${falla.id}_${faker.string.alphanumeric(6)}.${tipo}`;

                const attachment = await prisma.attachment.create({
                    data: {
                        filePath: `uploads/${fileName}`,
                        fileType: tipo === 'jpg' ? 'image/jpeg' : 'image/png',
                        fileName: `Evidencia falla - ${falla.descripcion.slice(0, 20)}.${tipo}`,
                        attachableId: falla.id,
                        attachableType: 'falla',
                        creadoEn: faker.date.recent({ days: randInt(1, 90) })
                    }
                });

                attachments.push(attachment);
            }
        }
    }

    console.log(`✅ ${attachments.length} archivos adjuntos creados (certificaciones y fallas)`);
    return attachments;
}
