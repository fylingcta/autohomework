# 雁城作业本 · 衡阳语文示范

湖南衡阳小学三年级语文上册第一单元示范，支持在线答题、固定作业拍照转录后批改。原创能力练习，不是官方试卷；请按学校实际教材版本核对适用范围。

## 环境与启动

要求 **Node.js 22+、npm 10+**。

本次开发机器默认是 Node 10，已在临时工具目录准备 Node 22。此机器可先运行下面命令再使用文档中的 npm 命令；长期使用建议正式安装 Node 22：

```bash
export PATH="/tmp/opencode/autohomework-tools/node_modules/node/bin:/tmp/opencode/autohomework-tools/node_modules/.bin:$PATH"
```

```bash
npm ci
npm run dev
```

打开终端显示的地址（通常为 http://localhost:5173）。不启动后端也可在线答题、规则评分、主观题人工复核、记录错题、打印；照片可预览并手动录入答案。

需要 AI 时，复制 `.env.example` 为 `.env`，填入 `AI_API_KEY`、`AI_MODEL`、`AI_BASE_URL`，另开一个终端：

```bash
npm run server
```

刷新前端，右上角将显示服务配置状态。状态仅代表后端已配置模型，实际可用性在请求时验证。API 必须兼容 OpenAI `POST /chat/completions`、图片 `image_url` 及 `response_format: json_object`。密钥只放后端，不能使用 `VITE_` 前缀。

## 使用流程

1. 左侧树状目录选择作业。
2. 在线答题，或先打印空白作业、纸上完成，再上传 JPG/PNG/WebP 照片（单张 ≤ 8MB）。
3. 照片模式点击识别，逐题核对并修改识别答案；勾选确认后才能提交。不支持把任意练习册当作当前作业批改。
4. 客观题通过规则判分。非空主观题无 AI 时显示待评分；有 AI 时显示建议分，仍允许家长/老师复核。
5. 批改结果展示参考答案和采分点。已判定失分题收录错题本，可重练或手动移除。

所有答案/成绩/错题仅保存在当前浏览器，无账号或跨设备同步。图片不写入浏览器存储；使用识别时会发送给配置的后端及模型提供商。AI 故障会保留作答并降级为规则评分和人工复核。填空题第一版按完整答案匹配，不做逐字部分给分。

## GitHub Pages 发布

将本目录作为独立仓库根目录上传 GitHub，默认主分支 `main`。

1. 仓库 **Settings → Pages → Source → GitHub Actions**。
2. 如需要 AI，先独立部署后端；在 **Settings → Secrets and variables → Actions → Variables** 添加公开变量 `VITE_API_BASE_URL`，如 `https://homework-api.example.com`，末尾不加 `/api`。
3. 推送代码或手动运行 **Publish frontend to GitHub Pages** 工作流。
4. 部署完成在 Pages 设置页获取网站地址。Vite 使用相对资源路径，支持仓库子路径。

不配置后端地址时，发布页面仍可本地练习，但不能自动识别照片或进行 AI 评分。GitHub Pages 不运行 Node.js 后端。

### 后端部署

使用支持 Node 22 的服务平台或服务器，以本仓库为工作目录：安装命令 `npm ci`，启动命令 `npm run server`。`tsx` 是运行所需工具，因此当前方案不要使用 `npm ci --omit=dev`。

在后端平台配置 `PORT`（平台通常自动提供）、`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL` 和 `ALLOWED_ORIGINS`。例如前端地址 `https://yourname.github.io/autohomework/` 的允许来源是 `https://yourname.github.io`，不带路径。多个来源逗号分隔。后端应提供 HTTPS，前端地址修改后需重新构建。

API 每个 IP 每分钟最多12次业务请求；CORS 是浏览器来源限制，不是身份认证。此版本是无账号示范，公网规模使用前应按实际用户量补充身份和用量控制。反向代理下默认不信任转发 IP，可能共享限流桶；应根据部署平台配置可信代理，勿直接信任所有来源。

## 扩展树状目录

```text
湖南 · 衡阳
└── 小学三年级
    └── 语文
        └── 统编版 · 上册
            └── 第一单元 · 校园生活
                └── 单元能力练习（一）
```

修改 `shared/catalog.ts`：

- `catalog` 是递归目录，可新增 `grade`、`subject`、`book`、`unit` 节点。
- `worksheets` 保存实际作业；每份作业有唯一 `id`。
- 作业叶子 `kind: 'worksheet'` 的 `worksheetId` 指向作业 ID。
- 题目支持 `choice`、`fill`、`short`，必填 `points`、`knowledge`、`reference`、`rubric`；客观题填写 `accepted`，选择题填写 `options`。
- ID 保持稳定，浏览器记录按作业 ID 隔离。目录和作业数据同时供前后端使用，修改后需更新两端。
- 新学科可复用目录和客观题评分；AI 提示词目前专为小学语文，扩展到其他学科时应在 `server/app.ts` 增加对应学科评分策略并验证。

## 目录与校验

```text
shared/                  类型、递归目录、题库、规则评分
src/                     React 页面、存储、API 客户端、样式
server/                  Express API、模型适配
tests/                   评分与 API 测试
.github/workflows/       Pages 自动发布
docs/superpowers/        设计与实施计划
```

```bash
npm test
npm run build
npm run preview
```

API：`GET /api/health`，`POST /api/recognize`（`worksheetId`, `image` data URL），`POST /api/grade`（`worksheetId`, `answers`）。自动测试注入模型输出，不调用收费模型；真实模型效果需要配置后用已人工批改样例校验。
