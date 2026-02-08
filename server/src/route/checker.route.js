import express from "express";
import { checkProxies } from "../controller/checker.controller.js";

const router = express.Router();

router.post("/", checkProxies);

export default router;
