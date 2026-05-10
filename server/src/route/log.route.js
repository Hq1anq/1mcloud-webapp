import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as logController from "../controller/log.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/transaction", logController.transaction);
router.get("/change-ip", logController.changeIp);

export default router;
