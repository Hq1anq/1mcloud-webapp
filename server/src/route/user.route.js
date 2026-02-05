import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import * as userController from "../controller/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);

export default router;
