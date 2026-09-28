export type AI = (messages: unknown[]) => Promise<unknown>;
export function createAI(): AI | undefined {
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!key || !model) return undefined;
  const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  return async messages => {
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0, max_tokens: 4000, response_format: { type: 'json_object' } }), signal: AbortSignal.timeout(55000),
    });
    if (!response.ok) throw new Error('AI upstream failed');
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('AI response missing');
    return JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
  };
}
