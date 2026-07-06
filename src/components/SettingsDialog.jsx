import { useState } from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { familyOf } from '../lib/api';
import { MODEL_GROUPS, ALL_MODEL_VALUES } from '../lib/models';

const FAMILY_DOT = {
  claude: 'bg-channel-claude',
  auto: 'bg-channel-auto',
  grok: 'bg-channel-grok',
  codex: 'bg-channel-codex',
  other: 'bg-channel-other',
};

const CUSTOM_VALUE = '__custom__';

export default function SettingsDialog({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);
  const [customMode, setCustomMode] = useState(!ALL_MODEL_VALUES.includes(settings.model));

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleModelSelect = (e) => {
    const value = e.target.value;
    if (value === CUSTOM_VALUE) {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    setDraft({ ...draft, model: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="settings-dialog w-full sm:max-w-md bg-ink-surface border border-ink-line rounded-t-card sm:rounded-card p-5 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">Cài đặt</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/45 mb-1.5">
              API key (nghimmo.com)
            </label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-clay text-sm font-mono"
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
            <select
              value={customMode ? CUSTOM_VALUE : draft.model}
              onChange={handleModelSelect}
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-clay text-sm"
            >
              {MODEL_GROUPS.map((group) => (
                <optgroup label={group.label} key={group.label}>
                  {group.models.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={CUSTOM_VALUE}>Khác… (nhập tên model)</option>
            </select>

            {customMode ? (
              <input
                type="text"
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder="vd: grok-4.3, gpt-5.5…"
                className="w-full mt-2 px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-clay text-sm font-mono"
              />
            ) : (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-white/45">
                <span className={`h-1.5 w-1.5 rounded-full ${FAMILY_DOT[familyOf(draft.model)]}`} />
                {draft.model}
              </div>
            )}
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
              className="w-full px-3 py-2 rounded-lg bg-ink border border-ink-line outline-none focus:border-clay text-sm resize-none"
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
                    ? 'border-clay bg-clay/10 text-clay'
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
                    ? 'border-clay bg-clay/10 text-clay'
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
          className="w-full mt-6 py-2.5 rounded-lg bg-clay text-white font-semibold text-sm hover:bg-clay-dark transition-colors"
        >
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
