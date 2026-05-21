import { Router } from "express";
import {
  getSkillImplications,
  getSkillsMe,
  putSkillsMe,
} from "../controllers/skillsController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.get("/implications", (req, res, next) => {
  void getSkillImplications(req, res).catch(next);
});

router.get("/me", requireAuth, (req, res, next) => {
  void getSkillsMe(req, res).catch(next);
});

router.put("/me", requireAuth, (req, res, next) => {
  void putSkillsMe(req, res).catch(next);
});

export default router;
