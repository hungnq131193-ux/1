import JSZip from 'jszip';

// Giới hạn để tránh gửi quá nhiều dữ liệu lên model hoặc làm đầy localStorage
// khi người dùng đính kèm một file ZIP lớn.
const MAX_ENTRY_TEXT_BYTES = 30 * 1024;
const MAX_TOTAL_TEXT_BYTES = 200 * 1024;
const MAX_ENTRIES_LISTED = 500;
const MAX_TOTAL_DECOMPRESSED_BYTES = 50 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'xml', 'yaml', 'yml',
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'java', 'kt',
  'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'sh', 'bash', 'zsh', 'sql', 'html', 'htm',
  'css', 'scss', 'less', 'vue', 'svelte', 'log', 'ini', 'toml', 'env', 'conf',
]);

function isTextPath(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  return TEXT_EXTENSIONS.has(ext || '');
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Đọc file ZIP và trả về một đoạn văn bản mô tả cấu trúc + nội dung các tệp
 * văn bản bên trong, để đính kèm vào tin nhắn gửi cho model (model không đọc
 * được ZIP nhị phân trực tiếp).
 */
export async function readZipFile(file) {
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files)
    .filter((e) => !e.dir)
    .sort((a, b) => a.name.localeCompare(b.name));

  const listed = entries.slice(0, MAX_ENTRIES_LISTED);
  const lines = [];
  const contentSections = [];
  let totalTextBytes = 0;
  let totalDecompressed = 0;
  let capReached = false;

  for (const entry of listed) {
    if (totalDecompressed > MAX_TOTAL_DECOMPRESSED_BYTES) {
      lines.push(`- ${entry.name} [bỏ qua — tổng dung lượng giải nén vượt giới hạn an toàn]`);
      capReached = true;
      continue;
    }

    const bytes = await entry.async('uint8array');
    totalDecompressed += bytes.length;
    const sizeLabel = formatBytes(bytes.length);

    if (!isTextPath(entry.name)) {
      lines.push(`- ${entry.name} (${sizeLabel}) [nhị phân — không đọc nội dung]`);
      continue;
    }

    if (totalTextBytes >= MAX_TOTAL_TEXT_BYTES) {
      lines.push(`- ${entry.name} (${sizeLabel}) [bỏ qua nội dung — đã đạt giới hạn tổng]`);
      continue;
    }

    let text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    let truncatedNote = '';
    if (text.length > MAX_ENTRY_TEXT_BYTES) {
      text = text.slice(0, MAX_ENTRY_TEXT_BYTES);
      truncatedNote = ' (đã cắt bớt)';
    }
    totalTextBytes += text.length;
    lines.push(`- ${entry.name} (${sizeLabel})`);
    contentSections.push(`=== ${entry.name}${truncatedNote} ===\n${text}`);
  }

  const omitted = entries.length - listed.length;

  let summary = `📦 Tệp ZIP: ${file.name} — ${entries.length} tệp\n\nCấu trúc:\n${lines.join('\n')}`;
  if (omitted > 0) summary += `\n… và ${omitted} tệp khác không được liệt kê.`;
  if (contentSections.length > 0) {
    summary += `\n\n--- Nội dung các tệp văn bản ---\n\n${contentSections.join('\n\n')}`;
  }
  if (capReached) {
    summary += '\n\n(Một số tệp bị bỏ qua do vượt giới hạn dung lượng xử lý.)';
  }

  return summary;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Tải một đoạn văn bản (vd. code do model sinh ra) thành file để lưu về máy. */
export function downloadTextFile(filename, content) {
  triggerDownload(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename);
}

/** Gộp nhiều file văn bản thành một file .zip rồi tải về. */
export async function downloadFilesAsZip(files, zipName) {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.content);
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
}
