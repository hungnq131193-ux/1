import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import Composer from './components/Composer.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';
import { streamChat, buildContent } from './lib/api.js';
import {
  loadConversations,
  saveConversations,
  loadSettings,
  saveSettings,
  newConversation,
  titleFromFirstMessage,
} from './lib/storage.js';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [conversations, setConversations] = useState(loadConversations);
  const [currentId, setCurrentId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light');
  }, [settings.theme]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversations.length > 0 && !currentId) {
      setCurrentId([...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
    }
  }, [conversations, currentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentId, conversations]);

  const current = conversations.find((c) => c.id === currentId);

  const updateConversation = (id, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  };

  const handleNew = () => {
    const conv = newConversation(settings.model);
    setConversations((prev) => [...prev, conv]);
    setCurrentId(conv.id);
    setSidebarOpen(false);
  };

  const handleDelete = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentId === id) setCurrentId(null);
  };

  const handleSend = async ({ text, attachments }) => {
    setErrorMsg('');
    let conv = current;
    if (!conv) {
      conv = newConversation(settings.model);
      setConversations((prev) => [...prev, conv]);
      setCurrentId(conv.id);
    }

    const userMessage = {
      role: 'user',
      content: buildContent({ text, attachments }),
      attachments,
      ts: Date.now(),
    };

    const isFirstMessage = conv.messages.length === 0;
    const historyForApi = [...conv.messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    updateConversation(conv.id, (c) => ({
      ...c,
      title: isFirstMessage ? titleFromFirstMessage(text) : c.title,
      messages: [...c.messages, userMessage, { role: 'assistant', content: '', ts: Date.now() }],
      updatedAt: Date.now(),
    }));

    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantText = '';
    let lastFlush = 0;
    const flush = () => {
      updateConversation(conv.id, (c) => {
        const msgs = [...c.messages];
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: assistantText };
        return { ...c, messages: msgs, updatedAt: Date.now() };
      });
    };

    try {
      // Ghi state/localStorage tối đa ~16 lần/giây thay vì mỗi token — tránh giật lag
      // khi model trả lời nhanh (re-render + serialize cả hội thoại mỗi lần rất tốn).
      for await (const chunk of streamChat({
        messages: historyForApi,
        model: conv.model || settings.model,
        system: settings.systemPrompt || undefined,
        apiKey: settings.apiKey,
        signal: controller.signal,
      })) {
        if (chunk.type === 'text') {
          assistantText += chunk.text;
          const now = performance.now();
          if (now - lastFlush > 60) {
            lastFlush = now;
            flush();
          }
        }
      }
      flush();
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Đã có lỗi xảy ra khi gọi API.');
        updateConversation(conv.id, (c) => {
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: assistantText || `⚠️ ${err.message || 'Lỗi không xác định'}`,
          };
          return { ...c, messages: msgs };
        });
      } else {
        flush();
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar — cố định trên desktop, trượt ra trên mobile */}
      <div className={`fixed sm:static inset-y-0 left-0 z-40 transition-transform sm:transition-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}>
        <Sidebar
          conversations={conversations}
          currentId={currentId}
          onSelect={(id) => {
            setCurrentId(id);
            setSidebarOpen(false);
          }}
          onNew={handleNew}
          onDelete={handleDelete}
          onOpenSettings={() => setShowSettings(true)}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-ink-line">
          <button
            className="sm:hidden p-1.5 text-white/70"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở danh sách hội thoại"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-sm truncate">
              {current?.title || 'NghiChat'}
            </h1>
            <p className="text-[11px] font-mono text-white/40 truncate">
              {current?.model || settings.model}
            </p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
          {(!current || current.messages.length === 0) && (
            <div className="h-full flex items-center justify-center text-center px-6">
              <p className="text-white/35 text-sm max-w-xs">
                Bắt đầu một cuộc trò chuyện mới. Tin nhắn của bạn được lưu ngay trên thiết bị này.
              </p>
            </div>
          )}
          {current?.messages.map((m, i) => (
            <MessageBubble key={i} message={m} model={current.model} />
          ))}
        </div>

        {errorMsg && (
          <p className="px-4 py-2 text-xs text-red-400 bg-red-500/5 border-t border-red-500/20">
            {errorMsg}
          </p>
        )}

        <Composer onSend={handleSend} isStreaming={isStreaming} onStop={handleStop} />
      </div>

      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
