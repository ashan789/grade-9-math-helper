import OpenAI from "openai";
import { z } from "zod";
import { getConfig } from "./config.js";

const variantsSchema = z.object({
  knowledgePoint: z.string().min(1),
  questions: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  ).length(3),
});

function client() {
  const { apiKey } = getConfig();
  if (!apiKey) {
    const error = new Error("服务端尚未配置 DASHSCOPE_API_KEY");
    error.status = 503;
    throw error;
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

export async function recognizeMathProblem({ buffer, mimeType }) {
  const { visionModel } = getConfig();
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const response = await client().chat.completions.create({
    model: visionModel,
    temperature: 0,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "请准确识别图片中的一道九年级数学题。保留题号、条件、问题、选项和数学公式；公式用易编辑的纯文本或 LaTeX 表示。只输出题目正文，不要解答，不要解释。",
        },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    }],
  });
  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("视觉模型未返回识别结果");
  return text;
}

export async function generateVariants(problem) {
  const { textModel } = getConfig();
  const response = await client().chat.completions.create({
    model: textModel,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "你是严谨的九年级数学老师。根据原题生成恰好3道考察相同核心知识点、但数字或情境有变化的题。难度与原题接近，题意完整且答案可验证。仅输出 JSON，不使用 Markdown。结构为：{\"knowledgePoint\":\"知识点\",\"questions\":[{\"question\":\"题目\",\"answer\":\"答案与必要步骤\"}]}。",
      },
      { role: "user", content: `原题：\n${problem}` },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("文本模型未返回生成结果");
  return variantsSchema.parse(parseJson(content));
}

