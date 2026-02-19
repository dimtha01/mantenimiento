import { Router } from "express";
import {
    getMantenimientos,
    getMantenimientoById,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
    getPlanes,
    createPlan,
    updatePlan,
    deletePlan,
    getTiposMantenimiento,
} from "../controllers/mantenimientos.controller.js";

const router = Router();

/* Tipos (estático — debe ir ANTES de /:id) */
router.get("/tipos", getTiposMantenimiento);

/* Planes preventivos (estático — debe ir ANTES de /:id) */
router.get("/planes", getPlanes);
router.post("/planes", createPlan);
router.put("/planes/:id", updatePlan);
router.delete("/planes/:id", deletePlan);

/* Registros de mantenimiento */
router.get("/", getMantenimientos);
router.post("/", createMantenimiento);
router.get("/:id", getMantenimientoById);
router.put("/:id", updateMantenimiento);
router.delete("/:id", deleteMantenimiento);

export default router;
