import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import authRoutes from "./authRoutes.js";
import credibilityRoutes from "./credibilityRoutes.js";
import karmaRoutes from "./karmaRoutes.js";
import communityRoutes from "./communityRoutes.js";
import matchmakingRoutes from "./matchmakingRoutes.js";
import skillsRoutes from "./skillsRoutes.js";
import sosRoutes from "./sosRoutes.js";
import usersRoutes from "./usersRoutes.js";
import connectionsRoutes from "./connectionsRoutes.js";

const router = Router();

router.get("/health", (req, res, next) => {
  void getHealth(req, res).catch(next);
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/karma", karmaRoutes);
router.use("/sos", sosRoutes);
router.use("/skills", skillsRoutes);
router.use("/matchmaking", matchmakingRoutes);
router.use("/connections", connectionsRoutes);
router.use("/community", communityRoutes);
router.use("/credibility", credibilityRoutes);

export default router;
