import cors from "cors";
import express from "express";
import multer from "multer";
import { z } from "zod";
import { getConfig } from "./config.js";
import { generateVariants, recognizeMathProblem } from "./qwen.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE } });

export function createApp() {
  const app = express();
  const { allowedOrigins } = getConfig();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("该来源不在允许列表中"));
    },
  }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/recognize", upload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "请选择一张题目图片" });
      if (!allowedTypes.has(req.file.mimetype)) return res.status(415).json({ error: "仅支持 JPG、PNG 或 WebP 图片" });
      const text = await recognizeMathProblem({ buffer: req.file.buffer, mimeType: req.file.mimetype });
      res.json({ text });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/generate", async (req, res, next) => {
    try {
      const { problem } = z.object({ problem: z.string().trim().min(3).max(8000) }).parse(req.body);
      res.json(await generateVariants(problem));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "图片不能超过 10MB" });
    }
    if (error instanceof z.ZodError) return res.status(400).json({ error: "题目内容格式不正确" });
    res.status(error.status || 500).json({ error: error.message || "服务器处理失败，请稍后重试" });
  });

  return app;
}

