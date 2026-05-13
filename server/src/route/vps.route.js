import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as vpsController from "../controller/vps.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/plan", vpsController.getVpsPlan);
router.get("/support", vpsController.support);
router.get("/support/os", vpsController.supportOs);
router.post("/upgrade/plans", vpsController.upgradePlans);
router.post("/upgrade/calculate", vpsController.upgradeCalculate);
router.post("/upgrade", vpsController.upgrade);

router.get("/", vpsController.getVpsList);
router.post("/", vpsController.saveVpsList);
router.delete("/", vpsController.deleteVpsList);

export default router;
