export const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBase}/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(65000) });
  let value;
  try { value = await response.json(); } catch { throw new Error('未连接批改服务，请启动后端或配置 VITE_API_BASE_URL。'); }
  if (!response.ok) throw new Error(value.error || '批改服务暂不可用，请稍后重试。');
  return value;
}
