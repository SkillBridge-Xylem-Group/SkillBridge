import type { ReactNode } from "react";

const YOUTUBE_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,20})\S*$/i;
const VIMEO_RE = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d{6,12})\S*$/i;

function videoEmbedUrl(line: string): string | null {
  const yt = line.match(YOUTUBE_RE);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = line.match(VIMEO_RE);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function safeHref(url: string): string | null {
  const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withProto);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href;
  } catch {
    /* not a valid URL — render as plain text */
  }
  return null;
}

const INLINE_RE =
  /(\*\*(.+?)\*\*|\*([^*]+?)\*|~~(.+?)~~|`([^`]+?)`|\[([^\]]+)\]\(([^)\s]+)\)|https?:\/\/[^\s<>")]+)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const match of text.matchAll(INLINE_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));

    const [full, , bold, italic, strike, code, linkLabel, linkUrl] = match;
    const key = `${keyPrefix}-${i++}`;

    if (bold !== undefined) {
      nodes.push(<strong key={key}>{bold}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{italic}</em>);
    } else if (strike !== undefined) {
      nodes.push(<s key={key}>{strike}</s>);
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded px-1 py-0.5 font-mono text-[0.85em]"
          style={{ background: "#eef7f0", color: "var(--sb-ink)" }}
        >
          {code}
        </code>
      );
    } else if (linkLabel !== undefined && linkUrl !== undefined) {
      const href = safeHref(linkUrl);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline"
            style={{ color: "var(--sb-teal-dark)" }}
          >
            {linkLabel}
          </a>
        ) : (
          full
        )
      );
    } else {
      const href = safeHref(full);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-bold hover:underline"
            style={{ color: "var(--sb-teal-dark)" }}
          >
            {full}
          </a>
        ) : (
          full
        )
      );
    }
    last = idx + full.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function FormattedContent({ text, className }: { text: string; className?: string }) {
  const lines = text.split(/\r?\n/);

  return (
    <div className={className}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const embed = trimmed ? videoEmbedUrl(trimmed) : null;

        if (embed) {
          return (
            <div key={idx} className="my-2 overflow-hidden rounded-lg bg-black" >
              <iframe
                src={embed}
                title="Embedded video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          );
        }

        if (!trimmed) return <div key={idx} className="h-2" aria-hidden />;

        return <p key={idx}>{renderInline(line, `l${idx}`)}</p>;
      })}
    </div>
  );
}
