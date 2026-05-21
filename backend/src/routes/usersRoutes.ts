import { Router } from "express";
import { getMe, patchMe } from "../controllers/meController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.get("/me", requireAuth, (req, res, next) => {
  void getMe(req, res).catch(next);
});

router.patch("/me", requireAuth, (req, res, next) => {
  void patchMe(req, res).catch(next);
});

export default router;
