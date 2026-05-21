import { Router } from "express";
import { postSuggestBounty } from "../controllers/sosAiController.js";
import {
  getSosList,
  getSosMessagesHttp,
  getSosOne,
  getSosSessions,
  patchSosPick,
  postSos,
  postSosMessageHttp,
} from "../controllers/sosController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.post("/suggest-bounty", (req, res, next) => {
  void postSuggestBounty(req, res).catch(next);
});

router.use(requireDatabase);

router.get("/", requireAuth, (req, res, next) => {
  void getSosList(req, res).catch(next);
});

router.get("/sessions", requireAuth, (req, res, next) => {
  void getSosSessions(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  void postSos(req, res).catch(next);
});

router.get("/:id/messages", requireAuth, (req, res, next) => {
  void getSosMessagesHttp(req, res).catch(next);
});

router.post("/:id/messages", requireAuth, (req, res, next) => {
  void postSosMessageHttp(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  void getSosOne(req, res).catch(next);
});

router.patch("/:id/pick", requireAuth, (req, res, next) => {
  void patchSosPick(req, res).catch(next);
});

export default router;
