# 验证记录（2026-09-28）

- Node 22.23.3；系统默认 Node 10，因此验证使用 `/tmp/opencode/autohomework-tools/node_modules/node/bin/node`。
- `npm test`：8 个测试通过，覆盖规则评分、待复核、AI 输出验证、API 请求验证、来源检查、未配置模型降级及识别接口。
- `npm run build`：TypeScript 检查与 Vite 生产构建通过，产物在 `dist/`。
- Chrome + Playwright：在线答题、刷新恢复、提交、人工评分、错题重练、照片上传预览、手动录入、确认后提交、修改答案撤销确认、空白打印模式、390px 手机宽度无横向溢出、无页面 JavaScript 错误，全部通过。
- 浏览器验证脚本：`/tmp/opencode/autohomework-tools/browser-check.mjs`；截图：`/tmp/opencode/autohomework-desktop.png` 和 `/tmp/opencode/autohomework-mobile.png`。
- 模型测试使用注入的模拟响应，未配置或调用真实收费模型。真实识别准确率、真实主观题评分质量以及 GitHub Pages 公网部署尚未验证。
