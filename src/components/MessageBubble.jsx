import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { familyOf } from '../lib/api';

const FAMILY_BORDER = {
  claude: 'border-l-channel-claude',
  grok: 'border-l-channel-grok',
  codex: 'border-l-channel-codex',
  other: 'border-l-channel-other',
};

function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
  }
  return '';
}

export default function MessageBubble({ message, model }) {
  const isUser = message.role === 'user';
  const family = familyOf(model);
  const attachments = message.attachments || [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-card px-4 py-3 ${
          isUser
            ? 'bubble-user bg-brass/15 border border-brass/30'
            : `bubble-assistant bg-ink-surface border-l-[3px] ${FAMILY_BORDER[family]} border-t border-r border-b border-t-ink-line border-r-ink-line border-b-ink-line`
        }`}
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, i) =>
              att.mediaType?.startsWith('image/') ? (
                <img
                  key={i}
                  src={`data:${att.mediaType};base64,${att.base64}`}
                  alt={att.name}
                  className="h-20 w-20 object-cover rounded-lg border border-ink-line"
                />
              ) : (
                <span
                  key={i}
                  className="text-xs font-mono px-2 py-1 rounded bg-ink text-white/70 border border-ink-line"
                >
                  📎 {att.name}
                </span>
              )
            )}
          </div>
        )}
        <div className="msg-content text-[0.95rem] leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {textOf(message.content)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
