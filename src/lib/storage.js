const CONV_KEY = 'nghichat:conversations';
const SETTINGS_KEY = 'nghichat:settings';

export function defaultSettings() {
  return {
    apiKey: '',
    model: 'nghi/claude-sonnet-4.6',
    smallModel: 'nghi/claude-haiku-4.5',
    systemPrompt: '',
    theme: 'dark',
  };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Không lưu được cài đặt:', err);
  }
}

export function loadConversations() {
  try {
    const raw = localStorage.getItem(CONV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(CONV_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Không lưu được hội thoại (có thể do đính kèm quá nặng):', err);
  }
}

export function newConversation(model) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: 'Cuộc trò chuyện mới',
    model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function titleFromFirstMessage(text) {
  const trimmed = (text || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Cuộc trò chuyện mới';
  return trimmed.length > 42 ? trimmed.slice(0, 42) + '…' : trimmed;
}
