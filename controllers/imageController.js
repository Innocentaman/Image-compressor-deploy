import sharp from "sharp";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB GridFS Setup
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// Multer Setup for Memory Storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload & Compress Image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { quality = 60, format = "jpeg" } = req.body;
    const imageQuality = Math.max(1, Math.min(100, parseInt(quality, 10)));

    // Get original width, limit max width to 800px
    const metadata = await sharp(req.file.buffer).metadata();
    const imageWidth = Math.min(metadata.width, 800);

    // Convert and compress image
    const outputBuffer = await sharp(req.file.buffer)
      .resize({ width: imageWidth })
      [format]({ quality: imageQuality })
      .toBuffer();

    // Store in MongoDB GridFS
    const uploadStream = gfs.openUploadStream(`${Date.now()}-compressed.${format}`, {
      contentType: `image/${format}`
    });

    uploadStream.end(outputBuffer);

    uploadStream.on("finish", () => {
      res.status(200).json({ 
        message: "Image uploaded and compressed successfully",
        fileId: uploadStream.id.toString()
      });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Serve Image from GridFS
export const getImage = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Check if the file exists in GridFS
    const file = await conn.db.collection("uploads.files").findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Set correct headers for file download
    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    // Stream file from GridFS
    const downloadStream = gfs.openDownloadStream(fileId);
    
    // Handle streaming errors
    downloadStream.on("error", (err) => {
      res.status(500).json({ error: "Error streaming file" });
    });

    // Pipe the stream directly to the response
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
