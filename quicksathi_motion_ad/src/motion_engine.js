// quicksathi_motion_ad/src/motion_engine.js  [v2 — Premium Upgrade]
// Billion Dollar Startup Motion Engine — Cinematic, Rich & Professional

export class QuickSathiMotionEngine {
  constructor(canvas, images = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.width  = canvas.width;   // 1920
    this.height = canvas.height;  // 1080
    this.images  = images;
    this.duration = 30.0;

    // Pre-seed deterministic particle systems
    this._initParticles();
    this._initConfetti();
    this._initStars();
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < 140; i++) {
      this.particles.push({
        x:      (Math.sin(i * 99.71) * 0.5 + 0.5) * this.width,
        y:      (Math.cos(i * 33.13) * 0.5 + 0.5) * this.height,
        r:      0.8 + (i % 5) * 1.4,
        sx:     Math.sin(i * 1.3) * 0.35,
        sy:     -0.15 - (i % 4) * 0.18,
        alpha:  0.12 + (i % 6) * 0.09,
        color:  i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#6366F1' : '#22D3EE',
        phase:  i * 0.37,
      });
    }
  }

  _initStars() {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x:     (Math.sin(i * 127.3) * 0.5 + 0.5) * this.width,
        y:     (Math.cos(i * 91.7)  * 0.5 + 0.5) * this.height,
        r:     0.3 + (i % 4) * 0.45,
        alpha: 0.06 + (i % 7) * 0.06,
        twinkle: i * 0.53,
      });
    }
  }

  _initConfetti() {
    this.confetti = [];
    for (let i = 0; i < 120; i++) {
      this.confetti.push({
        x:     (Math.sin(i * 47.1) * 0.5 + 0.5) * this.width,
        y:     (Math.cos(i * 83.3) * 0.5 + 0.5) * this.height * 0.5,
        r:     3 + (i % 4) * 3,
        vx:    (Math.sin(i * 5.1) - 0.5) * 3,
        vy:    1.5 + (i % 4) * 0.9,
        rot:   i * 23,
        rotV:  (Math.sin(i) - 0.5) * 4,
        color: ['#FF6B00','#FFAE34','#4F46E5','#22D3EE','#10B981','#F59E0B','#EC4899'][i % 7],
        shape: i % 3, // 0=rect 1=circle 2=triangle
      });
    }
  }

  // ─── EASING ────────────────────────────────────────────────────
  clamp(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }
  easeOutCubic(t)  { return 1 - Math.pow(1 - this.clamp(t), 3); }
  easeInCubic(t)   { t = this.clamp(t); return t * t * t; }
  easeInOutCubic(t){ t = this.clamp(t); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  easeOutExpo(t)   { t = this.clamp(t); return t===1 ? 1 : 1 - Math.pow(2,-10*t); }
  easeOutBack(t, s=1.70158) { t=this.clamp(t)-1; return t*t*((s+1)*t+s)+1; }
  easeOutElastic(t){ const c4=(2*Math.PI)/3; t=this.clamp(t); return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-0.75)*c4)+1; }

  // ─── PRIMITIVES ──────────────────────────────────────────────
  rrect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);   ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);   ctx.quadraticCurveTo(x, y+h,   x, y+h-r);
    ctx.lineTo(x, y+r);     ctx.quadraticCurveTo(x, y,     x+r, y);
    ctx.closePath();
  }

  // Fills a solid rrect with optional glow shadow
  fillRRect(x, y, w, h, r, fillStyle, shadowColor='', shadowBlur=0) {
    const ctx = this.ctx;
    if (shadowColor) { ctx.shadowColor=shadowColor; ctx.shadowBlur=shadowBlur; }
    this.rrect(x,y,w,h,r);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  }

  // ─── BACKGROUND LAYER ────────────────────────────────────────
  drawBackground(t) {
    const ctx = this.ctx;
    const w = this.width, h = this.height;

    // 1. Deep cosmic base
    const bg = ctx.createRadialGradient(w*.5, h*.4, 80, w*.5, h*.55, w*.92);
    bg.addColorStop(0, '#111828');
    bg.addColorStop(0.45, '#080C18');
    bg.addColorStop(1, '#020308');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

    // 2. Static stars
    ctx.save();
    this.stars.forEach(s => {
      const a = s.alpha * (0.7 + 0.3 * Math.sin(t * 1.8 + s.twinkle));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Animated ambient orbs (screen blend)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const orbs = [
      { cx: w*0.28+Math.sin(t*.7)*130, cy: h*0.32+Math.cos(t*.55)*100, rad:580, c:'rgba(255,107,0,0.30)' },
      { cx: w*0.78+Math.cos(t*.65)*150, cy: h*0.62+Math.sin(t*.85)*120, rad:680, c:'rgba(99,102,241,0.22)' },
      { cx: w*0.52+Math.sin(t*1.05)*220, cy: h*0.82+Math.cos(t*.75)*90, rad:540, c:'rgba(6,182,212,0.20)' },
      { cx: w*0.12+Math.cos(t*.45)*80,  cy: h*0.72+Math.sin(t*.6)*70,  rad:350, c:'rgba(16,185,129,0.14)' },
    ];
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.rad);
      g.addColorStop(0, o.c);
      g.addColorStop(0.55, o.c.replace(/[\d.]+\)$/, '0.04)'));
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    });
    ctx.restore();

    // 4. Perspective scrolling grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.022)';
    ctx.lineWidth = 1;
    const gs = 90, shY = (t*22) % gs;
    for (let x=0; x<w; x+=gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=-gs+shY; y<h; y+=gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.restore();

    // 5. Floating dust particles
    ctx.save();
    this.particles.forEach(p => {
      const cy = ((p.y + p.sy*t*55) % h + h) % h;
      const cx = ((p.x + p.sx*t*38 + Math.sin(t*0.9+p.phase)*18) % w + w) % w;
      ctx.globalAlpha = p.alpha * (0.75 + 0.25*Math.sin(t*2.5+p.phase));
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();

    // 6. Cinematic letterbox bars (top & bottom 5%)
    const lbH = h * 0.05;
    const lbGrad = ctx.createLinearGradient(0,0,0,lbH);
    lbGrad.addColorStop(0, 'rgba(0,0,0,0.95)');
    lbGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lbGrad; ctx.fillRect(0,0,w,lbH);
    const lbBot = ctx.createLinearGradient(0,h-lbH,0,h);
    lbBot.addColorStop(0, 'rgba(0,0,0,0)');
    lbBot.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = lbBot; ctx.fillRect(0,h-lbH,w,lbH);

    // 7. Radial vignette overlay
    const vig = ctx.createRadialGradient(w*.5, h*.5, h*.3, w*.5, h*.5, h*.85);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,h);
  }

  // ─── DESKTOP MOCKUP (3D perspective tilt) ──────────────────
  drawDesktopMockup(img, x, y, width, height, progress, tiltX=0, tiltY=0, glowColor='rgba(255,107,0,0.35)') {
    if (!img) return;
    const ctx = this.ctx;
    ctx.save();

    // 3D perspective skew
    ctx.translate(x + width/2, y + height/2);
    ctx.transform(1, tiltY, tiltX, 1, 0, 0);
    ctx.translate(-(x + width/2), -(y + height/2));

    // Ambient glow halo behind mockup
    const hg = ctx.createRadialGradient(x+width/2, y+height/2, 50, x+width/2, y+height/2, width*.7);
    hg.addColorStop(0, glowColor);
    hg.addColorStop(1, 'transparent');
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.fillStyle=hg; ctx.fillRect(0,0,this.width,this.height); ctx.restore();

    // Drop shadow
    ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=70; ctx.shadowOffsetY=40;
    const r = 14;
    this.rrect(x,y,width,height,r);
    ctx.fillStyle='#0A0E17'; ctx.fill();
    ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;

    // Outer edge border with gradient shimmer
    const borderGrad = ctx.createLinearGradient(x,y,x+width,y+height);
    borderGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    borderGrad.addColorStop(1, 'rgba(255,255,255,0.18)');
    ctx.strokeStyle = borderGrad; ctx.lineWidth = 1.5; ctx.stroke();

    // Titlebar
    const hdrH = 44;
    ctx.save();
    this.rrect(x,y,width,hdrH+r,r); ctx.clip();
    const hdrGrad = ctx.createLinearGradient(x,y,x,y+hdrH);
    hdrGrad.addColorStop(0,'#1E2535'); hdrGrad.addColorStop(1,'#141924');
    ctx.fillStyle=hdrGrad; ctx.fillRect(x,y,width,hdrH);

    // Separator line under titlebar
    const sepGrad = ctx.createLinearGradient(x,0,x+width,0);
    sepGrad.addColorStop(0,'transparent'); sepGrad.addColorStop(0.3,'rgba(255,255,255,0.1)'); sepGrad.addColorStop(0.7,'rgba(255,255,255,0.1)'); sepGrad.addColorStop(1,'transparent');
    ctx.strokeStyle=sepGrad; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y+hdrH); ctx.lineTo(x+width,y+hdrH); ctx.stroke();

    // Traffic-light dots
    ['#FF5F56','#FFBD2E','#27C93F'].forEach((c,i) => {
      ctx.beginPath(); ctx.arc(x+22+i*20, y+hdrH/2, 6, 0, Math.PI*2);
      ctx.fillStyle=c; ctx.fill();
    });

    // URL bar
    const urlW=440, urlH=26, urlX=x+width/2-urlW/2, urlY=y+(hdrH-urlH)/2;
    this.rrect(urlX,urlY,urlW,urlH,13);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#64748B'; ctx.font='500 11px Inter,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🔒  quicksathi.in  —  On-Demand Trusted Services', x+width/2, y+hdrH/2);
    ctx.restore();

    // Screenshot
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y+hdrH, width, height-hdrH); ctx.clip();
    ctx.drawImage(img, 0,0,img.width,img.height, x,y+hdrH, width, height-hdrH);

    // Moving glare sweep
    const sweep = x + (progress*2.5 - 0.5)*width;
    const sweepGrad = ctx.createLinearGradient(sweep,y, sweep+280,y+height);
    sweepGrad.addColorStop(0,'rgba(255,255,255,0)');
    sweepGrad.addColorStop(0.5,'rgba(255,255,255,0.08)');
    sweepGrad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=sweepGrad; ctx.fillRect(x,y+hdrH,width,height-hdrH);
    ctx.restore();

    ctx.restore();
  }

  // ─── MOBILE MOCKUP (iPhone Pro style) ──────────────────────
  drawMobileMockup(img, x, y, w, h, scrollP=0, tiltDeg=0) {
    if (!img) return;
    const ctx = this.ctx;
    ctx.save();

    // Subtle tilt
    if (tiltDeg !== 0) {
      ctx.translate(x+w/2, y+h/2);
      ctx.rotate(tiltDeg * Math.PI/180);
      ctx.translate(-(x+w/2), -(y+h/2));
    }

    // Multi-layered shadow for depth
    ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=80; ctx.shadowOffsetX=15; ctx.shadowOffsetY=50;
    const R = 54;
    this.rrect(x,y,w,h,R); ctx.fillStyle='#0E1219'; ctx.fill();
    ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;

    // Side button highlights
    ctx.save();
    const sideGrad = ctx.createLinearGradient(x,y,x+w,y);
    sideGrad.addColorStop(0,'rgba(255,255,255,0.22)');
    sideGrad.addColorStop(0.3,'rgba(255,255,255,0.08)');
    sideGrad.addColorStop(0.7,'rgba(255,255,255,0.05)');
    sideGrad.addColorStop(1,'rgba(255,255,255,0.18)');
    ctx.strokeStyle=sideGrad; ctx.lineWidth=4;
    this.rrect(x,y,w,h,R); ctx.stroke();
    ctx.restore();

    // Screen area
    const bz=14, sr=R-10;
    const sx=x+bz, sy=y+bz, sw=w-bz*2, sh=h-bz*2;
    ctx.save();
    this.rrect(sx,sy,sw,sh,sr); ctx.clip();

    // Scrolling screenshot
    const maxSy = Math.max(0, img.height - (img.width * sh/sw));
    const imgSy = scrollP * maxSy * 0.6;
    ctx.drawImage(img, 0,imgSy, img.width, img.height-imgSy, sx,sy, sw,sh);

    // Dynamic Island
    const diW=118, diH=32, diX=sx+(sw-diW)/2, diY=sy+12;
    this.rrect(diX,diY,diW,diH,16); ctx.fillStyle='#000'; ctx.fill();
    ctx.beginPath(); ctx.arc(diX+diW-22,diY+diH/2,5,0,Math.PI*2); ctx.fillStyle='#1a1e2b'; ctx.fill();

    // Glass glare over screen
    const gl=ctx.createLinearGradient(sx,sy,sx+sw*0.6,sy+sh*0.4);
    gl.addColorStop(0,'rgba(255,255,255,0.14)'); gl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=gl; ctx.fillRect(sx,sy,sw,sh);

    ctx.restore();

    // Subtle reflection below phone
    ctx.save();
    ctx.globalAlpha=0.12;
    ctx.scale(1,-1);
    ctx.drawImage(img,0,0,img.width,img.height, x,-(y+h+30), w,h*0.4);
    ctx.restore();

    ctx.restore();
  }

  // ─── GLASS CARD ──────────────────────────────────────────────
  drawGlassCard(x, y, w, h, r, accentColor='#FF6B00', glowIntensity=0.3) {
    const ctx = this.ctx;
    ctx.save();

    // Glow
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 40 * glowIntensity;

    this.rrect(x,y,w,h,r);
    const bg = ctx.createLinearGradient(x,y,x,y+h);
    bg.addColorStop(0,'rgba(24,30,48,0.92)');
    bg.addColorStop(1,'rgba(10,13,22,0.97)');
    ctx.fillStyle=bg; ctx.fill();

    // Border: top highlight + colored accent
    ctx.shadowColor='transparent'; ctx.shadowBlur=0;
    const brd = ctx.createLinearGradient(x,y,x,y+h);
    brd.addColorStop(0,'rgba(255,255,255,0.22)');
    brd.addColorStop(0.5, accentColor + '44');
    brd.addColorStop(1,'rgba(255,255,255,0.06)');
    ctx.strokeStyle=brd; ctx.lineWidth=1.5; ctx.stroke();

    // Inner gloss top shine
    const shine = ctx.createLinearGradient(x,y,x,y+r*3);
    shine.addColorStop(0,'rgba(255,255,255,0.07)'); shine.addColorStop(1,'rgba(255,255,255,0)');
    ctx.save(); this.rrect(x,y,w,r*3,r); ctx.clip(); ctx.fillStyle=shine; ctx.fill(); ctx.restore();

    ctx.restore();
  }

  // ─── FEATURE PILL ────────────────────────────────────────────
  drawPill(text, sub, icon, x, y, w, h, accent='#FF6B00', progress=1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = progress;

    const slideY = y + (1-progress)*28;
    this.drawGlassCard(x, slideY, w, h, 20, accent, 0.25);

    // Icon circle with glow
    const ir=22, ix=x+32, iy=slideY+h/2;
    ctx.save();
    ctx.shadowColor=accent; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(ix,iy,ir,0,Math.PI*2); ctx.fillStyle=accent; ctx.fill();
    ctx.shadowColor='transparent';
    ctx.font='700 17px Inter,sans-serif'; ctx.fillStyle='#FFF';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(icon, ix, iy);
    ctx.restore();

    ctx.textAlign='left';
    ctx.fillStyle='#FFFFFF'; ctx.font='700 18px Outfit,Inter,sans-serif';
    ctx.fillText(text, x+66, slideY+h/2-9);
    if (sub) {
      ctx.fillStyle='#64748B'; ctx.font='500 13px Inter,sans-serif';
      ctx.fillText(sub, x+66, slideY+h/2+11);
    }
    ctx.restore();
  }

  // ─── KINETIC HEADLINE ────────────────────────────────────────
  drawKineticTitle(tag, line1, line2, sub, t, tStart) {
    const ctx = this.ctx;
    const e = t - tStart;
    ctx.save();

    // Tag line
    if (tag) {
      const a = this.easeOutCubic(e/0.45);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FF7A00';
      ctx.font = '700 13px Outfit,Inter,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tag.toUpperCase(), 100, 155);
      // Decorative orange line accent
      ctx.fillStyle = '#FF6B00';
      ctx.fillRect(100, 165, 40, 2);
    }

    // Headline line 1
    {
      const p = this.easeOutExpo(this.clamp((e-0.1)/0.65));
      const dy = (1-p)*35;
      ctx.globalAlpha = p;
      ctx.shadowColor = 'rgba(255,255,255,0.08)'; ctx.shadowBlur = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 68px Outfit,Inter,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(line1, 100, 240 + dy);
      ctx.shadowColor='transparent';
    }

    // Headline line 2 (gradient)
    if (line2) {
      const p = this.easeOutExpo(this.clamp((e-0.28)/0.65));
      const dy = (1-p)*35;
      ctx.globalAlpha = p;
      const tg = ctx.createLinearGradient(100, 310, 820, 320);
      tg.addColorStop(0,'#FF6B00'); tg.addColorStop(0.5,'#FFAE34'); tg.addColorStop(1,'#22D3EE');
      ctx.shadowColor='rgba(255,107,0,0.3)'; ctx.shadowBlur=30;
      ctx.fillStyle=tg;
      ctx.font='800 68px Outfit,Inter,sans-serif';
      ctx.fillText(line2, 100, 320+dy);
      ctx.shadowColor='transparent';
    }

    // Subtitle
    if (sub) {
      const p = this.easeOutCubic(this.clamp((e-0.5)/0.7));
      const dy = (1-p)*20;
      ctx.globalAlpha = p * 0.9;
      ctx.fillStyle = '#94A3B8';
      ctx.font = '400 22px Inter,sans-serif';
      ctx.fillText(sub, 100, 390+dy);
    }

    ctx.restore();
  }

  // ─── ANIMATED NOTIFICATION POPUP ─────────────────────────────
  drawNotif(text, sub, x, y, progress, accent='#10B981') {
    if (progress <= 0) return;
    const ctx = this.ctx;
    const w=360, h=70, r=16;
    const ay = y - (1-this.easeOutBack(progress))*30;
    ctx.save();
    ctx.globalAlpha = Math.min(progress*2, 1);
    this.drawGlassCard(x, ay, w, h, r, accent, 0.4);

    // Left accent bar
    ctx.fillStyle=accent; ctx.fillRect(x+r, ay+12, 4, h-24);

    ctx.fillStyle='#FFF'; ctx.font='700 16px Outfit,Inter,sans-serif'; ctx.textAlign='left';
    ctx.fillText(text, x+r+20, ay+h/2-8);
    ctx.fillStyle='#94A3B8'; ctx.font='400 13px Inter,sans-serif';
    ctx.fillText(sub, x+r+20, ay+h/2+11);

    // Pulsing dot
    ctx.save();
    ctx.beginPath(); ctx.arc(x+w-24, ay+h/2, 6, 0, Math.PI*2);
    ctx.fillStyle=accent; ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ─── SONAR RING PULSE ────────────────────────────────────────
  drawSonarRings(cx, cy, t, color='rgba(255,107,0,', count=3) {
    const ctx = this.ctx;
    ctx.save();
    for (let i=0; i<count; i++) {
      const phase = (t * 0.7 + i / count) % 1;
      const r = 60 + phase * 340;
      const a = (1-phase) * 0.18;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = color + a + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── ANIMATED CHECKMARK DRAW-ON ──────────────────────────────
  drawCheckAnim(cx, cy, r, progress, color) {
    const ctx = this.ctx;
    if (progress <= 0) return;
    ctx.save();

    // Circle
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = color + '22'; ctx.fill();

    // Checkmark draw-on
    if (progress > 0.4) {
      const cp = this.clamp((progress-0.4)/0.6);
      const sx=cx-r*0.45, sy=cy, mx=cx-r*0.08, my=cy+r*0.38;
      const ex=cx+r*0.45, ey=cy-r*0.32;
      ctx.strokeStyle='#FFF'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.beginPath(); ctx.moveTo(sx,sy);
      if (cp < 0.5) {
        const t2=cp*2; ctx.lineTo(sx+(mx-sx)*t2, sy+(my-sy)*t2);
      } else {
        const t2=(cp-0.5)*2;
        ctx.lineTo(mx,my); ctx.lineTo(mx+(ex-mx)*t2, my+(ey-my)*t2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── CONFETTI BURST ──────────────────────────────────────────
  drawConfetti(t, tStart) {
    const ctx = this.ctx;
    const elapsed = t - tStart;
    if (elapsed < 0) return;
    ctx.save();
    this.confetti.forEach((c,i) => {
      const age = elapsed + i*0.008;
      if (age < 0) return;
      const cx = c.x + c.vx*age*55;
      const cy = c.y + c.vy*age*55 + 0.5*9.8*age*age*8;
      if (cy > this.height*1.2) return;
      const rot = (c.rot + c.rotV*age*50) * Math.PI/180;
      const a = Math.max(0, 1 - age*0.35);
      ctx.globalAlpha = a * 0.9;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot);
      ctx.fillStyle = c.color;
      if (c.shape === 0) ctx.fillRect(-c.r, -c.r*0.5, c.r*2, c.r);
      else if (c.shape === 1) { ctx.beginPath(); ctx.arc(0,0,c.r,0,Math.PI*2); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(0,-c.r); ctx.lineTo(c.r,c.r); ctx.lineTo(-c.r,c.r); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    });
    ctx.restore();
  }

  // ─── LOWER THIRD HUD ─────────────────────────────────────────
  drawLowerThird(sceneName, t) {
    const ctx = this.ctx;
    const progress = t / this.duration;
    const w = this.width, h = this.height;
    const barY = h - 48;

    ctx.save();

    // Dark frosted bar bg
    const barBg = ctx.createLinearGradient(0,barY,0,h);
    barBg.addColorStop(0,'rgba(4,6,12,0.82)'); barBg.addColorStop(1,'rgba(0,0,0,0.95)');
    ctx.fillStyle=barBg; ctx.fillRect(0,barY,w,48);
    // Top separator
    const sep=ctx.createLinearGradient(0,barY,w,barY);
    sep.addColorStop(0,'transparent'); sep.addColorStop(0.15,'rgba(255,107,0,0.5)'); sep.addColorStop(0.85,'rgba(255,107,0,0.2)'); sep.addColorStop(1,'transparent');
    ctx.strokeStyle=sep; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,barY); ctx.lineTo(w,barY); ctx.stroke();

    // Progress fill
    const pfGrad=ctx.createLinearGradient(0,barY,w*progress,barY);
    pfGrad.addColorStop(0,'rgba(255,107,0,0.4)'); pfGrad.addColorStop(0.8,'rgba(255,174,52,0.3)'); pfGrad.addColorStop(1,'rgba(34,211,238,0.5)');
    ctx.fillStyle=pfGrad; ctx.fillRect(0,barY,w*progress,4);

    // Glowing tip
    const tip=w*progress;
    ctx.shadowColor='#22D3EE'; ctx.shadowBlur=12;
    ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.fillRect(Math.max(0,tip-4),barY,4,4);
    ctx.shadowColor='transparent';

    // Scene dot indicator
    const scenes=[0,5,11,17,23,27];
    scenes.forEach((st,i) => {
      const sp=st/30; const sx=w*sp;
      const isActive = (i===5 && t>=27) || (i<5 && t>=st && t<(scenes[i+1]||30));
      ctx.beginPath(); ctx.arc(sx, barY+2, isActive?4:2, 0, Math.PI*2);
      ctx.fillStyle = isActive ? '#FF6B00' : 'rgba(255,255,255,0.35)';
      ctx.fill();
    });

    // Text
    ctx.font='600 12px Inter,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.textAlign='left'; ctx.textBaseline='middle';
    // Orange QuickSathi watermark
    ctx.fillStyle='#FF6B00'; ctx.font='700 13px Outfit,sans-serif';
    ctx.fillText('QUICKSATHI', 36, barY+28);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='600 12px Inter,sans-serif';
    ctx.fillText('  ·  ' + sceneName, 36+96, barY+28);

    // Timecode right
    const s=Math.floor(t), ms=Math.floor((t-s)*100);
    ctx.textAlign='right'; ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText(`${String(s).padStart(2,'0')}:${String(ms).padStart(2,'0')}  /  30:00  ·  OFFICIAL AD  ·  1080p`, w-36, barY+28);
    ctx.restore();
  }

  // ─── ANIMATED NUMBER COUNTER ─────────────────────────────────
  animatedNum(val, unit, maxVal, progress, x, y, color, size=42) {
    const ctx = this.ctx;
    const displayed = Math.round(this.easeOutExpo(progress) * maxVal);
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color + '55'; ctx.shadowBlur = 16;
    ctx.font = `800 ${size}px Outfit,Inter,sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(displayed.toLocaleString() + unit, x, y);
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN RENDERER
  // ═══════════════════════════════════════════════════════════════
  renderFrame(t) {
    const ctx = this.ctx;
    const w = this.width, h = this.height;
    this.drawBackground(t);

    // ────────────────────────────────────────────────────────────
    // SCENE 1  0.0s – 5.0s   "THE HOME REPAIR PROBLEM"
    // ────────────────────────────────────────────────────────────
    if (t < 5.0) {
      const lT = t;
      const camZ = 1 + (lT/5.0)*0.06;
      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      // Subtle red ambient tint
      ctx.save();
      const redVig = ctx.createRadialGradient(w*0.85,h*0.35,80,w*0.85,h*0.35,700);
      redVig.addColorStop(0,'rgba(239,68,68,0.12)'); redVig.addColorStop(1,'transparent');
      ctx.globalCompositeOperation='screen'; ctx.fillStyle=redVig; ctx.fillRect(0,0,w,h);
      ctx.restore();

      // Kinetic headline
      this.drawKineticTitle('// The Home Repair Reality', 'Finding Reliable Help', "Shouldn't Feel Like a Gamble.", 'Unverified vendors · Endless waiting · Zero pricing transparency', t, 0);

      // 3 problem cards (staggered slide-in from right)
      const cards=[
        {text:'Unverified Technicians', sub:"No background checks \u2014 who's entering your home?", icon:'\u26A0', accent:'#EF4444', delay:0.2},
        {text:'Surging Hidden Fees',    sub:'No upfront quotes \u2014 uncontrolled price haggling', icon:'\uD83D\uDCB8', accent:'#F59E0B', delay:0.65},
        {text:'Hours of Waiting',       sub:'Endless delays \u2014 will they even show up?',        icon:'\u23F3', accent:'#8B5CF6', delay:1.1},
      ];
      cards.forEach((c, i) => {
        const p = this.easeOutElastic(this.clamp((lT-c.delay)/0.7));
        const sx = 1080 + (1-p)*300;
        this.drawPill(c.text, c.sub, c.icon, sx, 220+i*130, 740, 96, c.accent, p);
      });

      // Subtle glitch lines on top of cards (chaos aesthetic)
      if (lT > 1.5) {
        ctx.save();
        ctx.globalAlpha = 0.06 * Math.sin(lT*15);
        ctx.fillStyle='#EF4444';
        ctx.fillRect(1060, 190, 780, 3);
        ctx.fillRect(1060, 340, 780, 2);
        ctx.restore();
      }

      // Flash wipe out at 4.2s
      if (lT > 4.0) {
        const fp = this.easeInCubic((lT-4.0)/1.0);
        const wipeG = ctx.createLinearGradient(0,0,w,0);
        wipeG.addColorStop(0,'rgba(255,255,255,'+Math.min(1,fp*1.5)+')');
        wipeG.addColorStop(fp*1.2,'rgba(255,255,255,'+fp+')');
        wipeG.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=wipeG; ctx.fillRect(0,0,w,h);
      }
      ctx.restore();
      this.drawLowerThird('SCENE 01 · The Problem', t);
    }

    // ────────────────────────────────────────────────────────────
    // SCENE 2  5.0s – 11.0s  "MEET QUICKSATHI"
    // ────────────────────────────────────────────────────────────
    else if (t >= 5.0 && t < 11.0) {
      const lT = t - 5.0;
      const ep = this.easeOutExpo(this.clamp(lT/0.85));
      const camZ = 1 + (lT/6.0)*0.045;

      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      // Sonar rings behind desktop mockup area
      this.drawSonarRings(w*0.73, h*0.5, lT, 'rgba(255,107,0,', 4);

      // Logo top-left
      if (this.images.logoFull) {
        const lp = this.easeOutCubic(this.clamp(lT/0.55));
        ctx.save(); ctx.globalAlpha=lp;
        ctx.drawImage(this.images.logoFull, 100, 88, 280, 72);
        ctx.restore();
      }

      // Kinetic headline (left)
      this.drawKineticTitle('// Introducing the Platform', 'Your Home Services,', 'Elevated to Perfection.', '50+ Verified Services. Book in under 60 seconds.', t, 5.0);

      // Feature pills
      const pills=[
        {text:'4.9 ★ Average Rating', sub:'50,000+ completed bookings across India', icon:'★', accent:'#FF6B00', delay:0.7},
        {text:'60-Min Rapid Arrival', sub:'GPS-tracked technicians dispatched instantly', icon:'⚡', accent:'#22D3EE', delay:1.2},
        {text:'100% Background Verified', sub:'Police-cleared, Aadhaar-checked specialists', icon:'🛡', accent:'#10B981', delay:1.7},
      ];
      pills.forEach((p,i) => {
        const pp = this.easeOutElastic(this.clamp((lT-p.delay)/0.75));
        this.drawPill(p.text, p.sub, p.icon, 100, 490+i*118, 500, 96, p.accent, pp);
      });

      // Desktop mockup (right, 3D tilted)
      const deskX = 650 + (1-ep)*180;
      const tiltX = -0.035*(1-ep);
      const tiltY = 0.01*Math.sin(lT*0.8);
      this.drawDesktopMockup(this.images.heroDesktop, deskX, 140, 1220, 740, lT/6, tiltX, tiltY, 'rgba(255,107,0,0.4)');

      ctx.restore();
      this.drawLowerThird('SCENE 02 · Meet QuickSathi', t);
    }

    // ────────────────────────────────────────────────────────────
    // SCENE 3  11.0s – 17.0s  "UPFRONT PRICING"
    // ────────────────────────────────────────────────────────────
    else if (t >= 11.0 && t < 17.0) {
      const lT = t - 11.0;
      const ep = this.easeOutExpo(this.clamp(lT/0.85));
      const camZ = 1 + (lT/6.0)*0.04;

      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      // Headline
      this.drawKineticTitle('// Transparent Cost Guarantee', 'Fixed Upfront Pricing.', 'Zero Surges. Zero Hassle.', 'Know exact rates before booking. 30-day service warranty included.', t, 11.0);

      // AC services desktop mockup (bottom left)
      const deskX = 80 + (1-ep)*120;
      const tiltY = 0.018;
      this.drawDesktopMockup(this.images.acServices, deskX, 480, 1040, 530, lT/6, 0, tiltY, 'rgba(6,182,212,0.35)');

      // Price card (right)
      const cp = this.easeOutBack(this.clamp((lT-0.5)/0.75));
      const cardX=1180, cardY=190+(1-cp)*50, cardW=680, cardH=560;
      ctx.save(); ctx.globalAlpha=cp;
      this.drawGlassCard(cardX, cardY, cardW, cardH, 26, '#FF6B00', 0.5);

      // Card top accent strip
      const stGrad=ctx.createLinearGradient(cardX,cardY,cardX+cardW,cardY);
      stGrad.addColorStop(0,'#FF6B00'); stGrad.addColorStop(1,'#FF9A00');
      ctx.fillStyle=stGrad; ctx.fillRect(cardX+26,cardY,cardW-52,4);

      ctx.fillStyle='#FF7A00'; ctx.font='700 12px Outfit,sans-serif';
      ctx.textAlign='left';
      ctx.fillText('FEATURED SERVICE BREAKDOWN', cardX+36, cardY+48); ctx.fillStyle='#FFF'; ctx.font='800 30px Outfit,sans-serif';
      ctx.fillText('AC Jet Foam Deep Clean', cardX+36, cardY+96);
      ctx.fillStyle='#64748B'; ctx.font='400 15px Inter,sans-serif';
      ctx.fillText('Power Jet Cleaning · Gas Top-up · Filter Sanitization', cardX+36, cardY+125);

      // Animated price counter
      const priceP = this.clamp((lT-0.8)/1.0);
      const priceVal = Math.round(this.easeOutExpo(priceP)*499);
      ctx.fillStyle='#10B981';
      ctx.shadowColor='rgba(16,185,129,0.4)'; ctx.shadowBlur=24;
      ctx.font='800 60px Outfit,sans-serif';
      ctx.fillText('₹'+priceVal, cardX+36, cardY+210);
      ctx.shadowColor='transparent';
      ctx.fillStyle='#475569'; ctx.font='500 18px Inter,sans-serif';
      ctx.fillText('Market Rate: ₹899 — You Save ₹400!', cardX+36, cardY+246);

      // Checkmarks (draw-on animation)
      const checkItems=[
        {text:'30-Day Re-service Guarantee', delay:1.2, color:'#10B981'},
        {text:'Uniformed Background-Checked Expert', delay:1.6, color:'#22D3EE'},
        {text:'Digital Invoice + UPI / Card Payment', delay:2.0, color:'#FF6B00'},
        {text:'Full Clean-Up Before Departure', delay:2.4, color:'#8B5CF6'},
      ];
      checkItems.forEach((ci, i) => {
        const cp2 = this.clamp((lT-ci.delay)/0.6);
        const chy = cardY+300+i*52;
        this.drawCheckAnim(cardX+52, chy, 14, cp2, ci.color);
        ctx.globalAlpha=Math.min(1,cp2*2); ctx.fillStyle='#E2E8F0';
        ctx.font='500 17px Inter,sans-serif'; ctx.fillText(ci.text, cardX+80, chy+6);
      });

      // Pulsing Book Button
      ctx.globalAlpha=Math.min(1,this.clamp((lT-2.0)/0.5));
      const pulse = 1 + 0.025*Math.sin(lT*5);
      ctx.save();
      ctx.translate(cardX+36+cardW/2-260, cardY+510); ctx.scale(pulse,pulse); ctx.translate(-(cardX+36+cardW/2-260),-(cardY+510));
      const btnGrad=ctx.createLinearGradient(cardX+36,cardY+498,cardX+36+588,cardY+498);
      btnGrad.addColorStop(0,'#FF6B00'); btnGrad.addColorStop(1,'#FF9000');
      this.rrect(cardX+36,cardY+490,588,58,16);
      ctx.shadowColor='rgba(255,107,0,0.5)'; ctx.shadowBlur=20;
      ctx.fillStyle=btnGrad; ctx.fill(); ctx.shadowColor='transparent';
      ctx.fillStyle='#FFF'; ctx.font='700 20px Outfit,sans-serif'; ctx.textAlign='center';
      ctx.fillText('BOOK IN 60 SECONDS  →', cardX+36+294, cardY+524);
      ctx.restore();

      // Click ripple animation
      if (lT > 3.0) {
        const rp=this.clamp((lT-3.0)/1.5);
        for (let ri=0;ri<3;ri++) {
          const rpi=this.clamp(rp-ri*0.15);
          if (rpi<=0) continue;
          const rr=rpi*90;
          ctx.beginPath(); ctx.arc(cardX+36+294,cardY+519,rr,0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,255,255,${Math.max(0,(1-rpi)*0.5)})`; ctx.lineWidth=2; ctx.stroke();
        }
      }

      ctx.restore();
      ctx.restore();
      this.drawLowerThird('SCENE 03 · Upfront Pricing', t);
    }

    // ────────────────────────────────────────────────────────────
    // SCENE 4  17.0s – 23.0s  "MOBILE DISPATCH"
    // ────────────────────────────────────────────────────────────
    else if (t >= 17.0 && t < 23.0) {
      const lT = t - 17.0;
      const ep = this.easeOutExpo(this.clamp(lT/0.85));
      const camZ = 1 + (lT/6.0)*0.04;

      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      // Two phones — main + slightly blurred second (depth)
      const ph1X = 180 + (1-ep)*120, ph1Y=100, ph1W=390, ph1H=780;
      const scrollP = this.clamp(lT/6.0);
      const tilt1 = -2 + ep*2;
      this.drawMobileMockup(this.images.mobileHome, ph1X, ph1Y, ph1W, ph1H, scrollP, tilt1);

      // Second phone (slightly behind, softer)
      if (this.images.mobileAc) {
        const ph2X=ph1X+ph1W+40, ph2Y=ph1Y+80, ph2W=ph1W*0.72, ph2H=ph1H*0.72;
        const p2 = this.easeOutCubic(this.clamp((lT-0.4)/0.7));
        ctx.save(); ctx.globalAlpha=p2*0.65;
        this.drawMobileMockup(this.images.mobileAc, ph2X, ph2Y, ph2W, ph2H, scrollP*0.7, -tilt1*0.5);
        ctx.restore();
      }

      // Right panel — headline
      ctx.save(); ctx.translate(640, 0);
      this.drawKineticTitle('// Speed & Intuitive Design', 'Tap. Track. Relax.', 'At Your Door in 60 Mins.', 'Live GPS tracking. Verified milestones from dispatch to completion.', t, 17.0);
      ctx.restore();

      // Live notification popups
      const notifs=[
        {text:'Booking Confirmed!',    sub:'Rajesh K. is heading your way',        accent:'#10B981', delay:0.9,  yOff:0},
        {text:'Partner Arrived',       sub:'Rajesh K. is 3 minutes away · GPS Live', accent:'#22D3EE', delay:2.0, yOff:90},
        {text:'Service Complete ✓',    sub:'Rate your experience — 5 seconds!',    accent:'#FF6B00', delay:3.5,  yOff:180},
      ];
      notifs.forEach(n => {
        const np = this.clamp((lT-n.delay)/0.65);
        this.drawNotif(n.text, n.sub, 660, 460+n.yOff, np, n.accent);
      });

      // Animated stat counters
      const stats=[
        {label:'Happy Households', maxV:50000, unit:'+', icon:'🏡', color:'#FF6B00', delay:1.2},
        {label:'Certified Pros',   maxV:1200,  unit:'+', icon:'👨‍🔧', color:'#22D3EE', delay:1.6},
        {label:'On-Time Rate',     maxV:99,    unit:'%', icon:'⏱',  color:'#10B981', delay:2.0},
      ];
      stats.forEach((st, i) => {
        const sp = this.clamp((lT-st.delay)/1.2);
        const sy = 700 + i*98;
        const sx = 660;
        ctx.save(); ctx.globalAlpha = this.easeOutCubic(sp);
        this.drawGlassCard(sx, sy, 1180, 80, 18, st.color, 0.2);
        ctx.font='28px Inter,sans-serif'; ctx.fillText(st.icon, sx+28, sy+52);
        this.animatedNum(st.maxV, st.unit, st.maxV, sp, sx+85, sy+54, st.color, 38);
        ctx.fillStyle='#94A3B8'; ctx.font='600 18px Inter,sans-serif';
        ctx.textAlign='left'; ctx.fillText(st.label, sx+290, sy+54);
        ctx.restore();
      });

      ctx.restore();
      this.drawLowerThird('SCENE 04 · Mobile Dispatch', t);
    }

    // ────────────────────────────────────────────────────────────
    // SCENE 5  23.0s – 27.0s  "TOP 5% VERIFICATION PROTOCOL"
    // ────────────────────────────────────────────────────────────
    else if (t >= 23.0 && t < 27.0) {
      const lT = t - 23.0;
      const camZ = 1 + (lT/4.0)*0.04;

      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      const ha = this.easeOutCubic(this.clamp(lT/0.5));
      ctx.globalAlpha = ha;

      // Center headline
      ctx.fillStyle = '#FF7A00'; ctx.font='700 14px Outfit,sans-serif';
      ctx.textAlign='center';
      ctx.fillText('// UNCOMPROMISING STANDARDS', w/2, 100);
      ctx.shadowColor='rgba(255,255,255,0.1)'; ctx.shadowBlur=20;
      ctx.fillStyle='#FFF'; ctx.font='800 58px Outfit,sans-serif';
      ctx.fillText('Only The Top 5% Of Technicians Qualify.', w/2, 185);
      ctx.shadowColor='transparent';

      ctx.fillStyle='#64748B'; ctx.font='400 22px Inter,sans-serif';
      ctx.fillText('Every provider passes a strict 4-layer verification before entering your home.', w/2, 245);

      // 4 pillar cards
      const pillars=[
        {title:'Police Clearance',      desc:'National criminal database check',        icon:'🛡️', color:'#10B981'},
        {title:'Skill Certification',   desc:'Real-world trade competency exam',        icon:'🎖️', color:'#FF6B00'},
        {title:'Brand Uniform Kit',     desc:'Standard attire + hygiene equipment',     icon:'👔', color:'#22D3EE'},
        {title:'₹10,000 Insurance',     desc:'Full damage coverage on every job',       icon:'💎', color:'#8B5CF6'},
      ];

      const cW=380, cH=370, gap=28, totalW=cW*4+gap*3;
      const startX=(w-totalW)/2;

      pillars.forEach((pil, i) => {
        const pp = this.easeOutElastic(this.clamp((lT-0.3-i*0.22)/0.65));
        const px = startX + i*(cW+gap);
        const py = 310 + (1-pp)*60;
        ctx.save(); ctx.globalAlpha = pp;

        this.drawGlassCard(px, py, cW, cH, 24, pil.color, 0.4);

        // Large icon circle with glow
        ctx.save();
        ctx.shadowColor=pil.color; ctx.shadowBlur=35;
        ctx.beginPath(); ctx.arc(px+cW/2, py+88, 50, 0, Math.PI*2);
        ctx.fillStyle=pil.color+'22'; ctx.fill();
        ctx.strokeStyle=pil.color+'66'; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowColor='transparent';
        ctx.font='44px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(pil.icon, px+cW/2, py+88);
        ctx.restore();

        // Animated check-draw in icon circle border
        const checkP = this.clamp((lT-0.6-i*0.22)/0.7);
        this.drawCheckAnim(px+cW/2, py+88, 50, checkP, pil.color);

        ctx.fillStyle='#FFF'; ctx.font='700 21px Outfit,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
        ctx.fillText(pil.title, px+cW/2, py+190);
        ctx.fillStyle='#64748B'; ctx.font='400 15px Inter,sans-serif';
        ctx.fillText(pil.desc, px+cW/2, py+225);

        // Verified badge pill
        const bpY=py+260, bpW=cW-60, bpH=42;
        this.rrect(px+30,bpY,bpW,bpH,21);
        ctx.fillStyle=pil.color+'18'; ctx.fill();
        ctx.strokeStyle=pil.color+'55'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=pil.color; ctx.font='700 13px Outfit,sans-serif'; ctx.fillText('VERIFIED STANDARD', px+cW/2, bpY+26); ctx.restore();
      });

      ctx.restore();
      this.drawLowerThird('SCENE 05 · Verified Pros', t);
    }

    // ────────────────────────────────────────────────────────────
    // SCENE 6  27.0s – 30.0s  "GRAND FINALE + CTA"
    // ────────────────────────────────────────────────────────────
    else if (t >= 27.0) {
      const lT = t - 27.0;
      const ep = this.easeOutBack(this.clamp(lT/0.9), 1.3);
      const camZ = 1 + (lT/3.0)*0.025;

      ctx.save();
      ctx.translate(w/2,h/2); ctx.scale(camZ,camZ); ctx.translate(-w/2,-h/2);

      // Epic radial sunrise glow
      const sunG=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,700);
      sunG.addColorStop(0,'rgba(255,107,0,0.52)');
      sunG.addColorStop(0.35,'rgba(79,70,229,0.28)');
      sunG.addColorStop(0.65,'rgba(6,182,212,0.12)');
      sunG.addColorStop(1,'transparent');
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.fillStyle=sunG; ctx.fillRect(0,0,w,h); ctx.restore();

      // Confetti burst
      this.drawConfetti(t, 27.0);

      // Animated expanding rings (reveal)
      for (let ri=0;ri<5;ri++) {
        const rp = this.clamp((lT-ri*0.12)/0.8);
        if (rp <= 0) continue;
        const rr = this.easeOutExpo(rp) * (280+ri*60);
        const ra = (1-this.easeOutExpo(rp)) * 0.25;
        ctx.beginPath(); ctx.arc(w/2, h/2-30, rr, 0, Math.PI*2);
        ctx.strokeStyle=`rgba(255,107,0,${ra})`; ctx.lineWidth=2; ctx.stroke();
      }

      // Logo
      if (this.images.logoFull) {
        const lp = this.easeOutElastic(this.clamp(lT/0.7));
        ctx.save(); ctx.globalAlpha=lp;
        ctx.shadowColor='rgba(255,107,0,0.35)'; ctx.shadowBlur=30;
        const lW=580, lH=150;
        ctx.drawImage(this.images.logoFull, (w-lW)/2, 120+(1-ep)*30, lW, lH);
        ctx.restore();
      }

      // Main tagline with gradient text
      const tg2 = ctx.createLinearGradient(w*0.25,0,w*0.75,0);
      tg2.addColorStop(0,'#FFF'); tg2.addColorStop(0.5,'#FFD480'); tg2.addColorStop(1,'#FFF');
      const tp = this.easeOutExpo(this.clamp(lT/0.6));
      ctx.save(); ctx.globalAlpha=tp;
      ctx.shadowColor='rgba(255,200,80,0.25)'; ctx.shadowBlur=40;
      ctx.fillStyle=tg2; ctx.font='800 70px Outfit,sans-serif'; ctx.textAlign='center';
      ctx.fillText('Elevate Your Everyday Life.', w/2, 345);
      ctx.shadowColor='transparent';
      ctx.fillStyle='#CBD5E1'; ctx.font='400 26px Inter,sans-serif';
      ctx.fillText('The new gold standard in on-demand home & local services.', w/2, 402);
      ctx.restore();

      // Launch promo banner
      const bp = this.easeOutElastic(this.clamp((lT-0.35)/0.7));
      ctx.save(); ctx.globalAlpha=bp;
      const bW=920, bH=78, bX=(w-bW)/2, bY=450+(1-bp)*25;
      const bGrad=ctx.createLinearGradient(bX,bY,bX+bW,bY);
      bGrad.addColorStop(0,'#FF5500'); bGrad.addColorStop(0.5,'#FF8A00'); bGrad.addColorStop(1,'#FF5500');
      ctx.shadowColor='rgba(255,107,0,0.6)'; ctx.shadowBlur=30;
      this.rrect(bX,bY,bW,bH,39); ctx.fillStyle=bGrad; ctx.fill(); ctx.shadowColor='transparent';
      ctx.fillStyle='#FFF'; ctx.font='800 24px Outfit,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText('🎉  USE CODE "QUICK20" — 20% OFF YOUR FIRST SERVICE  🎉', w/2, bY+50);
      ctx.restore();

      // CTA badges
      const ctaP = this.easeOutBack(this.clamp((lT-0.7)/0.6));
      ctx.save(); ctx.globalAlpha=ctaP;
      const badges=[
        {icon:'🌐', title:'quicksathi.in', sub:'Instant Web Booking', x:w/2-440},
        {icon:'📱', title:'iOS & Android',  sub:'Download Free on App Stores', x:w/2+60},
      ];
      badges.forEach(b => {
        const bW2=380, bH2=84;
        ctx.save();
        this.drawGlassCard(b.x, 570, bW2, bH2, 22, '#FFFFFF', 0.1);
        ctx.font='32px sans-serif'; ctx.fillText(b.icon, b.x+24, 570+bH2/2+12);
        ctx.fillStyle='#FFF'; ctx.font='700 21px Outfit,sans-serif'; ctx.textAlign='left';
        ctx.fillText(b.title, b.x+72, 570+bH2/2-6);
        ctx.fillStyle='#64748B'; ctx.font='400 14px Inter,sans-serif';
        ctx.fillText(b.sub, b.x+72, 570+bH2/2+18);
        ctx.restore();
      });

      // Trust stamps
      ctx.globalAlpha = this.easeOutCubic(this.clamp((lT-1.2)/0.6));
      ctx.fillStyle='#475569'; ctx.font='600 13px Inter,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText('100% HAPPINESS GUARANTEE  ·  SECURE UPI PAYMENTS  ·  POLICE VERIFIED PROS', w/2, 710);
      ctx.restore();

      ctx.restore();
      this.drawLowerThird('SCENE 06 · Elevate Your Life', t);
    }
  }
}

