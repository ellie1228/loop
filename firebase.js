// 전용 LOOP(GitHub Pages)에서 구글 로그인 + 기록 저장(Firebase).
// - 기록·내 표현·개인 카드·메모를 users/<내 uid>/ 아래에 저장해 아이폰·PC 기록을 합친다(규칙: 본인만 읽기·쓰기).
// - 구조는 claude.ai용 cloud.js와 같다: 기기별·날짜별 기록 문서(log~기기~날짜), 카드 문서(card~id), 메모(misc/memos).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, browserLocalPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app), fs = getFirestore(app);
await setPersistence(auth, browserLocalPersistence).catch(() => {});
getRedirectResult(auth).catch(() => {});

// ── 로그인 화면 ──
const st = document.createElement('style');
st.textContent = `#authGate{position:fixed;inset:0;z-index:100;background:#f3f6fc;display:flex;align-items:center;justify-content:center;padding:24px}
  #authGate .box{background:#fff;border:1px solid #e0e6f1;border-radius:24px;padding:32px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 16px 42px #2039600f}
  #authGate .logo{display:inline-block;background:#1d49e8;color:#fff;border-radius:14px;font-size:34px;font-weight:800;padding:0 14px;margin-bottom:10px}
  #authGate h2{margin:6px 0 4px}#authGate p{color:#64708a;font-size:14px}#authGate button{width:100%;margin-top:14px}
  #authInfo{font-size:13px;color:#33436a}#authInfo button{min-height:0;padding:4px 10px;font-size:12px;margin-left:6px}`;
document.head.appendChild(st);
const gate = document.createElement('div'); gate.id = 'authGate'; gate.hidden = true;
gate.innerHTML = '<div class="box"><div class="logo">↻</div><h2>LOOP</h2><p>입에 붙는 영어 · 나만 쓰는 공부 앱</p>' +
  '<button id="authLogin" class="primary">G 구글로 로그인</button><p id="authMsg" class="small"></p>' +
  '<p class="small">로그인하면 연습 기록이 내 구글 계정 저장소에 저장돼서 아이폰·PC 어디서나 이어져요.</p></div>';
document.body.appendChild(gate);
$('authLogin').onclick = async () => {
  $('authMsg').textContent = '로그인 창을 여는 중…';
  const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (/popup-blocked|operation-not-supported|cancelled-popup/.test(e?.code || '')) { try { await signInWithRedirect(auth, provider); return; } catch {} }
    $('authMsg').textContent = e?.code === 'auth/popup-closed-by-user' ? '로그인 창이 닫혔어요. 다시 눌러 주세요.' : '로그인하지 못했어요. 다시 시도해 주세요. (' + (e?.code || '') + ')';
  }
};

// 기록 탭: 로그인 정보 · 동기화 상태 · 개인 카드 가져오기
const panel = $('export').closest('.panel');
const info = document.createElement('p'); info.id = 'authInfo'; panel.querySelector('p').after(info);
const syncMsg = document.createElement('p'); syncMsg.className = 'muted'; syncMsg.setAttribute('role', 'status'); info.after(syncMsg);
const show = t => { syncMsg.textContent = t; };
const priv = document.createElement('label'); priv.className = 'filebtn'; priv.innerHTML = '🔒 개인 카드 가져오기<input id="privImport" type="file" accept="application/json,.json">';
panel.querySelector('.row').appendChild(priv);
panel.querySelector('h2').nextElementSibling.textContent = '구글 로그인으로 내 계정 저장소에 기록이 저장돼요. 아이폰·PC 어디서 열어도 이어지고, 나만 볼 수 있어요.';

let col = null, device = '';
try { device = localStorage.getItem('loop-device') || ''; if (!device) { device = Math.random().toString(36).slice(2, 10); localStorage.setItem('loop-device', device); } } catch { device = Math.random().toString(36).slice(2, 10); }
const others = new Set(), mine = new Map(), cardSent = new Map();
const safeId = s => s.replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');

async function pull() {
  const snap = await getDocs(col); let changed = false;
  const logs = new Map(data.logs.map(l => [l.id, l])), custom = new Map(data.custom.map(c => [c.id, c]));
  snap.forEach(d => {
    const body = d.data(); if (!body) return;
    if (d.id.startsWith('log~')) {
      const own = d.id.startsWith('log~' + device + '~');
      if (own) mine.set(d.id, (body.logs || []).map(l => l.id).join());
      for (const l of body.logs || []) { if (!own) others.add(l.id); if (!logs.has(l.id) && validBackup({ version: 1, custom: [], logs: [l] })) { logs.set(l.id, l); changed = true; } }
    } else if (d.id.startsWith('card~') && body.card) {
      const c = body.card, old = custom.get(c.id); cardSent.set(c.id, c.updatedAt || '');
      if (validBackup({ version: 1, custom: [c], logs: [] }) && (!old || (c.updatedAt || '') > (old.updatedAt || ''))) { custom.set(c.id, c); changed = true; }
    } else if (d.id === 'misc~memos') window.loopMemos?.merge?.(body.memos || []);
  });
  if (changed) {
    data = { version: 1, custom: [...custom.values()], logs: [...logs.values()].sort((a, b) => Date.parse(a.time) - Date.parse(b.time)) };
    await localSave().catch(() => {}); updateToday(); refreshPatterns?.();
    if (!$('history').hidden) renderHistory(); if (!$('library').hidden) renderLibrary();
  }
}
async function push() {
  const byDay = new Map();
  for (const l of data.logs) { if (others.has(l.id)) continue; const k = 'log~' + device + '~' + l.time.slice(0, 10); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(l); }
  for (const [k, logs] of byDay) { const sig = logs.map(l => l.id).join(); if (mine.get(k) === sig) continue; await setDoc(doc(col, k), { logs }); mine.set(k, sig); }
  for (const c of data.custom) { const v = c.updatedAt || ''; if (cardSent.get(c.id) === v) continue; await setDoc(doc(col, 'card~' + safeId(c.id)), { card: c }); cardSent.set(c.id, v); }
}
const localSave = save; let busy = Promise.resolve();
save = async () => {
  let localOk = true; try { await localSave(); } catch { localOk = false; }
  if (!col) { if (!localOk) throw Error('save failed'); return; }
  const run = busy.then(push).then(() => show('내 계정에 저장됐어요. 아이폰·PC 어디서 열어도 기록이 이어져요.'), e => { show('계정 저장에 실패했어요. 다음 기록 때 다시 시도해요.'); if (!localOk) throw e; });
  busy = run.catch(() => {}); return run;
};
window.loopMemos = Object.assign(window.loopMemos || {}, { onSave: memos => { if (col) setDoc(doc(col, 'misc~memos'), { memos }).catch(() => {}); } });

// 개인 카드(자기소개 등): 공개 파일에 없고, 내 저장소에만 둔다. 처음 한 번 PC에서 파일로 넣으면 모든 기기에 보인다.
$('privImport').addEventListener('change', async e => {
  const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
  try {
    const x = JSON.parse(await f.text()); const now = new Date().toISOString();
    const list = (x.cards || []).map(c => ({ ...c, alt: c.alt || [], updatedAt: now }));
    if (!list.length || !validBackup({ version: 1, custom: list, logs: [] })) throw Error('bad');
    const ids = new Set(list.map(c => c.id)); data.custom = [...data.custom.filter(c => !ids.has(c.id)), ...list];
    await save(); show(`개인 카드 ${list.length}장을 내 계정에 저장했어요.`); refreshPatterns?.(); next?.();
  } catch { show('개인 카드 파일을 읽지 못했어요. 파일을 확인해 주세요.'); }
});

onAuthStateChanged(auth, async user => {
  gate.hidden = !!user;
  if (!user) { col = null; info.textContent = ''; return; }
  col = collection(fs, 'users', user.uid, 'data');
  info.innerHTML = `🔐 ${esc(user.email || '')} 로그인됨 <button id="authOut">로그아웃</button>`;
  $('authOut').onclick = () => { if (confirm('로그아웃할까요? 이 기기 기록은 그대로 남아요.')) signOut(auth); };
  show('기록을 맞추는 중…');
  try { await pull(); await push(); show('내 계정에 저장됐어요. 아이폰·PC 어디서 열어도 기록이 이어져요.'); }
  catch (e) { show('계정 저장소에 연결하지 못했어요. 인터넷을 확인해 주세요.'); }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && col) pull().catch(() => {}); });
