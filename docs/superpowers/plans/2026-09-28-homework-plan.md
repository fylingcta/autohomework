# Hengyang Homework Implementation Plan

> **For agentic workers:** Use executing-plans to implement inline, task-by-task.

**Goal:** 提供可静态发布、按树扩展、支持在线及固定作业照片批改的衡阳语文示范。

**Architecture:** shared 存放类型、题库与评分；src 负责目录、答题、照片确认和结果；server 独立提供识别及主观评分接口。

**Tech Stack:** React、TypeScript、Vite、Express、Node 22、tsx/node:test。

### 1. 基础与规则
- [ ] 建立 package.json、tsconfig、Vite 配置。
- [ ] tests/grading.test.ts 先覆盖标准答案归一化、空答、主观题待复核、非法 AI 评分。
- [ ] shared/types.ts、catalog.ts、grading.ts 实现对应逻辑；运行 `npm test`。

### 2. 页面
- [ ] src/App.tsx 实现树导航、模式切换、在线答题、图片确认、提交、人工复核、错题重练。
- [ ] src/storage.ts 处理持久化失败；src/api.ts 处理服务错误；src/style.css 提供移动和打印样式。
- [ ] 用浏览器验证在线评分、刷新恢复、照片人工录入和错题。

### 3. API
- [ ] tests/server.test.ts 验证未配置、未知作业、图片校验和模型输出校验。
- [ ] server/app.ts 实现限流、来源检查、识别及评分；server/ai.ts 实现超时和 JSON 解析。
- [ ] tests 使用注入模型响应验证成功与失败，不调用收费服务。

### 4. 发布和验收
- [ ] 添加 .env.example、README.md、.github/workflows/pages.yml。
- [ ] 执行 `npm test`、`npm run build`、浏览器关键流程，记录环境与已验证边界。
- [ ] 不提交 Git；用户没有要求创建提交。
