import express from "express";

import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
import * as managerController from "../controller/manager.controller.js";

const router = express.Router();

router.post(
  "/create/calculate",
  optionalAuthenticate,
  managerController.calculate,
);

router.use(authenticate);

router.get("/list", managerController.list);
router.get("/proxy/support", managerController.support);
router.post("/create", managerController.create);

router.post("/change-ip", managerController.changeIp);
router.post("/reinstall", managerController.reinstall);
router.post("/pause", managerController.pause);
router.post("/reboot", managerController.reboot);
router.post("/renew", managerController.renew);
router.post("/refund", managerController.refund);
router.post("/renew/calculate", managerController.renewCalculate);
router.post("/refund/calculate", managerController.refundCalculate);
router.put("/info/note", managerController.updateNote);
router.post("/reset-password", managerController.resetPassword);
router.post("/auto-fix", managerController.autoFix);
router.post("/auto-renew", managerController.toggleAutoRenew);

export default router;
