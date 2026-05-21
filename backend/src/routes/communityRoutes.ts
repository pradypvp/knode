import { Router } from "express";
import {
  getCommunityListings,
  postCommunityListing,
} from "../controllers/communityController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";

const router = Router();

router.use(requireDatabase);

router.get("/listings", (req, res, next) => {
  void getCommunityListings(req, res).catch(next);
});

router.post("/listings", requireAuth, (req, res, next) => {
  void postCommunityListing(req, res).catch(next);
});

export default router;
