import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const AI_CORE_URL = process.env.AI_CORE_URL || "http://localhost:5001";
const REPORT_PROCESSOR_URL = process.env.REPORT_PROCESSOR_URL || "http://localhost:3002";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "core-backend" });
});

app.post("/upload/code", upload.single("file"), async (req, res, next) => {
  try {
    const language = req.body.language;
    const directCode = req.body.code;
    const fileCode = req.file?.buffer.toString("utf8");
    const code = directCode || fileCode;

    if (!language || !code) {
      return res.status(400).json({ error: "language and code or file are required" });
    }

    const { data } = await axios.post(`${AI_CORE_URL}/analyze/code`, { language, code });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

app.post("/upload/circuit", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const image = req.file.buffer.toString("base64");
    const { data } = await axios.post(`${AI_CORE_URL}/analyze/circuit`, { image });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.response?.status || 500;
  const detail = error.response?.data || { error: error.message || "Unexpected server error" };
  res.status(status).json(detail);
});

app.listen(PORT, () => {
  console.log(`Core Backend listening on http://localhost:${PORT}`);
});
