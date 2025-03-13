import express from "express";
import upload from "../upload.js";
import { uploadImage, getImage } from "../controllers/imageController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.get("/image/:id", getImage);

export default router;
