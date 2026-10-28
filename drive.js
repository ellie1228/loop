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
function koSrc(c) { const f = window.AUDIO_KO?.files?.[(c.ko || '').trim()]; return !f ? '' : window.AUDIO_KO_DATA?.[f] ? 'data:audio/mpeg;base64,' + window.AUDIO_KO_DATA[f] : window.AUDIO_KO?.packs ? '' : 'audio-ko/' + f; }
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
  $('dvKo').textContent = c.ko || ''; $('dvEn').textContent = showEn ? c.en : '';
  if ('mediaSession' in navigator && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: c.ko || '', artist: showEn ? c.en : 'LOOP 운전 모드', album: 'LOOP' });
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
