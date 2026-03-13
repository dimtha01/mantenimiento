import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

/* ── POST /api/attachments ── */
export const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: "No se recibió ningún archivo" });
        }

        const { attachableType, attachableId } = req.body;
        if (!attachableType || !attachableId) {
            // Si no hay tipo/id, eliminar el archivo subido y retornar error
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ ok: false, message: "Se requieren attachableType y attachableId" });
        }

        const validTypes = ["equipo", "falla", "certificacion"];
        if (!validTypes.includes(attachableType)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ ok: false, message: `attachableType inválido. Use: ${validTypes.join(", ")}` });
        }

        const attachment = await prisma.attachment.create({
            data: {
                filePath: req.file.filename,
                fileType: req.file.mimetype,
                fileName: req.file.originalname,
                attachableId: Number(attachableId),
                attachableType,
            },
        });

        return res.status(201).json({ ok: true, data: attachment });
    } catch (err) {
        console.error(err);
        // Intentar eliminar el archivo si hubo error en BD
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch { }
        }
        return res.status(500).json({ ok: false, message: "Error subiendo archivo" });
    }
};

/* ── GET /api/attachments?type=equipo&id=5 ── */
export const getAttachments = async (req, res) => {
    try {
        const { type, id } = req.query;

        if (!type || !id) {
            return res.status(400).json({ ok: false, message: "Se requieren los parámetros type e id" });
        }

        const attachments = await prisma.attachment.findMany({
            where: {
                attachableType: type,
                attachableId: Number(id),
            },
            orderBy: { creadoEn: "desc" },
        });

        // Construir URLs de acceso  
        const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        const data = attachments.map((att) => ({
            ...att,
            url: `${BASE_URL}/uploads/${att.filePath}`,
            isImage: att.fileType.startsWith("image/"),
        }));

        return res.json({ ok: true, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error obteniendo adjuntos" });
    }
};

/* ── DELETE /api/attachments/:id ── */
export const deleteAttachment = async (req, res) => {
    try {
        const attachment = await prisma.attachment.findUnique({
            where: { id: Number(req.params.id) },
        });

        if (!attachment) {
            return res.status(404).json({ ok: false, message: "Adjunto no encontrado" });
        }

        // Eliminar archivo físico
        const filePath = path.join(UPLOADS_DIR, attachment.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.attachment.delete({ where: { id: Number(req.params.id) } });

        return res.json({ ok: true, message: "Adjunto eliminado" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error eliminando adjunto" });
    }
};

/* ── GET /api/attachments/:id/download ── */
export const downloadAttachment = async (req, res) => {
    try {
        const attachment = await prisma.attachment.findUnique({
            where: { id: Number(req.params.id) },
        });

        if (!attachment) {
            return res.status(404).json({ ok: false, message: "Adjunto no encontrado" });
        }

        const filePath = path.join(UPLOADS_DIR, attachment.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ ok: false, message: "Archivo no encontrado en el servidor" });
        }

        res.setHeader("Content-Disposition", `attachment; filename="${attachment.fileName}"`);
        res.setHeader("Content-Type", attachment.fileType);
        return res.sendFile(filePath);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Error al descargar archivo" });
    }
};
