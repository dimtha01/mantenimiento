import { Router } from "express";
import {
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  createCertificacion,
  updateCertificacion,
  registrarHorasUso,
  getProximoMantenimiento,
  cambiarEstadoOperativo,
  createFalla,
  getFallas,
  updateFalla
} from "../controllers/equipos.controller.js";

const router = Router();

router.get("/", getEquipos);
router.get("/:id", getEquipoById);
router.post("/", createEquipo);
router.put("/:id", updateEquipo);
router.post("/:id/certificaciones", createCertificacion);
router.put("/:id/certificaciones/:certId", updateCertificacion);
router.post("/:id/registrar-horas", registrarHorasUso);
router.get("/:id/proximo-mantenimiento", getProximoMantenimiento);
router.put("/:id/estado-operativo", cambiarEstadoOperativo);
router.get("/:id/fallas", getFallas);
router.post("/:id/fallas", createFalla);
router.put("/:id/fallas/:fallaId", updateFalla);

export default router;
