import { createApp } from './app.js';
import { createAI } from './ai.js';
const port = Number(process.env.PORT || 3001);
const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim()).filter(Boolean);
createApp({ ai: createAI(), allowedOrigins: origins }).listen(port, () => console.log(`批改 API 已启动：http://localhost:${port}`));
