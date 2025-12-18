import { Router } from "express";
import { openaiController } from "../controllers/openAI.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post("/generate-story", openaiController.generateStory);
router.post("/search", openaiController.searchBooksAndMovies);
router.post("/latest-update", openaiController.getLatestUpdate); // Legacy endpoint

export default router;
