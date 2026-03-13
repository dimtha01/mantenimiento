import { Router } from "express";
import {
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    downloadAttachment,
} from "../controllers/attachments.controller.js";
import { upload, handleMulterError } from "../lib/upload.js";

const router = Router();

// Subir archivo (multipart/form-data con campo "file")
router.post("/", upload.single("file"), handleMulterError, uploadAttachment);

// Listar adjuntos: GET /api/attachments?type=equipo&id=5
router.get("/", getAttachments);

// Descargar archivo: GET /api/attachments/:id/download
router.get("/:id/download", downloadAttachment);

// Eliminar adjunto
router.delete("/:id", deleteAttachment);

export default router;
