// Vercel Edge Function — proxy giữa app và api.nghimmo.com
// Lý do cần proxy thay vì gọi thẳng từ trình duyệt:
//   1. Tránh lỗi CORS (nhiều proxy kiểu này không bật CORS cho gọi trực tiếp từ browser).
//   2. Giữ API key ở phía server (biến môi trường NGHI_API_KEY), không lộ ra client.
// Nếu người dùng nhập key riêng trong Cài đặt của app, key đó sẽ được ưu tiên dùng
// (gửi qua header x-user-api-key) thay cho key mặc định trên server.

export const config = { runtime: 'edge' };

const BASE_URL = (process.env.NGHI_BASE_URL || 'https://api.nghimmo.com').replace(/\/$/, '');

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userKey = req.headers.get('x-user-api-key');
  const apiKey = (userKey && userKey.trim()) || process.env.NGHI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Thiếu API key. Vào phần Cài đặt để nhập key của bạn.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let upstream;
  try {
    upstream = await fetch(`${BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Không kết nối được tới máy chủ nghimmo.com', detail: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Máy chủ trả lỗi (${upstream.status})`, detail }),
      { status: upstream.status || 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
