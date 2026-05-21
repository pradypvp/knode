import { Router } from "express";
import { postLogin, postRegister } from "../controllers/authController.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.post("/register", (req, res, next) => {
  void postRegister(req, res).catch(next);
});

router.post("/login", (req, res, next) => {
  void postLogin(req, res).catch(next);
});

export default router;
