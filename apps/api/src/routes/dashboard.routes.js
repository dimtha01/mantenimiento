import { Router } from "express";
import { getDashboard, getAlertasHoras } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", getDashboard);
router.get("/alertas-horas", getAlertasHoras);

export default router;
