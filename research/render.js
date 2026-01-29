(() => {
  const root = document.documentElement;
  const slug = String(root.dataset.post || "").trim();

  const titleEl = document.getElementById("research-title");
  const metaEl = document.getElementById("research-meta");
  const contentEl = document.querySelector("[data-md]");

  if (!contentEl || !titleEl) return;

  const mdUrl = String(contentEl.getAttribute("data-md") || "").trim();
  if (!mdUrl) return;

  const escapeHtml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const linkifyText = (html) => {
    const parts = html.split(/(<[^>]+>)/g);
    return parts
      .map((part, idx) => {
        if (idx % 2 === 1) return part;
        return part.replaceAll(/https:\/\/[^\s<)]+/g, (url) => {
          const safe = escapeHtml(url);
          return `<a href="${safe}" target="_blank" rel="noreferrer">${safe}</a>`;
        });
      })
      .join("");
  };

  const linkCitations = (html) =>
    html.replaceAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_m, raw) => {
      const numbers = raw
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (numbers.length === 0) return _m;
      if (numbers.length === 1) {
        const n = numbers[0];
        return `<a class="citation" href="#ref-${n}">[${n}]</a>`;
      }

      return numbers
        .map((n, idx) => {
          const label = idx === 0 ? `[${n}` : idx === numbers.length - 1 ? `${n}]` : n;
          return `<a class="citation" href="#ref-${n}">${label}</a>`;
        })
        .join(", ");
    });

  const renderMarkdown = (md) => {
    const normalized = md.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
    const lines = normalized.split("\n");

    let cursor = 0;
    let title = null;
    if (lines[cursor]?.startsWith("# ")) {
      title = lines[cursor].slice(2).trim();
      cursor += 1;
    }

    const blocks = [];
    let buffer = [];
    let inReferences = false;

    const flush = () => {
      if (buffer.length === 0) return;
      const text = buffer.join(" ").trim();
      const match = inReferences ? text.match(/^\[(\d+)\]\s+(.+)$/) : null;
      if (match) {
        blocks.push({ type: "ref", num: match[1], text: match[2] });
      } else {
        blocks.push({ type: "p", text });
      }
      buffer = [];
    };

    for (; cursor < lines.length; cursor += 1) {
      const raw = lines[cursor] ?? "";
      const line = raw.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flush();
        continue;
      }

      if (trimmed.startsWith("## ")) {
        flush();
        const heading = trimmed.slice(3).trim();
        blocks.push({ type: "h2", text: heading });
        if (heading.toLowerCase() === "references") inReferences = true;
        continue;
      }

      if (trimmed.startsWith("### ")) {
        flush();
        blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
        continue;
      }

      buffer.push(trimmed);
    }

    flush();

    const renderInline = (text) => {
      const codeTokens = [];
      const tokenized = String(text).replaceAll(/`([^`]+)`/g, (_m, code) => {
        codeTokens.push(String(code));
        return `\u0000CODE${codeTokens.length - 1}\u0000`;
      });

      let html = escapeHtml(tokenized);

      html = html.replaceAll(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (_m, label, url) => {
        return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
      });

      html = linkCitations(linkifyText(html));

      html = html.replaceAll(/\u0000CODE(\d+)\u0000/g, (_m, rawIdx) => {
        const idx = Number(rawIdx);
        const code = codeTokens[idx] ?? "";
        return `<code>${escapeHtml(code)}</code>`;
      });

      return html;
    };

    const html = blocks
      .map((b) => {
        if (b.type === "h2") return `<h2>${renderInline(b.text)}</h2>`;
        if (b.type === "h3") return `<h3>${renderInline(b.text)}</h3>`;
        if (b.type === "ref") {
          const num = escapeHtml(String(b.num));
          return `<p class="ref" id="ref-${num}"><a class="ref-anchor" href="#ref-${num}">[${num}]</a> ${renderInline(
            b.text,
          )}</p>`;
        }
        return `<p>${renderInline(b.text)}</p>`;
      })
      .join("");

    return { title, html };
  };

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const dtf = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
      return dtf.format(new Date(`${iso}T00:00:00Z`));
    } catch {
      return iso;
    }
  };

  const renderFailure = () => {
    titleEl.textContent = "Unable to load research note";
    contentEl.innerHTML =
      '<p class="tagline">This page could not be rendered. Please refresh, or email <a class="email" href="mailto:hello@qualityassured.company">hello@qualityassured.company</a>.</p>';
    if (metaEl && !metaEl.textContent) metaEl.textContent = "";
  };

  const loadMeta = () => {
    if (!slug || !metaEl) return Promise.resolve(null);
    return fetch("/research/posts.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((posts) => (Array.isArray(posts) ? posts.find((p) => p?.slug === slug) : null))
      .catch(() => null);
  };

  Promise.all([
    fetch(mdUrl, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error("Failed to load markdown");
      return res.text();
    }),
    loadMeta(),
  ])
    .then(([md, meta]) => {
      const rendered = renderMarkdown(md);
      const title = rendered.title || (meta?.title ? String(meta.title) : "Research note");

      titleEl.textContent = title;
      contentEl.innerHTML = rendered.html;

      const suffix = "Research | QAC";
      document.title = `${title} | ${suffix}`;

      if (metaEl) {
        const date = fmtDate(String(meta?.date || ""));
        const author = meta?.author ? String(meta.author) : "";
        if (date || author) metaEl.textContent = [date, author].filter(Boolean).join(" · ");
      }
    })
    .catch(renderFailure);
})();
