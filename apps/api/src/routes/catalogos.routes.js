import { Router } from "express";
import {
    getMarcas, createMarca, deleteMarca,
    getTipos, createTipo, deleteTipo,
    getUbicaciones, createUbicacion, deleteUbicacion,
    getPropietarios, createPropietario, deletePropietario,
    getParametros
} from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/marcas", getMarcas);
router.post("/marcas", createMarca);
router.delete("/marcas/:id", deleteMarca);

router.get("/tipos", getTipos);
router.post("/tipos", createTipo);
router.delete("/tipos/:id", deleteTipo);

router.get("/ubicaciones", getUbicaciones);
router.post("/ubicaciones", createUbicacion);
router.delete("/ubicaciones/:id", deleteUbicacion);

router.get("/propietarios", getPropietarios);
router.post("/propietarios", createPropietario);
router.delete("/propietarios/:id", deletePropietario);

router.get("/parametros", getParametros);

export default router;
