// Matrix canvas animation + light UI interactions
(() => {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポ0123456789@#$%&*';
  const fontSize = 16;
  const columns = Math.floor(width / fontSize);
  const drops = new Array(columns).fill(0).map(() => Math.random() * height);

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const cols = Math.floor(width / fontSize);
    drops.length = cols;
    for (let i = 0; i < drops.length; i++) {
      if (!drops[i]) drops[i] = Math.random() * height;
    }
  }

  window.addEventListener('resize', resize);

  function draw() {
    // translucent black background to create fade effect (smaller alpha => longer trails)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(102,255,102,0.78)';
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.986) {
        drops[i] = 0;
      }

      // slower, smoother fall for a calmer background
      drops[i] += 0.3 + Math.random() * 0.6;
    }

    requestAnimationFrame(draw);
  }

  // dark background initial clear
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  draw();

  // Small UI interactions: smooth scroll for nav links, and reveal sections
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });

  // Reveal sections when entering viewport
  const sections = Array.from(document.querySelectorAll('.section'));
  const obs = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.style.transition = 'opacity 700ms ease, transform 700ms ease';
        ent.target.style.opacity = '1';
        ent.target.style.transform = 'none';
        obs.unobserve(ent.target);
      }
    }
  }, {threshold: 0.12});

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(8px)';
    obs.observe(s);
  });

})();
