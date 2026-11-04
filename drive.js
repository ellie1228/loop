// 운전 모드(영어판 전용): 한국어를 들려주고 → 간격 동안 영어로 말해 보고 → 영어 정답을 들려준 뒤 다음 카드.
// 화면을 안 봐도 되는 듣기 전용 반복. 채점 기록은 남기지 않는다.
// 소리 하나가 끝나면 다음 소리를 바로 이어 트는 방식(타이머 없음)이라, 화면이 꺼져도 이어질 가능성이 높다.
'use strict';
const DRIVE_SILENCE = 'data:audio/mpeg;base64,//NAxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEWwAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
const DV = { on: false, paused: false, tab: null, list: [], i: 0, step: 0, gap: 3, seq: true, el: null, lock: null, misses: 0, rate: 1 };
try { DV.rate = +localStorage.getItem('loop-drive-rate') || 1; } catch {}
const DRIVE_TABS = {
  practice: { auto: 'autoPractice', gap: 'autoPracticeGap', pool: () => eligible(), seq: () => $('order').value === 'sequence' && $('deck').value !== 'all', cur: () => current },  // '모든 묶음 섞기'면 섞어서
  gram: { auto: 'autoGram', gap: 'autoGramGap', pool: () => gramPool(), seq: () => $('gramOrder').value === 'sequence' && G.lesson !== 'mix', cur: () => G.current },
  words: { auto: 'autoWords', gap: 'autoWordsGap', pool: () => wordPool(), seq: () => $('wordOrder').value === 'sequence', cur: () => W.current },
};
(function initDrive() {
  const st = document.createElement('style');
  st.textContent = `.drive-btn{margin-left:6px}
    #drivePanel{position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:50;width:min(560px,calc(100% - 24px));background:#18223b;color:#fff;border-radius:18px;padding:12px 14px 10px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
    #drivePanel .dv-top{display:flex;justify-content:space-between;font-size:12px;color:#aab6d3}
    #drivePanel .dv-ko{font-size:20px;font-weight:800;margin:6px 0 2px;word-break:keep-all}#drivePanel .dv-en{min-height:22px;color:#9fc0ff;font-size:16px}
    #drivePanel .dv-btns{display:grid;grid-template-columns:1fr 1.4fr 1fr 1fr;gap:6px;margin-top:8px}#drivePanel button{min-height:44px;background:#2b3858;color:#fff;border:0;border-radius:12px;font-size:16px}
    #drivePanel button.dv-main{background:#1d49e8}
    #drivePanel .dv-set{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin-top:8px;font-size:12px;color:#aab6d3}#drivePanel .dv-set button{min-height:32px;padding:2px 10px;font-size:13px}#drivePanel .dv-set button.on{background:#1d49e8}#drivePanel .dv-note{font-size:11px;color:#8d99b8;margin:6px 0 0}`;
  document.head.appendChild(st);
  const p = document.createElement('div'); p.id = 'drivePanel'; p.hidden = true;
  p.innerHTML = '<div class="dv-top"><span>🚗 운전 모드 · 듣기 전용</span><span id="dvPos"></span></div><div class="dv-ko" id="dvKo"></div><div class="dv-en" lang="en" id="dvEn"></div>' +
    '<div class="dv-btns"><button id="dvPrev" aria-label="이전 카드">⏮</button><button id="dvPlay" class="dv-main">⏸ 일시정지</button><button id="dvNext" aria-label="다음 카드">⏭</button><button id="dvStop">■ 끝내기</button></div>' +
    '<div class="dv-set"><span>속도</span>' + [1, 1.25, 1.5].map(r => `<button data-dvrate="${r}">${r}배</button>`).join('') + '<span>간격</span>' + [1, 2, 3, 5].map(g => `<button data-dvgap="${g}">${g}초</button>`).join('') + '</div>' +
    '<p class="dv-note">한국어 → 영어로 말해 보기 → 영어 정답. 채점 기록은 남지 않아요. 이어폰 버튼으로도 멈추고 넘길 수 있어요.</p>';
  document.body.appendChild(p);
  const m = document.createElement('script'); m.src = 'audio-ko.js'; document.head.appendChild(m);
  const add = () => Object.entries(DRIVE_TABS).forEach(([tab, t]) => {
    const a = $(t.auto); if (!a || $('drive-' + tab)) return;
    const b = document.createElement('button'); b.id = 'drive-' + tab; b.className = 'auto drive-btn'; b.textContent = '🚗 운전 모드';
    b.onclick = () => startDrive(tab); a.after(b);
  });
  add(); setTimeout(add, 1500); setTimeout(add, 4000);  // 문법 화면은 조금 늦게 만들어진다
  $('dvPlay').onclick = () => DV.paused ? resumeDrive() : pauseDrive();
  p.addEventListener('click', e => { const r = e.target.closest('[data-dvrate]'), g = e.target.closest('[data-dvgap]');
    if (r) { DV.rate = +r.dataset.dvrate; try { localStorage.setItem('loop-drive-rate', DV.rate); } catch {} if (DV.el && DV.el.src !== DRIVE_SILENCE) DV.el.playbackRate = DV.rate; }
    if (g) { DV.gap = +g.dataset.dvgap; if (DV.step > 2 * DV.gap + 1) DV.step = 2 * DV.gap + 1; }
    if (r || g) markDriveSet(); });
  $('dvNext').onclick = () => jumpDrive(1); $('dvPrev').onclick = () => jumpDrive(-1); $('dvStop').onclick = stopDrive;
})();
let driveKoLoad = null;
function loadKoPacks() {
  const packs = window.AUDIO_KO?.packs || [];
  if (!packs.length) return Promise.resolve();
  return driveKoLoad = driveKoLoad || Promise.all(packs.map(src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = s.onerror = res; document.head.appendChild(s); })));
}
function koSrc(c) { const k = window.AUDIO_KO?.files || {}, f = k[koText(c).trim()] || k[(c.ko || '').trim()]; return !f ? '' : window.AUDIO_KO_DATA?.[f] ? 'data:audio/mpeg;base64,' + window.AUDIO_KO_DATA[f] : window.AUDIO_KO?.packs ? '' : 'audio-ko/' + f; }
function enSrc(c) { const f = window.AUDIO?.files?.[(c.en || '').trim()]; return !f ? '' : window.AUDIO_DATA?.[f] ? 'data:audio/mpeg;base64,' + window.AUDIO_DATA[f] : 'audio/' + f; }
function markDriveSet() { document.querySelectorAll('[data-dvrate]').forEach(b => b.classList.toggle('on', +b.dataset.dvrate === DV.rate)); document.querySelectorAll('[data-dvgap]').forEach(b => b.classList.toggle('on', +b.dataset.dvgap === DV.gap)); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
async function startDrive(tab) {
  const t = DRIVE_TABS[tab]; if (DV.on) stopDrive();
  stopAuto(); stopAudio();
  const list = [...t.pool()];
  if (!list.length) { $('dvKo').textContent = '이 조건에 맞는 카드가 없어요. 반복 방식이나 묶음을 바꿔 주세요.'; $('dvEn').textContent = ''; $('drivePanel').hidden = false; setTimeout(() => { if (!DV.on) $('drivePanel').hidden = true; }, 3000); return; }
  Object.assign(DV, { on: true, paused: false, tab, seq: t.seq(), gap: Math.max(1, +$(t.gap).value || 3), misses: 0 });
  DV.list = DV.seq ? list : shuffle(list);
  const cur = t.cur(); DV.i = Math.max(0, cur ? DV.list.findIndex(c => c.id === cur.id) : 0);
  DV.el = DV.el || new Audio();
  DV.el.onended = () => { driveAdvance(); drivePlay(); };
  DV.el.onerror = () => { driveAdvance(); drivePlay(); };
  $('dvPlay').textContent = '⏸ 일시정지'; markDriveSet();
  $('drivePanel').hidden = false; document.body.style.paddingBottom = '230px';
  // 아이폰: 버튼을 누른 순간 소리를 내야 이후 자동 재생이 허락된다. 무음 1초를 틀면서 한국어 음성을 불러온다.
  DV.step = -1; renderDrive(DV.list[DV.i], false);
  DV.el.src = DRIVE_SILENCE; DV.el.play().catch(() => {});
  setupMediaSession();
  try { if (navigator.wakeLock) DV.lock = await navigator.wakeLock.request('screen'); } catch {}
  await loadKoPacks(); DV.koReady = true;
}
function driveAdvance() {
  DV.step++;
  if (DV.step > 2 * DV.gap + 1) { DV.step = 0; DV.i++; if (DV.i >= DV.list.length) { DV.i = 0; if (!DV.seq) shuffle(DV.list); } }
}
function drivePlay() {
  if (!DV.on || DV.paused) return;
  const c = DV.list[DV.i]; if (!c) return stopDrive();
  let src = DRIVE_SILENCE;
  // 한국어 음성 묶음을 아직 불러오는 중이면 무음으로 잠깐 기다린다
  if (DV.step === 0 && window.AUDIO_KO?.packs && !DV.koReady) { DV.step = -1; DV.el.src = DRIVE_SILENCE; DV.el.play().catch(() => pauseDrive()); return; }
  if (DV.step === 0) { renderDrive(c, false); src = koSrc(c); }
  else if (DV.step === DV.gap + 1) { renderDrive(c, true); src = enSrc(c); }
  if (!src) { if (++DV.misses > 50) return stopDrive(); driveAdvance(); return drivePlay(); }
  DV.misses = 0; DV.el.src = src; const rate = src === DRIVE_SILENCE ? 1 : DV.rate; DV.el.defaultPlaybackRate = rate; DV.el.playbackRate = rate;
  DV.el.play().catch(() => pauseDrive());
}
function renderDrive(c, showEn) {
  if (!c) return;
  $('dvPos').textContent = (DV.i + 1) + ' / ' + DV.list.length;
  $('dvKo').textContent = koText(c); $('dvEn').textContent = showEn ? c.en : '';
  if ('mediaSession' in navigator && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: koText(c), artist: showEn ? c.en : 'LOOP 운전 모드', album: 'LOOP' });
}
function pauseDrive() { if (!DV.on) return; DV.paused = true; DV.el.pause(); $('dvPlay').textContent = '▶ 계속 듣기'; }
function resumeDrive() { if (!DV.on) return; DV.paused = false; $('dvPlay').textContent = '⏸ 일시정지'; if (DV.el.currentTime > 0 && !DV.el.ended) DV.el.play().catch(() => pauseDrive()); else drivePlay(); }
function jumpDrive(d) { if (!DV.on) return; DV.i = (DV.i + d + DV.list.length) % DV.list.length; DV.step = 0; DV.paused = false; $('dvPlay').textContent = '⏸ 일시정지'; drivePlay(); }
function stopDrive() {
  if (!DV.on) return; DV.on = false; DV.el?.pause(); $('drivePanel').hidden = true; document.body.style.paddingBottom = '';
  try { DV.lock?.release(); } catch {} DV.lock = null;
  if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = null; } catch {} }
}
function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const h = { play: resumeDrive, pause: pauseDrive, nexttrack: () => jumpDrive(1), previoustrack: () => jumpDrive(-1), stop: stopDrive };
  for (const [k, f] of Object.entries(h)) { try { navigator.mediaSession.setActionHandler(k, f); } catch {} }
}
document.addEventListener('visibilitychange', async () => { if (!document.hidden && DV.on && !DV.lock) { try { DV.lock = await navigator.wakeLock?.request('screen'); } catch {} } });

// ── 문제를 한국어 음성으로 읽어 주기(기초 말하기) ──
const KO_Q = { on: false, el: new Audio() };
(function initKoQuestion() {
  try { KO_Q.on = localStorage.getItem('loop-ko-question') === '1'; } catch {}
  const lab = document.createElement('label'); lab.className = 'check';
  lab.innerHTML = '<input type="checkbox" id="koQuestion"> 문제를 한국어 음성으로 읽어 주기';
  $('autovoice').closest('label').after(lab); $('koQuestion').checked = KO_Q.on;
  $('koQuestion').addEventListener('change', e => { KO_Q.on = e.target.checked; try { localStorage.setItem('loop-ko-question', KO_Q.on ? '1' : '0'); } catch {} if (KO_Q.on) { loadKoPacks(); playKoQuestion(); } });
  if (KO_Q.on) loadKoPacks();
  let last = null;
  new MutationObserver(() => { if (current && current.id !== last) { last = current.id; playKoQuestion(); } }).observe($('korean'), { childList: true, characterData: true, subtree: true });
})();
async function playKoQuestion() {
  if (!KO_Q.on || DV.on || SP.on || !current || document.hidden || AUTO_BUSY()) return;
  const c = current; await loadKoPacks(); if (c !== current || shown) return;
  const src = koSrc(c); if (!src) return;
  KO_Q.el.src = src; KO_Q.el.play().catch(() => {});
}

// ── 🎙️ 말하기 운전 모드: 한국어 → 삑 → 내가 영어로 말함 → 자동 판정 → 딩동/땡 → 영어 정답 → 기록 → 다음 ──
const SP = { on: false, paused: false, el: null, rec: null, token: 0, ok: 0, no: 0, lock: null, ctx: null };
const SR_API = window.SpeechRecognition || window.webkitSpeechRecognition;
(function initSpeak() {
  const st = document.createElement('style');
  st.textContent = `#speakPanel{position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:51;width:min(560px,calc(100% - 24px));background:#18223b;color:#fff;border-radius:18px;padding:12px 14px 10px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
    #speakPanel .dv-top{display:flex;justify-content:space-between;font-size:12px;color:#aab6d3}#speakPanel .sp-ko{font-size:20px;font-weight:800;margin:6px 0 2px;word-break:keep-all}
    #speakPanel .sp-state{font-size:15px;min-height:24px;color:#ffd27a}#speakPanel .sp-heard{font-size:14px;color:#cdd6ea;min-height:20px}#speakPanel .sp-en{font-size:16px;color:#9fc0ff;min-height:22px}
    #speakPanel .sp-res{font-size:22px;font-weight:800}#speakPanel .sp-res.ok{color:#5ee08a}#speakPanel .sp-res.no{color:#ff8a7a}
    #speakPanel .dv-btns{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:6px;margin-top:8px}#speakPanel button{min-height:44px;background:#2b3858;color:#fff;border:0;border-radius:12px;font-size:16px}#speakPanel button.dv-main{background:#1d49e8}
    #speakPanel .dv-note{font-size:11px;color:#8d99b8;margin:6px 0 0}`;
  document.head.appendChild(st);
  const p = document.createElement('div'); p.id = 'speakPanel'; p.hidden = true;
  p.innerHTML = '<div class="dv-top"><span>🎙️ 말하기 운전 모드 · 자동 채점</span><span id="spScore"></span></div><div class="sp-ko" id="spKo"></div>' +
    '<div class="sp-state" id="spState"></div><div class="sp-heard" lang="en" id="spHeard"></div><div class="sp-res" id="spRes"></div><div class="sp-en" lang="en" id="spEn"></div>' +
    '<div class="dv-btns"><button id="spPlay" class="dv-main">⏸ 일시정지</button><button id="spSkip">⏭ 건너뛰기</button><button id="spStop">■ 끝내기</button></div>' +
    '<p class="dv-note">"삑" 소리 뒤에 영어로 말하세요. 맞으면 딩동, 틀리면 땡 → 정답을 들려주고 기록해요. 화면을 켜 둔 채로 써 주세요.</p>';
  document.body.appendChild(p);
  const b = document.createElement('button');
  b.id = 'speakDrive'; b.className = 'auto drive-btn'; b.textContent = '🎙️ 말하기 운전 모드'; b.onclick = startSpeak;
  ($('drive-practice') || $('autoPractice')).after(b);
  $('spPlay').onclick = () => SP.paused ? resumeSpeak() : pauseSpeak();
  $('spSkip').onclick = () => { if (!SP.on) return; spCancel(); next(); spRound(); };
  $('spStop').onclick = stopSpeak;
})();
function AUTO_BUSY() { const a = $('autoPractice'); return !!a && /멈추|■/.test(a.textContent); }
function spCancel() { SP.token++; try { SP.rec?.abort(); } catch {} SP.rec = null; SP.el?.pause(); }
function spPlaySrc(src) {
  return new Promise(res => {
    if (!src) return res();
    const t = SP.token, el = SP.el; let done = false; const fin = () => { if (!done) { done = true; clearInterval(w); res(); } };
    el.onended = el.onerror = fin; el.src = src; el.playbackRate = 1; el.play().catch(fin);
    const w = setInterval(() => { if (t !== SP.token) fin(); }, 300);
    setTimeout(fin, 15000);
  });
}
function spTone(kind) {
  // 삑(듣기 시작) · 딩동(정답) · 땡(오답)
  try {
    const ctx = SP.ctx = SP.ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume?.();
    const notes = { beep: [[880, 0, .15]], ok: [[784, 0, .18], [1047, .18, .3]], no: [[220, 0, .45]], none: [[20, 0, .01]] }[kind];
    for (const [f, at, len] of notes) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = kind === 'no' ? 'square' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, ctx.currentTime + at); g.gain.exponentialRampToValueAtTime(kind === 'none' ? .0002 : .25, ctx.currentTime + at + .02); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + at + len);
      o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + len + .05);
    }
    return new Promise(r => setTimeout(r, Math.max(...notes.map(n => (n[1] + n[2]) * 1000)) + 120));
  } catch { return Promise.resolve(); }
}
const spWait = ms => new Promise(r => setTimeout(r, ms));
function spListen(c) {
  // 말소리를 한 번 듣는다. 결과: 들은 문장 후보 배열(못 들으면 빈 배열, 마이크가 막히면 null)
  return new Promise(res => {
    const r = SP.rec = new SR_API(); r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 3;
    let out = []; const t = SP.token;
    const limit = setTimeout(() => { try { r.stop(); } catch {} }, 4000 + c.en.split(' ').length * 700);
    r.onresult = e => { out = [...e.results[0]].map(x => x.transcript); };
    r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') out = null; };
    r.onend = () => { clearTimeout(limit); SP.rec = null; res(t === SP.token ? out : []); };
    try { r.start(); } catch { clearTimeout(limit); res([]); }
  });
}
function spJudge(heard, c) {
  // 등록된 정답·같이 정답과 같으면 정답. 단어가 거의 다 맞으면(음성 인식이 살짝 틀린 경우) '거의 맞음'으로 정답 처리.
  if (heard.some(h => compare(h, c))) return { ok: true, near: false };
  const words = s => normalize(s).replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  const best = Math.max(0, ...heard.flatMap(h => [c.en, ...(c.alt || [])].map(a => {
    const x = words(h), y = words(a); if (!y.length) return 0;
    const pool = [...x]; let hit = 0; for (const w of y) { const k = pool.indexOf(w); if (k >= 0) { hit++; pool.splice(k, 1); } }
    return hit / Math.max(y.length, x.length);
  })));
  return { ok: best >= 0.85, near: best >= 0.85 };
}
async function startSpeak() {
  // claude.ai 앱 안(아티팩트)에서는 마이크가 막혀 있다 → Talk Loop 주소로 안내
  if (window.claude?.use) { if (confirm('claude.ai 앱 안에서는 마이크를 쓸 수 없어요. 말하기 운전 모드는 전용 LOOP 주소(사파리·크롬)에서 써 주세요. 지금 열까요?')) window.open('https://ellie1228.github.io/loop/', '_blank'); return; }
  if (!SR_API) { alert('이 브라우저는 음성 인식을 지원하지 않아요. PC 크롬·엣지 또는 아이폰 사파리에서 써 주세요.'); return; }
  stopDrive(); if (AUTO_BUSY()) $('autoPractice').click(); stopAudio();
  Object.assign(SP, { on: true, paused: false, ok: 0, no: 0 });
  SP.el = SP.el || new Audio(); SP.el.src = DRIVE_SILENCE; SP.el.play().catch(() => {}); spTone('none');  // 아이폰: 누른 순간 소리를 내 둔다
  $('speakPanel').hidden = false; document.body.style.paddingBottom = '260px'; $('spPlay').textContent = '⏸ 일시정지';
  try { if (navigator.wakeLock) SP.lock = await navigator.wakeLock.request('screen'); } catch {}
  $('spState').textContent = '준비 중…'; await loadKoPacks();
  if (!current) next();
  spRound();
}
async function spRound() {
  if (!SP.on || SP.paused) return;
  const c = current; if (!c) { $('spState').textContent = '이 조건에 맞는 카드가 없어요.'; return; }
  const t = ++SP.token, alive = () => SP.on && !SP.paused && t === SP.token && current === c;
  $('spScore').textContent = `⭕ ${SP.ok} · ❌ ${SP.no} · ${$('position').textContent}`;
  $('spKo').textContent = koText(c); $('spHeard').textContent = ''; $('spRes').textContent = ''; $('spRes').className = 'sp-res'; $('spEn').textContent = '';
  $('spState').textContent = '🔈 문제'; await spPlaySrc(koSrc(c)); if (!alive()) return;
  await spTone('beep'); if (!alive()) return;
  $('spState').textContent = '🎙️ 영어로 말하세요…';
  const heard = await spListen(c); if (!alive()) return;
  if (heard === null) { pauseSpeak(); $('spState').textContent = '마이크가 막혀 있어요. 브라우저 설정에서 마이크를 허용해 주세요.'; return; }
  const j = heard.length ? spJudge(heard, c) : { ok: false, near: false };
  $('spState').textContent = '';
  $('spHeard').textContent = heard.length ? '들은 말: ' + heard[0] : '말소리를 못 들었어요';
  $('spRes').textContent = j.ok ? (j.near ? '⭕ 거의 맞았어요' : '⭕ 정답!') : '❌ 다시 연습';
  $('spRes').classList.add(j.ok ? 'ok' : 'no');
  await spTone(j.ok ? 'ok' : 'no'); if (!alive()) return;
  $('spEn').textContent = c.en; await spPlaySrc(enSrc(c)); if (!alive()) return;
  if (!j.ok) { await spWait(700); if (!alive()) return; await spPlaySrc(enSrc(c)); if (!alive()) return; }  // 틀리면 정답 한 번 더
  // 기록: 기초 말하기의 O/X와 똑같이 쌓인다(오답은 '틀린 카드만'에 나옴)
  if (j.ok) SP.ok++; else SP.no++;
  pending = { source: 'speech', heard: heard[0] || '', autoCorrect: j.ok, ms: 0, assisted: false };
  shown = true; await grade(j.ok);
  await spWait(800); if (SP.on && !SP.paused) spRound();
}
function pauseSpeak() { if (!SP.on) return; SP.paused = true; spCancel(); $('spPlay').textContent = '▶ 계속하기'; $('spState').textContent = '⏸ 멈춤'; }
function resumeSpeak() { if (!SP.on) return; SP.paused = false; $('spPlay').textContent = '⏸ 일시정지'; spRound(); }
function stopSpeak() {
  if (!SP.on) return; SP.on = false; spCancel(); $('speakPanel').hidden = true; document.body.style.paddingBottom = '';
  try { SP.lock?.release(); } catch {} SP.lock = null;
  status(`말하기 운전 모드 끝 · ⭕ ${SP.ok} · ❌ ${SP.no}`);
}
document.addEventListener('visibilitychange', async () => { if (!document.hidden && SP.on && !SP.lock) { try { SP.lock = await navigator.wakeLock?.request('screen'); } catch {} } });
