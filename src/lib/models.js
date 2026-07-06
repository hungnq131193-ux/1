// Danh sách model thật mà api.nghimmo.com hỗ trợ cho tài khoản này.
// Cập nhật ở đây khi nhà cung cấp thêm/bớt model — đây là nguồn chân lý duy nhất
// cho model, dùng chung bởi SettingsDialog (dropdown) và App (hiển thị label).

export const MODEL_GROUPS = [
  {
    label: 'Auto',
    models: [
      { value: 'nghi/auto', label: 'Auto — tự chọn model phù hợp' },
    ],
  },
  {
    label: 'Opus',
    models: [
      { value: 'nghi/claude-opus-4.8', label: 'Claude Opus 4.8' },
      { value: 'nghi/claude-opus-4.8-thinking', label: 'Claude Opus 4.8 (thinking)' },
      { value: 'nghi/claude-opus-4.7', label: 'Claude Opus 4.7' },
      { value: 'nghi/claude-opus-4.7-thinking', label: 'Claude Opus 4.7 (thinking)' },
      { value: 'nghi/claude-opus-4.6', label: 'Claude Opus 4.6' },
      { value: 'nghi/claude-opus-4.6-thinking', label: 'Claude Opus 4.6 (thinking)' },
      { value: 'nghi/claude-opus-4.5', label: 'Claude Opus 4.5' },
      { value: 'nghi/claude-opus-4.5-thinking', label: 'Claude Opus 4.5 (thinking)' },
    ],
  },
  {
    label: 'Sonnet',
    models: [
      { value: 'nghi/claude-sonnet-4.6', label: 'Claude Sonnet 4.6' },
      { value: 'nghi/claude-sonnet-4.6-thinking', label: 'Claude Sonnet 4.6 (thinking)' },
      { value: 'nghi/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
      { value: 'nghi/claude-sonnet-4.5-thinking', label: 'Claude Sonnet 4.5 (thinking)' },
      { value: 'nghi/claude-sonnet-4', label: 'Claude Sonnet 4' },
      { value: 'nghi/claude-sonnet-4-thinking', label: 'Claude Sonnet 4 (thinking)' },
    ],
  },
  {
    label: 'Haiku',
    models: [
      { value: 'nghi/claude-haiku-4.5', label: 'Claude Haiku 4.5' },
      { value: 'nghi/claude-haiku-4.5-thinking', label: 'Claude Haiku 4.5 (thinking)' },
    ],
  },
];

export const ALL_MODEL_VALUES = MODEL_GROUPS.flatMap((g) => g.models.map((m) => m.value));

export function modelLabel(value) {
  for (const group of MODEL_GROUPS) {
    const found = group.models.find((m) => m.value === value);
    if (found) return found.label;
  }
  return value;
}
