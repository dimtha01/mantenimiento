import { Router } from "express";
import { getEquipos, getEquipoById, createEquipo, updateEquipo, createCertificacion } from "../controllers/equipos.controller.js";

const router = Router();

router.get("/", getEquipos);
router.get("/:id", getEquipoById);
router.post("/", createEquipo);
router.put("/:id", updateEquipo);
router.post("/:id/certificaciones", createCertificacion);

export default router;

