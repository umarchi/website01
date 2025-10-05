// フォーム送信（デモ）
const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.hidden = true;
    document.getElementById('thanks').hidden = false;
  });
}

// IntersectionObserver で左右からのアニメーション
const targets = document.querySelectorAll('[data-animate]');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
targets.forEach((t) => io.observe(t));

/* =============================
   汎用：数値をカウントアップして接尾辞をフェードイン
   el: strong 要素 / target: 目標値（整数） / suffix: '+' or '%'
   ============================= */
function animateCountWithSuffix(el, target, suffix, duration = 1500) {
  if (!el) return;
  const suf = document.createElement('span');
  suf.textContent = suffix;
  suf.style.opacity = '0';
  suf.style.transition = 'opacity 0.6s ease-out';

  el.textContent = '0';
  el.appendChild(suf);

  const easeOutQuad = (t) => t * (2 - t);
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutQuad(progress);
    const value = Math.floor(target * eased);
    el.firstChild.textContent = value.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.firstChild.textContent = target.toLocaleString();
      suf.style.opacity = '1';
    }
  }
  requestAnimationFrame(update);
}

// =============================
// 提案実績（1番目の .stat strong） / 継続運用率（2番目）
// =============================
const statStrongList = document.querySelectorAll('.stat strong');
const proposalEl = statStrongList[0];
const rateEl     = statStrongList[1];

const parseNumber = (el) => parseInt((el?.textContent || '').replace(/\D/g, ''), 10) || 0;
const proposalTarget = parseNumber(proposalEl);
const rateTarget     = parseNumber(rateEl);

// 視界に入ったら1回だけ発火
const onceObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    if (entry.target === proposalEl) {
      animateCountWithSuffix(proposalEl, proposalTarget, '+', 1500);
      onceObserver.unobserve(proposalEl);
    } else if (entry.target === rateEl) {
      animateCountWithSuffix(rateEl, rateTarget, '%', 1200);
      onceObserver.unobserve(rateEl);
    }
  });
}, { threshold: 0.4 });
if (proposalEl) onceObserver.observe(proposalEl);
if (rateEl) onceObserver.observe(rateEl);

// =============================
// Testimonials：滑らか無限自動スクロール（transform 版）
// =============================
(function(){
  const wrap  = document.getElementById('tCarousel');
  if (!wrap) return;
  const track = wrap.querySelector('.t-track');
  if (!track) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // コンテンツ二重化
  track.innerHTML = track.innerHTML + track.innerHTML;

  // ★ 画面幅に応じた速度（px/秒）
  function computeSpeed(){
    const w = window.innerWidth;
    if (w <= 480) return 28;   // スマホ：ゆっくり
    if (w <= 768) return 34;   // タブレット縦
    if (w <= 1200) return 40;  // タブレット横/小さめPC
    return 46;                 // デスクトップ：少し速く
  }
  let speedPxPerSec = computeSpeed();

  let halfWidth = 0;
  let startTs = null;

  function measureHalfWidth() {
    const children = track.children;
    const halfCount = Math.floor(children.length / 2);
    let w = 0;
    for (let i = 0; i < halfCount; i++) {
      w += children[i].getBoundingClientRect().width;
      if (i < halfCount - 1) w += 14; // gap
    }
    halfWidth = w || 1;
  }

  function initMeasure() {
    measureHalfWidth();
  }
  initMeasure();

  // リサイズで速度も再計算
  addEventListener('resize', () => {
    speedPxPerSec = computeSpeed();
    initMeasure();
  });

  function tick(ts) {
    if (!startTs) startTs = ts;
    const elapsed = (ts - startTs) / 1000;
    const dist = (elapsed * speedPxPerSec) % halfWidth;
    track.style.transform = `translateX(${-dist}px)`;
    requestAnimationFrame(tick);
  }

  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(tick);
        io2.unobserve(wrap);
      }
    });
  }, { threshold: 0.2 });
  io2.observe(wrap);
})();
