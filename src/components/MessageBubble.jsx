import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Download, FileArchive, FolderArchive } from 'lucide-react';
import { familyOf } from '../lib/api';
import { downloadTextFile, downloadFilesAsZip } from '../lib/zip';

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

const LANG_EXT = {
  javascript: 'js', js: 'js', jsx: 'jsx', typescript: 'ts', ts: 'ts', tsx: 'tsx',
  python: 'py', py: 'py', ruby: 'rb', rb: 'rb', go: 'go', golang: 'go', rust: 'rs', rs: 'rs',
  java: 'java', kotlin: 'kt', kt: 'kt', c: 'c', cpp: 'cpp', 'c++': 'cpp', csharp: 'cs',
  'c#': 'cs', cs: 'cs', php: 'php', bash: 'sh', sh: 'sh', shell: 'sh', zsh: 'sh',
  sql: 'sql', html: 'html', css: 'css', scss: 'scss', less: 'less', json: 'json',
  yaml: 'yaml', yml: 'yaml', markdown: 'md', md: 'md', xml: 'xml', vue: 'vue',
  svelte: 'svelte', dockerfile: 'dockerfile', toml: 'toml', ini: 'ini', diff: 'diff',
  plaintext: 'txt', text: 'txt',
};

function extOf(lang) {
  return LANG_EXT[lang?.toLowerCase()] || 'txt';
}

// Trích các khối code fenced (```lang\n...\n```) trực tiếp từ markdown thô,
// độc lập với cây render của ReactMarkdown, để làm nguồn cho nút "tải tất cả (.zip)".
function extractCodeBlocks(markdown) {
  const blocks = [];
  const re = /```([\w+-]*)[^\n]*\n([\s\S]*?)```/g;
  let match;
  let i = 0;
  while ((match = re.exec(markdown))) {
    const [, lang, code] = match;
    if (!code.trim()) continue;
    i += 1;
    blocks.push({ name: `file-${i}.${extOf(lang)}`, content: code });
  }
  return blocks;
}

function extractText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children != null) return extractText(node.props.children);
  return '';
}

function PreBlock({ children, ...props }) {
  const codeEl = Array.isArray(children) ? children[0] : children;
  const lang = /language-([\w-]+)/.exec(codeEl?.props?.className || '')?.[1] || '';
  const text = extractText(codeEl);

  return (
    <div className="relative group/code">
      <pre {...props}>{children}</pre>
      {text.trim() && (
        <button
          type="button"
          onClick={() => downloadTextFile(`code.${extOf(lang)}`, text)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/30 text-white/50 opacity-0 group-hover/code:opacity-100 hover:text-clay hover:bg-black/50 transition-opacity"
          aria-label="Tải xuống đoạn mã này"
          title="Tải xuống"
        >
          <Download size={14} />
        </button>
      )}
    </div>
  );
}

export default function MessageBubble({ message, model }) {
  const isUser = message.role === 'user';
  const family = familyOf(model);
  const attachments = message.attachments || [];
  const contentText = textOf(message.content);
  const codeBlocks = useMemo(
    () => (isUser ? [] : extractCodeBlocks(contentText)),
    [isUser, contentText]
  );

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
                  className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-ink text-white/70 border border-ink-line"
                >
                  {att.isZip ? <FileArchive size={13} /> : '📎'} {att.name}
                </span>
              )
            )}
          </div>
        )}
        <div className="msg-content text-[0.95rem] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{ pre: PreBlock }}
          >
            {contentText}
          </ReactMarkdown>
        </div>
        {codeBlocks.length >= 2 && (
          <button
            type="button"
            onClick={() => downloadFilesAsZip(codeBlocks, 'nghichat-files')}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md bg-ink-surface border border-ink-line text-white/70 hover:text-clay hover:border-clay/40 transition-colors"
          >
            <FolderArchive size={14} /> Tải tất cả ({codeBlocks.length} tệp) dạng .zip
          </button>
        )}
      </div>
    </div>
  );
}
