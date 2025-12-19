import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

import {
  getAllCanvas,
  getCanvas,
  initialiseCanva,
  exportCanvasPdf,
  addText,
  addRectangle,
  addCircle,
  addImage,
} from "../controller/canvas.controller.js";

router.route("/").get(getAllCanvas);
router.route("/:id").get(getCanvas);
router.route("/init").post(initialiseCanva);
router.route("/:id/pdf").get(exportCanvasPdf);
router.route("/:id/add/text").post(addText);
router.route("/:id/add/image").post(upload.single("image"), addImage);
router.route("/:id/add/circle").post(addCircle);
router.route("/:id/add/rectangle").post(addRectangle);

export default router;
