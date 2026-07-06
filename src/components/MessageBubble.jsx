import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { familyOf } from '../lib/api';

const FAMILY_DOT = {
  claude: 'bg-channel-claude',
  auto: 'bg-channel-auto',
  grok: 'bg-channel-grok',
  codex: 'bg-channel-codex',
  other: 'bg-channel-other',
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2.5`}>
      <div
        className={
          isUser
            ? 'bubble-user max-w-[85%] sm:max-w-[70%] rounded-card px-4 py-3 bg-clay/15 border border-clay/30'
            : 'max-w-[85%] sm:max-w-[85%] w-full'
        }
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${FAMILY_DOT[family]}`} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/35">
              {model || 'assistant'}
            </span>
          </div>
        )}
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
