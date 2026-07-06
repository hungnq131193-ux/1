import { useRef, useState } from 'react';
import { Paperclip, ArrowUp, Square, X } from 'lucide-react';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Không đọc được file'));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không đọc được file'));
    reader.readAsText(file);
  });
}

const MAX_FILE_MB = 8;

export default function Composer({ onSend, isStreaming, onStop }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  const handleFiles = async (files) => {
    setError('');
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`"${file.name}" vượt quá ${MAX_FILE_MB}MB, bỏ qua.`);
        continue;
      }
      try {
        if (file.type.startsWith('image/')) {
          const base64 = await readFileAsBase64(file);
          setAttachments((prev) => [
            ...prev,
            { name: file.name, mediaType: file.type, base64 },
          ]);
        } else if (file.type === 'application/pdf') {
          const base64 = await readFileAsBase64(file);
          setAttachments((prev) => [
            ...prev,
            { name: file.name, mediaType: file.type, base64 },
          ]);
        } else {
          // Coi các file còn lại (txt, md, csv, code...) là văn bản thuần
          const content = await readFileAsText(file);
          setAttachments((prev) => [...prev, { name: file.name, text: content }]);
        }
      } catch {
        setError(`Không đọc được "${file.name}".`);
      }
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    if (isStreaming) return;
    if (!text.trim() && attachments.length === 0) return;
    onSend({ text: text.trim(), attachments });
    setText('');
    setAttachments([]);
    setError('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-ink-line bg-ink px-3 py-3 sm:px-6">
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-ink-surface border border-ink-line text-white/80"
            >
              {att.mediaType?.startsWith('image/') ? (
                <img
                  src={`data:${att.mediaType};base64,${att.base64}`}
                  className="h-5 w-5 object-cover rounded"
                  alt=""
                />
              ) : (
                '📎'
              )}
              <span className="max-w-[120px] truncate">{att.name}</span>
              <button onClick={() => removeAttachment(i)} aria-label={`Bỏ đính kèm ${att.name}`}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-card border border-ink-line bg-ink-surface px-3 py-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-white/60 hover:text-brass hover:bg-white/5 transition-colors shrink-0"
          aria-label="Đính kèm ảnh hoặc file"
          type="button"
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn gì đó… (Enter để gửi, Shift+Enter xuống dòng)"
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-[0.95rem] placeholder:text-white/35 py-1.5 max-h-[200px]"
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors shrink-0"
            aria-label="Dừng trả lời"
            type="button"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            className="p-2.5 rounded-lg bg-brass text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brass-dark transition-colors shrink-0"
            aria-label="Gửi tin nhắn"
            type="button"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
