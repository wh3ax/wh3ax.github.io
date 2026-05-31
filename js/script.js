// Simple interactions for the link hub
document.addEventListener('DOMContentLoaded', () => {
  const emailLink = document.getElementById('email-link');
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'wh3axx@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          const prev = emailLink.textContent;
          emailLink.textContent = 'Email copied — ' + email;
          setTimeout(() => { emailLink.textContent = prev; }, 3000);
        }).catch(() => { location.href = 'mailto:' + email; });
      } else {
        location.href = 'mailto:' + email;
      }
    });
  }

  // subtle reveal for cards
  const cards = document.querySelectorAll('.card');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.style.opacity = '1';
        ent.target.style.transform = 'none';
        obs.unobserve(ent.target);
      }
    });
  }, {threshold: 0.06});

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(6px)';
    c.style.transition = 'opacity 420ms ease, transform 420ms ease';
    io.observe(c);
  });
});

// Starfield / constellation background
(function starfield(){
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const stars = [];
  const STAR_COUNT = Math.floor((w * h) / 12000); // density

  function rand(min, max){ return Math.random() * (max - min) + min }

  function createStars(){
    stars.length = 0;
    for (let i=0;i<STAR_COUNT;i++){
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.6, 1.8),
        baseAlpha: rand(0.15, 0.9),
        phase: Math.random() * Math.PI * 2,
        speed: rand(0.002, 0.012)
      });
    }
  }

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    createStars();
  }

  window.addEventListener('resize', resize);

  // occasional shooting star
  let shootTimer = rand(3000, 9000);
  let cometTimer = rand(8000, 16000);
  function draw(t){
    ctx.clearRect(0,0,w,h);
    // draw stars
    for (const s of stars){
      const a = s.baseAlpha + Math.sin(s.phase + t * s.speed) * 0.45 * s.baseAlpha;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,246,230,${Math.max(0, Math.min(1, a))})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
      s.phase += 0.002 + s.speed * 0.5;
    }

    // shooting star logic
    shootTimer -= 16.6; // approx per-frame
    if (shootTimer <= 0){
      launchShootingStar();
      shootTimer = rand(4000, 14000);
    }
    // comet timer
    cometTimer -= 16.6;
    if (cometTimer <= 0){
      launchComet();
      cometTimer = rand(12000, 30000);
    }
    // animate active shooting stars
    if (starfield.shooting && starfield.shooting.length){
      for (let i = starfield.shooting.length -1; i >=0; i--){
        const ss = starfield.shooting[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= 1;
        ctx.beginPath();
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x-ss.vx*10, ss.y-ss.vy*10);
        grad.addColorStop(0, 'rgba(255,240,210,0.98)');
        grad.addColorStop(1, 'rgba(255,240,210,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.width;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx*6, ss.y - ss.vy*6);
        ctx.stroke();
        if (ss.life <= 0 || ss.x < -50 || ss.x > w+50 || ss.y < -50 || ss.y > h+50) starfield.shooting.splice(i,1);
      }
    }

    // animate comets
    if (starfield.comets && starfield.comets.length){
      for (let i = starfield.comets.length -1; i >=0; i--){
        const c = starfield.comets[i];
        c.x += c.vx; c.y += c.vy; c.life -= 1;
        // tail
        const tx = c.x - c.vx * 8;
        const ty = c.y - c.vy * 8;
        const grad = ctx.createLinearGradient(c.x, c.y, tx, ty);
        grad.addColorStop(0, 'rgba(255,247,228,0.96)');
        grad.addColorStop(0.3, 'rgba(241,170,57,0.62)');
        grad.addColorStop(1, 'rgba(241,170,57,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.width;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // head
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,247,228,0.95)';
        ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
        ctx.fill();
        if (c.life <= 0 || c.x < -80 || c.x > w+80 || c.y < -80 || c.y > h+80) starfield.comets.splice(i,1);
      }
    }

    requestAnimationFrame(draw);
  }

  function launchShootingStar(){
    const startX = Math.random() < 0.5 ? -50 : w + 50;
    const startY = Math.random() * (h * 0.6);
    const vx = (startX < 0 ? 1 : -1) * rand(8, 14);
    const vy = rand(1, 4) * (Math.random() < 0.5 ? 1 : -1);
    starfield.shooting.push({x:startX,y:startY,vx,vy,life:rand(30,80),width:rand(1,2.4)});
  }

  function launchComet(){
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -80 : w + 80;
    const startY = Math.random() * (h * 0.5);
    const vx = (fromLeft ? 1 : -1) * rand(6, 12);
    const vy = rand(-1.5, 1.5);
    starfield.comets.push({x:startX,y:startY,vx,vy,life:rand(80,160),width:rand(2,4),r:rand(1.5,3.5)});
  }

  // starfield namespace for effects
  const starfield = { shooting: [], comets: [] };

  createStars();
  requestAnimationFrame(draw);
})();
