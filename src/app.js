
const services = [
  { id: 'onboarding', title: 'Mở tài khoản & định danh', desc: 'Hướng dẫn khách mới hoàn tất hồ sơ, eKYC và nhận ưu đãi tại quầy.', icon: '👤', color: 'blue', steps: ['Quét CCCD/Hộ chiếu', 'Xác nhận số điện thoại', 'Ký biểu mẫu số', 'Nhận mã ưu đãi chào mừng'], time: '6 phút' },
  { id: 'payments', title: 'Thanh toán & ví điện tử', desc: 'Nạp tiền, thanh toán hóa đơn, QR Pay và kiểm tra lịch sử giao dịch.', icon: '💳', color: 'violet', steps: ['Chọn loại thanh toán', 'Quét mã QR hoặc nhập mã KH', 'Xác nhận OTP', 'Nhận biên lai điện tử'], time: '3 phút' },
  { id: 'support', title: 'Hỗ trợ sản phẩm', desc: 'Tra cứu thông tin, đặt lịch tư vấn và kết nối nhân viên phù hợp.', icon: '🎧', color: 'green', steps: ['Chọn nhu cầu', 'Gợi ý gói dịch vụ', 'Lấy số thứ tự ưu tiên', 'Theo dõi trạng thái xử lý'], time: '4 phút' },
  { id: 'documents', title: 'Biểu mẫu & hồ sơ', desc: 'Điền form trước tại kiosk, giảm thời gian chờ và sai sót giấy tờ.', icon: '📄', color: 'orange', steps: ['Chọn biểu mẫu', 'Nhập thông tin bắt buộc', 'Kiểm tra dữ liệu', 'Gửi nhân viên xác nhận'], time: '5 phút' },
];

const journeys = [
  { title: 'Khách lần đầu đến quầy', detail: 'Bắt đầu bằng định danh, lấy số thứ tự và nhận kịch bản tư vấn cá nhân hóa.', tag: 'Đề xuất', icon: '✨' },
  { title: 'Khách cần xử lý nhanh', detail: 'Ưu tiên các tác vụ QR, thanh toán, tra cứu hồ sơ và biên lai điện tử.', tag: 'Nhanh', icon: '⏱️' },
  { title: 'Khách cần tư vấn chuyên sâu', detail: 'Thu thập nhu cầu trước, đặt lịch với chuyên viên và chuẩn bị tài liệu liên quan.', tag: 'Tư vấn', icon: '📅' },
];

let activeId = services[0].id;
let query = '';

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function render() {
  const active = services.find((service) => service.id === activeId) || services[0];
  const filtered = services.filter((service) => `${service.title} ${service.desc}`.toLowerCase().includes(query.toLowerCase()));
  document.getElementById('root').innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">S</div><div><strong>SuperGuide</strong><span>Customer Kiosk</span></div></div>
        <nav>${['🏠', '▣', '🎫', '💬', '🎁', '🛡️'].map((icon, index) => `<button class="nav ${index === 0 ? 'active' : ''}" aria-label="Điều hướng ${index + 1}">${icon}</button>`).join('')}</nav>
        <div class="queue-card"><span>Số đang phục vụ</span><strong>A-028</strong><small>Thời gian chờ dự kiến: 07 phút</small></div>
      </aside>
      <main>
        <header class="hero">
          <div><p class="eyebrow">Trợ lý hướng dẫn khách hàng tại quầy</p><h1>Một màn hình, mọi hành trình dịch vụ.</h1><p>Super app tích hợp định danh, thanh toán, lấy số, biểu mẫu và hỗ trợ nhân viên để khách hàng tự thao tác nhanh hơn.</p></div>
          <div class="hero-panel"><span class="panel-icon">🔔</span><span>Quầy A03 sẵn sàng phục vụ khách eKYC</span></div>
        </header>
        <section class="toolbar">
          <label><span>🔎</span><input id="search" value="${escapeHtml(query)}" placeholder="Tìm dịch vụ, ví dụ: thanh toán, biểu mẫu..." /></label>
          <button class="primary">Bắt đầu hướng dẫn <span>›</span></button>
        </section>
        <section class="grid-layout">
          <div class="service-list"><h2>Dịch vụ mini app</h2>${filtered.map((service) => `<button data-service="${service.id}" class="service-card ${active.id === service.id ? 'selected' : ''}"><span class="icon ${service.color}">${service.icon}</span><span><strong>${service.title}</strong><small>${service.desc}</small></span><span class="chevron">›</span></button>`).join('')}</div>
          <div class="detail-card ${active.color}">
            <div class="detail-head"><span class="big-icon">${active.icon}</span><div><p class="eyebrow">Luồng đang chọn</p><h2>${active.title}</h2><p>${active.desc}</p></div></div>
            <div class="timeline">${active.steps.map((step, index) => `<div class="step"><span>✅</span><span><strong>Bước ${index + 1}</strong>${step}</span></div>`).join('')}</div>
            <div class="meta"><span>⏱️ ${active.time}</span><span>📍 Quầy gần nhất: Tầng 1</span><span>⭐ CSAT 4.9/5</span></div>
          </div>
        </section>
        <section class="journeys"><div><p class="eyebrow">Kịch bản thông minh</p><h2>Gợi ý hành trình theo nhu cầu khách</h2></div><div class="journey-grid">${journeys.map((journey) => `<article><span>${journey.tag}</span><div class="journey-icon">${journey.icon}</div><h3>${journey.title}</h3><p>${journey.detail}</p></article>`).join('')}</div></section>
      </main>
    </div>`;

  document.getElementById('search').addEventListener('input', (event) => { query = event.target.value; render(); });
  document.querySelectorAll('[data-service]').forEach((button) => button.addEventListener('click', () => { activeId = button.dataset.service; render(); }));
}

render();
