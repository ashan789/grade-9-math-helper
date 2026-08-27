import "dotenv/config";

export function getConfig() {
  return {
    apiKey: process.env.DASHSCOPE_API_KEY,
    visionModel: process.env.QWEN_VL_MODEL || "qwen-vl-max",
    textModel: process.env.QWEN_TEXT_MODEL || "qwen-plus",
    port: Number(process.env.PORT || 3000),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "*")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

