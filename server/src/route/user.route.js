import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as userController from "../controller/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.get("/licenses", userController.getLicenses);

router.post("/licenses", userController.addLicenses);
router.put("/licenses", userController.editLicenses);
router.delete("/licenses/:id", userController.deleteLicenses);

export default router;
