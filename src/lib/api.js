// Gọi tới /api/chat (proxy nội bộ) — proxy này sẽ forward sang api.nghimmo.com
// và trả về stream định dạng SSE giống chuẩn Anthropic Messages API.

export function familyOf(model = '') {
  const m = model.toLowerCase();
  if (m.includes('claude')) return 'claude';
  if (m.includes('grok')) return 'grok';
  if (m.includes('gpt') || m.includes('codex')) return 'codex';
  return 'other';
}

export function buildContent({ text, attachments }) {
  const content = [];
  for (const att of attachments || []) {
    if (att.mediaType?.startsWith('image/')) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: att.mediaType, data: att.base64 },
      });
    } else if (att.mediaType === 'application/pdf') {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: att.mediaType, data: att.base64 },
      });
    } else if (att.text) {
      content.push({ type: 'text', text: `[Tệp đính kèm: ${att.name}]\n\n${att.text}` });
    }
  }
  if (text?.trim()) {
    content.push({ type: 'text', text });
  }
  return content;
}

/**
 * Gửi hội thoại và trả về async generator phát ra từng phần văn bản khi model
 * đang "gõ". Dùng: for await (const chunk of streamChat(...)) { ... }
 */
export async function* streamChat({ messages, model, system, apiKey, signal }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-user-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      ...(system ? { system } : {}),
      messages,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson.error || errJson.detail || JSON.stringify(errJson);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(detail || `Lỗi ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      let evt;
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }

      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        yield { type: 'text', text: evt.delta.text };
      } else if (evt.type === 'message_delta' && evt.delta?.stop_reason) {
        yield { type: 'stop', reason: evt.delta.stop_reason };
      } else if (evt.type === 'error') {
        throw new Error(evt.error?.message || 'Lỗi từ stream');
      }
    }
  }
}
