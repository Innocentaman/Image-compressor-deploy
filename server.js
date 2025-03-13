import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import imageRoutes from "./routes/imageRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const corsOptions = {
    origin: ["https://67d31f864eb5ac24498044a8--lambent-stardust-415fb4.netlify.app/"], // Replace with your actual Netlify domain
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  };
app.use(cors());
app.use(express.json());

connectDB();
app.use("/api", imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
