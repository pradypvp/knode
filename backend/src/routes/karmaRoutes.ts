import { Router } from "express";
import { getLedger, postTransfer } from "../controllers/karmaController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.post("/transfer", requireAuth, (req, res, next) => {
  void postTransfer(req, res).catch(next);
});

router.get("/ledger", requireAuth, (req, res, next) => {
  void getLedger(req, res).catch(next);
});

export default router;
