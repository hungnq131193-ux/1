import { useState } from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { familyOf } from '../lib/api';

const QUICK_MODELS = [
  { label: 'Claude Sonnet', value: 'nghi/claude-sonnet-4.6' },
  { label: 'Claude Haiku', value: 'nghi/claude-haiku-4.5' },
  { label: 'Grok 4.3', value: 'grok-4.3' },
  { label: 'GPT-5.5', value: 'gpt-5.5' },
];

const FAMILY_DOT = {
  claude: 'bg-channel-claude',
  grok: 'bg-channel-grok',
  codex: 'bg-channel-codex',
  other: 'bg-channel-other',
};

export default function SettingsDialog({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-ink-surface border border-ink-line rounded-t-card sm:rounded-card p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Cài đặt</h2>
          <button onClick={onClose} className="p-1 text-white/50 hover:text-white" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/45 mb-1.5">
              API key (nghimmo.com)
            </label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-brass text-sm font-mono"
            />
            <p className="text-xs text-white/35 mt-1.5">
              Chỉ lưu trong trình duyệt của bạn (localStorage), không gửi đi đâu khác ngoài
              proxy /api/chat của chính app này. Để trống nếu bạn đã đặt sẵn key trong biến môi
              trường NGHI_API_KEY trên Vercel.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/45 mb-1.5">
              Model
            </label>
            <input
              type="text"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-brass text-sm font-mono mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setDraft({ ...draft, model: m.value })}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                    draft.model === m.value
                      ? 'border-brass bg-brass/10 text-brass'
                      : 'border-ink-line text-white/60 hover:border-white/30'
                  }`}
                  type="button"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${FAMILY_DOT[familyOf(m.value)]}`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/45 mb-1.5">
              System prompt (tùy chọn)
            </label>
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
              rows={3}
              placeholder="Ví dụ: Trả lời ngắn gọn, bằng tiếng Việt…"
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-brass text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/45 mb-1.5">
              Giao diện
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft({ ...draft, theme: 'dark' })}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  draft.theme === 'dark'
                    ? 'border-brass bg-brass/10 text-brass'
                    : 'border-ink-line text-white/60'
                }`}
                type="button"
              >
                <Moon size={15} /> Tối
              </button>
              <button
                onClick={() => setDraft({ ...draft, theme: 'light' })}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  draft.theme === 'light'
                    ? 'border-brass bg-brass/10 text-brass'
                    : 'border-ink-line text-white/60'
                }`}
                type="button"
              >
                <Sun size={15} /> Sáng
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-5 py-2.5 rounded-lg bg-brass text-ink font-semibold text-sm hover:bg-brass-dark transition-colors"
        >
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
