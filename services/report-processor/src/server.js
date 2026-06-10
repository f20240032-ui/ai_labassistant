import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3002);
const AI_CORE_URL = process.env.AI_CORE_URL || "http://localhost:5001";
const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 20);
const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES || "application/pdf,image/png,image/jpeg,image/webp")
  .split(",")
  .map((type) => type.trim())
  .filter(Boolean);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

app.use(cors());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "report-processor" });
});

app.post("/process/report", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF or image file is required" });
    }

    const text = await extractText(req.file);
    if (!text.trim()) {
      return res.status(422).json({
        error: "No extractable text found. Please upload a text-based PDF or paste a clearer report scan.",
      });
    }

    const { data } = await axios.post(`${AI_CORE_URL}/analyze/report`, { text });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
  }

  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(file.buffer);
    return result.data.text || "";
  } finally {
    await worker.terminate();
  }
}

app.use((error, _req, res, _next) => {
  const status = error.response?.status || (error.message?.startsWith("Unsupported") ? 415 : 500);
  const detail = error.response?.data || { error: error.message || "Unexpected server error" };
  res.status(status).json(detail);
});

app.listen(PORT, () => {
  console.log(`Lab Report Processor listening on http://localhost:${PORT}`);
});
