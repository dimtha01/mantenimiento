import { Router } from "express";
import { getMarcas, getTipos, getUbicaciones, getPropietarios, getParametros } from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/marcas", getMarcas);
router.get("/tipos", getTipos);
router.get("/ubicaciones", getUbicaciones);
router.get("/propietarios", getPropietarios);
router.get("/parametros", getParametros);

export default router;
