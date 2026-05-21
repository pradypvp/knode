import { Router } from "express";
import { postFind } from "../controllers/matchmakingController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.post("/find", requireAuth, (req, res, next) => {
  void postFind(req, res).catch(next);
});

export default router;
