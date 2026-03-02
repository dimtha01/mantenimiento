import { Router } from "express";
import {
    getAlertas,
    getResumenAlertas,
    marcarLeida,
    marcarTodasLeidas,
    resolverAlerta,
    ejecutarEvaluacion,
} from "../controllers/alertas.controller.js";

const router = Router();

router.get("/", getAlertas);
router.get("/resumen", getResumenAlertas);
router.put("/leer-todas", marcarTodasLeidas);
router.put("/:id/leer", marcarLeida);
router.put("/:id/resolver", resolverAlerta);
router.post("/evaluar", ejecutarEvaluacion);

export default router;
