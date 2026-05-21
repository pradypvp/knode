import { Router } from "express";
import { postSession } from "../controllers/credibilityController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.post("/session", requireAuth, (req, res, next) => {
  void postSession(req, res).catch(next);
});

export default router;
