import { Router } from "express";
import { uploadProfileImageController } from "../controllers/profileImage.controller.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post(
  "/profile-image",
  upload.single("image"),
  uploadProfileImageController,
);

export default router;
