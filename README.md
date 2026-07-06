# NghiChat

Ứng dụng chat AI cá nhân (React + Vite), cài được lên điện thoại như một app thật (PWA),
lưu nhiều cuộc hội thoại, hỗ trợ streaming, đính kèm ảnh/file, và dark/light mode.

Gọi qua API của **api.nghimmo.com** (dịch vụ trung gian, không phải API chính thức của
Anthropic) — xem lưu ý quan trọng ở cuối file này.

## Cấu trúc

```
nghichat/
├── api/chat.js          # Vercel Edge Function — proxy sang api.nghimmo.com, giữ key an toàn
├── src/
│   ├── App.jsx          # State chính: hội thoại, streaming, layout
│   ├── components/      # Sidebar, Composer, MessageBubble, SettingsDialog
│   └── lib/              # api.js (gọi & parse stream), storage.js (lưu vào localStorage)
├── public/icons/         # Icon PWA (SVG placeholder — nên thay bằng icon riêng của bạn)
└── vercel.json           # Rewrite để SPA không bị 404 khi refresh
```

## Chạy thử ở máy local

```bash
npm install
cp .env.example .env
# Mở .env, dán API key thật vào NGHI_API_KEY
npm run dev
```

> Lưu ý: khi chạy `vite dev` bình thường, thư mục `api/` (Edge Function) **không** tự chạy —
> đó là tính năng riêng của môi trường Vercel. Để test cả phần proxy, dùng `vercel dev`
> (cài `npm i -g vercel` rồi chạy `vercel dev`) thay vì `npm run dev`.

## Deploy lên Vercel

1. Đẩy thư mục này lên một repo GitHub (hoặc dùng `vercel` CLI để deploy thẳng từ máy).
2. Import repo vào Vercel (New Project → chọn repo).
3. Trong **Settings → Environment Variables**, thêm:
   - `NGHI_API_KEY` = API key thật của bạn từ nghimmo.com
   - `NGHI_BASE_URL` = `https://api.nghimmo.com` (đã có sẵn giá trị mặc định này trong code,
     chỉ cần set nếu họ đổi domain)
4. Deploy. Vercel tự nhận `api/chat.js` là một Edge Function.
5. Mở app trên điện thoại → menu trình duyệt → **"Thêm vào màn hình chính"** để cài như app thật.

Bạn cũng có thể bỏ qua bước set biến môi trường và thay vào đó dán API key trực tiếp trong
**Cài đặt** của app (icon bánh răng ở sidebar) — key đó chỉ lưu trong trình duyệt của bạn.

## Icon PWA

`public/icons/icon.svg` chỉ là icon tạm (3 chấm màu tượng trưng cho 3 "họ" model:
Claude/Grok/Codex). Bạn nên thay bằng icon PNG 192×192 và 512×512 của riêng bạn và cập nhật
`vite.config.js` (phần `manifest.icons`) cho khớp.

## Cách hoạt động của phần gọi API

`src/lib/api.js` gửi request tới `/api/chat` (route nội bộ của chính app, không gọi thẳng
`api.nghimmo.com` từ trình duyệt) để:
- tránh lỗi CORS nếu nghimmo.com không bật CORS cho gọi trực tiếp từ browser,
- không lộ API key ra phía client.

`api/chat.js` forward request đó sang `https://api.nghimmo.com/v1/messages` với:
- header `Authorization: Bearer <API key>` (khớp với biến `ANTHROPIC_AUTH_TOKEN` trong hướng
  dẫn của họ),
- body theo đúng format Anthropic Messages API (`model`, `messages`, `max_tokens`, `stream`).

Nếu bạn thấy lỗi 401/403 khi chat, khả năng cao là cách xác thực thực tế của nghimmo.com khác
với những gì trong tài liệu hướng dẫn (ví dụ họ dùng header `x-api-key` thay vì
`Authorization: Bearer`) — sửa lại phần header trong `api/chat.js` cho khớp.

## ⚠️ Lưu ý quan trọng

`api.nghimmo.com` **không phải** domain chính thức của Anthropic. Đây là một dịch vụ trung
gian (reseller) tự nhận bán quyền truy cập vào Claude, Grok (xAI) và Codex (OpenAI) qua cùng
một "key". Trước khi dùng cho công việc thật hoặc dữ liệu nhạy cảm, bạn nên tự cân nhắc:

- Độ tin cậy và uy tín của bên vận hành dịch vụ này.
- Dữ liệu bạn gửi (kể cả ảnh/file đính kèm) sẽ đi qua máy chủ của họ.
- Rủi ro tài chính nếu key/dịch vụ ngừng hoạt động đột ngột.

Nếu muốn an toàn hơn, bạn có thể đổi `NGHI_BASE_URL` thành `https://api.anthropic.com` và
dùng API key thật từ [console.anthropic.com](https://console.anthropic.com) — phần còn lại
của code (UI, streaming, lưu hội thoại) không cần thay đổi gì thêm.
