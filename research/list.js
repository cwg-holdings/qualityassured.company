(() => {
  const mount = document.getElementById("posts");
  if (!mount) return;

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

  const escapeHtml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderError = () => {
    mount.innerHTML =
      '<p class="tagline">Research posts could not be loaded. Please refresh or email <a class="email" href="mailto:hello@qualityassured.company">hello@qualityassured.company</a>.</p>';
  };

  fetch("/research/posts.json", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load posts.json");
      return res.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts) || posts.length === 0) {
        mount.innerHTML = '<p class="tagline">No research posts yet.</p>';
        return;
      }

      const sorted = [...posts].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

      mount.innerHTML = "";
      for (const post of sorted) {
        const slug = String(post.slug || "").trim();
        const title = String(post.title || "").trim();
        if (!slug || !title) continue;

        const href = `/research/${encodeURIComponent(slug)}/`;
        const date = fmtDate(String(post.date || ""));
        const author = String(post.author || "").trim();
        const description = String(post.description || "").trim();

        const article = document.createElement("article");
        article.className = "post-card";

        const h2 = document.createElement("h2");
        h2.innerHTML = `<a href="${href}">${escapeHtml(title)}</a>`;

        const meta = document.createElement("p");
        meta.className = "post-meta";
        meta.textContent = [date, author].filter(Boolean).join(" · ");

        const desc = document.createElement("p");
        desc.className = "post-desc";
        desc.textContent = description;

        article.appendChild(h2);
        if (date || author) article.appendChild(meta);
        if (description) article.appendChild(desc);
        mount.appendChild(article);
      }

      if (!mount.firstChild) renderError();
    })
    .catch(renderError);
})();
