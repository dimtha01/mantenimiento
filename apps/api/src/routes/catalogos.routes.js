import { Router } from "express";
import {
    getMarcas, createMarca,
    getTipos, createTipo,
    getUbicaciones, createUbicacion,
    getPropietarios, createPropietario,
    getParametros
} from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/marcas", getMarcas);
router.post("/marcas", createMarca);

router.get("/tipos", getTipos);
router.post("/tipos", createTipo);

router.get("/ubicaciones", getUbicaciones);
router.post("/ubicaciones", createUbicacion);

router.get("/propietarios", getPropietarios);
router.post("/propietarios", createPropietario);

router.get("/parametros", getParametros);

export default router;
