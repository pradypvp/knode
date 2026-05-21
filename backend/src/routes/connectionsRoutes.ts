import { Router } from "express";
import {
  getConnections,
  postAccept,
  postCancel,
  postDecline,
  postRequest,
} from "../controllers/connectionsController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);
router.use(requireAuth);

router.get("/", (req, res, next) => {
  void getConnections(req, res).catch(next);
});

router.post("/request", (req, res, next) => {
  void postRequest(req, res).catch(next);
});

router.post("/:id/accept", (req, res, next) => {
  void postAccept(req, res).catch(next);
});

router.post("/:id/decline", (req, res, next) => {
  void postDecline(req, res).catch(next);
});

router.post("/:id/cancel", (req, res, next) => {
  void postCancel(req, res).catch(next);
});

export default router;

