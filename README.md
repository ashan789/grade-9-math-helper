# 九年级数学错题助手

微信小程序 MVP：拍摄或选择一道数学错题，使用通义千问视觉模型识别题目，再生成 3 道同知识点变式题及答案。

## 本地运行

1. 安装 Node.js 20+，执行 `npm install`。
2. 复制 `.env.example` 为 `.env`，填入阿里云百炼 API Key。
3. 执行 `npm run dev`，访问 `http://localhost:3000/api/health` 验证后端。
4. 使用微信开发者工具导入本目录；本地开发时在“详情 → 本地设置”勾选“不校验合法域名”。
5. 真机调试前，把 `miniprogram/config.js` 中地址改成已备案、启用 HTTPS 且已加入小程序后台合法域名的后端地址。

## API

- `POST /api/recognize`：`multipart/form-data`，字段名 `image`，支持 JPG/PNG/WebP，最大 10MB。
- `POST /api/generate`：JSON `{ "problem": "题目文本" }`。
- `GET /api/health`：健康检查。

## 部署

### Vercel

导入仓库后配置 `DASHSCOPE_API_KEY`、`QWEN_VL_MODEL`、`QWEN_TEXT_MODEL` 环境变量即可。项目已包含 `api/index.js` 和 `vercel.json`。

### Railway

使用默认 Node 部署，启动命令为 `npm start`，并配置相同环境变量。Railway 会注入 `PORT`。

## 当前范围

不包含登录、历史记录、班级、付费、图片增强、分类标签或学习报告。当前流程不持久化数据，因此 MVP 没有启用 SQLite；需要错题历史时再增加数据库迁移。

