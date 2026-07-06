import { Plus, Settings, Trash2, X } from 'lucide-react';
import { familyOf } from '../lib/api';

const FAMILY_DOT = {
  claude: 'bg-channel-claude',
  auto: 'bg-channel-auto',
  grok: 'bg-channel-grok',
  codex: 'bg-channel-codex',
  other: 'bg-channel-other',
};

function groupLabel(ts) {
  const now = new Date();
  const d = new Date(ts);
  const startOf = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays <= 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays <= 7) return '7 ngày qua';
  if (diffDays <= 30) return '30 ngày qua';
  return 'Cũ hơn';
}

export default function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings,
  onClose,
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = {};
  for (const c of sorted) {
    const label = groupLabel(c.updatedAt);
    groups[label] = groups[label] || [];
    groups[label].push(c);
  }

  return (
    <div className="flex flex-col h-full bg-ink-surface border-r border-ink-line w-72 shrink-0">
      <div className="flex items-center gap-2 p-3 border-b border-ink-line">
        <button
          onClick={onNew}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-card border border-ink-line text-white/85 font-display font-semibold text-sm hover:border-clay/50 hover:text-clay transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Trò chuyện mới
        </button>
        {onClose && (
          <button onClick={onClose} className="sm:hidden p-2 text-white/60" aria-label="Đóng">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(groups).map(([label, items]) => (
          <div key={label} className="mb-3">
            <p className="px-4 py-1 text-[11px] uppercase tracking-wider text-white/35 font-mono">
              {label}
            </p>
            {items.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  c.id === currentId ? 'bg-white/8' : 'hover:bg-white/5'
                }`}
                onClick={() => onSelect(c.id)}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${FAMILY_DOT[familyOf(c.model)]}`} />
                <span className="flex-1 truncate text-sm text-white/85">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-opacity"
                  aria-label={`Xóa "${c.title}"`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="px-4 py-6 text-sm text-white/35 text-center">
            Chưa có cuộc trò chuyện nào. Bấm "Trò chuyện mới" để bắt đầu.
          </p>
        )}
      </div>

      <div className="p-3 border-t border-ink-line">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-card text-sm text-white/70 hover:bg-white/5 transition-colors"
        >
          <Settings size={16} />
          Cài đặt
        </button>
      </div>
    </div>
  );
}
