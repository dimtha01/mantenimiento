import { Router } from "express";
import {
    getRepuestos,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    asociarRepuestosMantenimiento,
} from "../controllers/repuestos.controller.js";

const router = Router();

router.get("/", getRepuestos);
router.post("/", createRepuesto);
router.put("/:id", updateRepuesto);
router.delete("/:id", deleteRepuesto);
router.post("/asociar", asociarRepuestosMantenimiento);

export default router;
