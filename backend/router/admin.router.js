// routes/admin.routes.js

import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { getPlatformStats } from "../controller/admin.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyRole("Admin")); // তোমার নিজের মিডলওয়্যার

router.get("/stats", getPlatformStats);

export default router;