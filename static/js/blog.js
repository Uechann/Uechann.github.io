/* ═══════════════════════════════════════════════════════════
   blog.js — 다크모드, 사이드바 트리, TOC, 모바일
   ═══════════════════════════════════════════════════════════ */

/* ── 1. Dark Mode ────────────────────────────────────────── */
(function () {
  const stored = localStorage.getItem('blog-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
  });
}

/* ── 2. Sidebar Category Tree Toggle ─────────────────────── */
function initCatTree() {
  const stored = JSON.parse(localStorage.getItem('cat-tree-state') || '{}');

  document.querySelectorAll('.cat-group').forEach(group => {
    const key = group.dataset.key;
    const btn = group.querySelector(':scope > .cat-group-btn');
    const children = group.querySelector(':scope > .cat-children');
    if (!btn || !children) return;

    // Restore state (default: open)
    const isOpen = stored[key] !== false;
    group.classList.toggle('open', isOpen);
    if (!isOpen) children.hidden = true;

    btn.addEventListener('click', () => {
      const nowOpen = !group.classList.contains('open');
      group.classList.toggle('open', nowOpen);
      children.hidden = !nowOpen;
      const state = JSON.parse(localStorage.getItem('cat-tree-state') || '{}');
      state[key] = nowOpen;
      localStorage.setItem('cat-tree-state', JSON.stringify(state));
    });
  });

  // Subgroup nodes (deeper nesting)
  document.querySelectorAll('.cat-subgroup').forEach(group => {
    const key = group.dataset.key;
    const btn = group.querySelector(':scope > .cat-subgroup-btn');
    const children = group.querySelector(':scope > .cat-children');
    if (!btn || !children) return;

    const isOpen = stored[key] !== false;
    group.classList.toggle('open', isOpen);
    if (!isOpen) children.hidden = true;

    btn.addEventListener('click', () => {
      const nowOpen = !group.classList.contains('open');
      group.classList.toggle('open', nowOpen);
      children.hidden = !nowOpen;
      const state = JSON.parse(localStorage.getItem('cat-tree-state') || '{}');
      state[key] = nowOpen;
      localStorage.setItem('cat-tree-state', JSON.stringify(state));
    });
  });

  // Mark active link by current URL
  const path = location.pathname;
  document.querySelectorAll('.cat-leaf a').forEach(a => {
    if (path.startsWith(a.getAttribute('href'))) a.classList.add('active');
  });
}

/* ── 3. TOC Scroll Tracking ──────────────────────────────── */
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (!tocLinks.length) return;

  const headings = Array.from(document.querySelectorAll('.post-content h2, .post-content h3, .post-content h4'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.toc-link[href="#${CSS.escape(id)}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
  );

  headings.forEach(h => { if (h.id) observer.observe(h); });
}

/* ── 4. Mobile Sidebar ───────────────────────────────────── */
function initMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const ham = document.getElementById('hamburger');
  if (!sidebar || !overlay) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    if (ham) ham.classList.add('open');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    if (ham) ham.classList.remove('open');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
}

/* ── 5. Copy Code Button ─────────────────────────────────── */
function initCopyCode() {
  document.querySelectorAll('.post-content pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '복사';
    btn.style.cssText = `
      position:absolute;top:10px;right:10px;
      background:rgba(255,255,255,.12);color:#e2e8f0;
      border:none;border-radius:5px;padding:3px 10px;
      font-size:11.5px;cursor:pointer;font-family:inherit;
      transition:background .15s;
    `;
    btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,255,255,.22)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(255,255,255,.12)');
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.innerText).then(() => {
        btn.textContent = '복사됨!';
        setTimeout(() => btn.textContent = '복사', 1500);
      });
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

/* ── 6. Heading Anchors ──────────────────────────────────── */
function initHeadingAnchors() {
  document.querySelectorAll('.post-content h2, .post-content h3, .post-content h4').forEach(h => {
    if (!h.id) return;
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.className = 'heading-anchor';
    a.textContent = '#';
    a.style.cssText = 'margin-left:8px;opacity:0;color:var(--accent);text-decoration:none;font-size:.8em;';
    h.appendChild(a);
    h.addEventListener('mouseenter', () => a.style.opacity = '1');
    h.addEventListener('mouseleave', () => a.style.opacity = '0');
  });
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCatTree();
  initTOC();
  initMobileSidebar();
  initCopyCode();
  initHeadingAnchors();
});
