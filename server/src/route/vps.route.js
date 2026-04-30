import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as vpsController from "../controller/vps.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/plan", vpsController.getVpsPlan);
router.get("/support", vpsController.support);
router.post("/upgrade/plans", vpsController.upgradePlans);

router.get("/", vpsController.getVpsList);
router.post("/", vpsController.saveVpsList);
router.delete("/", vpsController.deleteVpsList);

export default router;
