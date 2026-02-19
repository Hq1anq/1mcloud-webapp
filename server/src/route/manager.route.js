import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as managerController from "../controller/manager.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/list", managerController.list);
router.post("/create", managerController.create);
router.post("/create/calculate", managerController.calculate);
router.post("/change-ip", managerController.changeIp);
router.post("/reinstall", managerController.reinstall);
router.post("/pause", managerController.pause);
router.post("/reboot", managerController.reboot);
router.post("/renew", managerController.renew);
router.put("/info/note", managerController.updateNote);

export default router;
