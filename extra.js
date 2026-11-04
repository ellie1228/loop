// 단어 탭 · 듣기 탭 · 툭툭 넘기기(자동 진행) 모드.
// app.js의 전역(data, save, uid, cards, esc, summary, stopAudio, modelAudio, next, reveal …)을 그대로 쓴다.
'use strict';
const WORD_LIST = (window.WORDS || []).map(w => ({ ...w, id: 'w-' + w.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 음성 재생: 미리 만든 모범 음성이 있으면 그 파일, 없으면 기기 목소리. 끝나면 resolve.
function playText(en, rate = 1) {
  const file = window.AUDIO?.files?.[en.trim()];
  window.speechSynthesis?.cancel();
  if (file) {
    modelAudio = modelAudio || new Audio();
    modelAudio.pause();
    modelAudio.src = window.AUDIO_DATA?.[file] ? 'data:audio/mpeg;base64,' + window.AUDIO_DATA[file] : 'audio/' + file;
    modelAudio.playbackRate = rate; modelAudio.preservesPitch = true; modelAudio.webkitPreservesPitch = true;
    // 아이폰에서 끝 신호가 안 와도 멈추지 않게, 15초 뒤에는 다음으로 넘어간다.
    return new Promise(res => { const t = setTimeout(res, 15000), done = () => { clearTimeout(t); res(); }; modelAudio.onended = done; modelAudio.onerror = done; modelAudio.play().catch(done); });
  }
  if (!window.speechSynthesis) return Promise.resolve();
  return new Promise(res => { const u = new SpeechSynthesisUtterance(en); u.lang = 'en-US'; u.rate = rate; u.onend = res; u.onerror = res; speechSynthesis.speak(u); });
}

async function logResult(cardId, correct, ms, kind) {
  data.logs.push({ id: uid(), cardId, time: new Date().toISOString(), correct, source: 'self', heard: '', ms: Math.round(ms), assisted: false, autoCorrect: null, kind });
  try { await save(); } catch {}
  updateToday();
}

// 가중치로 다음 카드 고르기: 처음 보는 카드·최근 틀린 카드가 더 자주 나온다.
function pickNext(pool, order, state, statFor) {
  if (!pool.length) return null;
  // 새 카드만: 남은 새 카드를 앞에서부터(건너뛴 카드는 잠시 뒤로)
  if (order === 'new') { const f = pool.find(c => !state.recent.includes(c.id)) || pool[0]; state.recent = [...state.recent, f.id].slice(-3); return f; }
  if (order === 'sequence') return pool[state.seq++ % pool.length];
  const fresh = pool.filter(c => !state.recent.includes(c.id));
  const cand = fresh.length ? fresh : pool;
  const w = cand.map(c => { const s = statFor(c.id); return !s.tries ? 4 : !s.last.correct ? 8 : s.stable ? 1 : 3; });
  let roll = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
  while (i < w.length - 1 && (roll -= w[i]) > 0) i++;
  state.recent = [...state.recent, cand[i].id].slice(-Math.min(4, pool.length - 1));
  return cand[i];
}
// 말하기와 같은 기준: 최근 3번 연속 O + 서로 다른 3일에 5초 안에 O
const statOf = kind => id => {
  const logs = logsByCard().get(kind + '|' + id) || [], last = logs.slice(-3);
  const days = new Set(logs.filter(x => x.correct && x.ms <= 5000).map(x => new Date(x.time).toLocaleDateString())).size;
  return { tries: logs.length, wrong: logs.filter(x => !x.correct).length, last: logs.at(-1), lastTwo: logs.slice(-2), days, stable: last.length === 3 && last.every(x => x.correct) && days >= 3 };
};

// 말하기 기록에 듣기·단어 기록이 섞이지 않게 한다.
// 기록이 쌓여도 느려지지 않게, 카드별 기록을 한 번만 나눠 두고 기록이 바뀔 때만 다시 나눈다.
const logIndex = { key: '', byCard: new Map() };
function logsByCard() {
  const key = data.logs.length + ':' + (data.logs.at(-1)?.id || '');
  if (logIndex.key !== key) { logIndex.key = key; logIndex.byCard = new Map(); for (const x of data.logs) { const k = (x.kind || 'speak') + '|' + x.cardId; if (!logIndex.byCard.has(k)) logIndex.byCard.set(k, []); logIndex.byCard.get(k).push(x); } }
  return logIndex.byCard;
}
summary = (orig => id => { const all = data.logs; data.logs = logsByCard().get('speak|' + id) || []; try { return orig(id); } finally { data.logs = all; } })(summary);

// ---------- 툭툭 넘기기 공통 ----------
const AUTO_BTN = { practice: 'autoPractice', words: 'autoWords', listen: 'autoListen' };
const auto = { on: null, token: 0, lock: null };
async function wake(on) {
  try { if (on && !auto.lock && navigator.wakeLock) auto.lock = await navigator.wakeLock.request('screen'); if (!on && auto.lock) { await auto.lock.release(); auto.lock = null; } } catch { auto.lock = null; }
}
function stopAuto() {
  if (!auto.on) return;
  const btn = $(AUTO_BTN[auto.on]);
  btn.textContent = '▶ 툭툭 넘기기'; btn.classList.remove('running');
  auto.on = null; auto.token++; wake(false);
}
// 아이폰은 버튼을 누른 그 순간에 소리를 한 번 내야, 그 뒤 자동 재생을 허락한다(짧은 무음 재생).
const SILENT_MP3 = 'data:audio/mpeg;base64,//NAxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEWwAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
function unlockAudio() {
  try { modelAudio = modelAudio || new Audio(); modelAudio.src = SILENT_MP3; modelAudio.play().catch(() => {}); } catch {}
}
async function runAuto(tab, step) {
  if (auto.on === tab) { stopAuto(); stopAudio(); return; }
  stopAuto(); auto.on = tab; const token = ++auto.token;
  unlockAudio();
  const btn = $(AUTO_BTN[tab]);
  btn.textContent = '■ 멈추기'; btn.classList.add('running'); wake(true);
  await sleep(300);
  while (auto.on === tab && auto.token === token) {
    // 화면이 잠깐 가려져도 멈추지 않고, 다시 보이면 이어서 진행한다.
    while (document.hidden && auto.on === tab && auto.token === token) await sleep(500);
    await step(() => auto.on === tab && auto.token === token);
  }
}
// 화면이 다시 켜지면 화면 꺼짐 방지를 다시 건다(가려지면 기기가 자동으로 풀어 버림).
document.addEventListener('visibilitychange', () => { if (!document.hidden && auto.on) { auto.lock = null; wake(true); } });

// ---------- 말하기 탭: 툭툭 넘기기 ----------
$('autoPractice').onclick = () => runAuto('practice', async alive => {
  if (!current) return stopAuto();
  if (shown) next();
  const gap = +$('autoPracticeGap').value * 1000;
  $('countdown').textContent = '툭툭 넘기기 중 · 영어로 말해 보세요';
  await sleep(gap); if (!alive()) return;
  const ac = $('autovoice').checked; $('autovoice').checked = false; reveal(); $('autovoice').checked = ac;
  await playText(current.en); if (!alive()) return;
  await sleep(gap); if (!alive()) return;  // 영어 음성이 끝나고 같은 간격 뒤 다음 카드
  next();
});

// ---------- 단어 탭 ----------
const W = { current: null, shown: false, started: 0, state: { seq: 0, recent: [] } };
const wordStat = statOf('word');
function wordPool() {
  const cat = $('wordCat').value, kind = $('wordKind').value, order = $('wordOrder').value;
  let a = WORD_LIST.filter(w => cat === 'all' || w.cat === cat);
  if (kind === 'action') a = a.filter(w => w.kind === 'action'); else if (kind === 'thing') a = a.filter(w => w.kind !== 'action');
  if (order === 'wrong') a = a.filter(w => { const s = wordStat(w.id); return s.wrong && !s.stable; });
  if (order === 'new') a = a.filter(w => !wordStat(w.id).tries);
  return a;
}
function wordImage(w) {
  const m = window.WORD_IMAGES?.[w.en]; if (!m) return null;
  const data = window.WORD_IMG_DATA?.[m.file];
  return { ...m, src: data ? 'data:image/jpeg;base64,' + data : 'word-img/' + m.file };
}
function wordCredit() {
  let el = $('wordCredit');
  if (!el) { el = document.createElement('p'); el.id = 'wordCredit'; el.className = 'credit'; $('wordEmoji').after(el); }
  return el;
}
function wordNext() {
  const pool = wordPool(); W.shown = false;
  $('wordAnswer').hidden = true; $('wordGrading').hidden = true; $('wordReveal').hidden = false;
  const w = W.current = pickNext(pool, $('wordOrder').value, W.state, wordStat);
  if (!w) { $('wordEmoji').textContent = '🙂'; $('wordAsk').textContent = '이 조건에 맞는 단어가 없어요.'; $('wordHint').textContent = ''; $('wordPos').textContent = ''; return; }
  const cat = (window.WORD_CATS || []).find(c => c.id === w.cat);
  $('wordCatName').textContent = cat ? cat.emoji + ' ' + cat.title : '';
  $('wordPos').textContent = (pool.indexOf(w) + 1) + ' / ' + pool.length;
  // 사진이 있으면 사진(영어판), 없으면 이모지. 사진 아래에 만든 사람·라이선스를 작게 표시한다.
  const pic = wordImage(w);
  $('wordEmoji').classList.toggle('has-photo', !!pic);
  if (pic) { $('wordEmoji').innerHTML = `<img src="${pic.src}" alt="${esc(w.ko)}">`; } else { $('wordEmoji').textContent = w.emoji; }
  wordCredit().innerHTML = pic ? `사진: <a href="${esc(pic.page_url)}" target="_blank" rel="noopener">${esc(pic.creator)}</a> · ${esc(pic.license)}` : '';
  // 이모지만으로 헷갈리지 않게 그림 바로 아래에 한국어 뜻(기본 켜짐). 끄면 힌트가 있는 단어만 힌트 표시.
  $('wordHint').textContent = $('wordKo').checked ? w.ko : (w.hint || '');
  $('wordHint').classList.toggle('ko', $('wordKo').checked);
  $('wordKoText').hidden = $('wordKo').checked;
  $('wordAsk').textContent = w.kind === 'action' ? '이 동작을 영어로?' : '영어로?';
  $('wordEn').textContent = w.en; $('wordKoText').textContent = w.ko;
  const s = w.sentence;
  $('wordLink').hidden = !($('wordSentence').checked && s?.en);
  if (s?.en) { $('wordSentEn').textContent = s.en; $('wordSentKo').textContent = s.ko; }
  W.started = performance.now();
}
function wordReveal(sound = true) {
  if (!W.current || W.shown) return; W.shown = true; W.ms = performance.now() - W.started;
  $('wordAnswer').hidden = false; $('wordGrading').hidden = false; $('wordReveal').hidden = true;
  if (sound) playText(W.current.en);
}
async function wordGrade(ok) {
  if (!W.current || !W.shown) return;
  const w = W.current; W.current = null;
  await logResult(w.id, ok, W.ms, 'word');
  $('wordCount').innerHTML = WORD_LIST.filter(x => wordStat(x.id).stable).length + '<small>/' + WORD_LIST.length + '</small>';
  wordNext();
}
$('wordCat').innerHTML = '<option value="all">모든 장면 섞기</option>' + (window.WORD_CATS || []).map(c => `<option value="${esc(c.id)}">${esc(c.emoji + ' ' + c.title)} (${WORD_LIST.filter(w => w.cat === c.id).length})</option>`).join('');
['wordCat', 'wordKind', 'wordOrder', 'wordKo', 'wordSentence'].forEach(id => $(id).onchange = () => { W.state = { seq: 0, recent: [] }; wordNext(); });
$('wordReveal').onclick = () => wordReveal();
$('wordRight').onclick = () => wordGrade(true);
$('wordWrong').onclick = () => wordGrade(false);
$('wordSkip').onclick = wordNext;
$('wordListen').onclick = () => W.current && playText(W.current.en);
$('wordSentPlay').onclick = () => W.current?.sentence?.en && playText(W.current.sentence.en);
$('autoWords').onclick = () => runAuto('words', async alive => {
  if (!W.current || W.shown) wordNext();
  if (!W.current) return stopAuto();
  await sleep(+$('autoWordsGap').value * 1000); if (!alive()) return;
  wordReveal(false); await playText(W.current.en); if (!alive()) return;
  if ($('wordSentence').checked && W.current.sentence?.en) { await sleep(500); if (!alive()) return; await playText(W.current.sentence.en); if (!alive()) return; }
  await sleep(+$('autoWordsGap').value * 1000); if (!alive()) return;
  wordNext();
});

// ---------- 듣기 탭 ----------
const L = { current: null, shown: false, started: 0, state: { seq: 0, recent: [] } };
const listenStat = statOf('listen');
const MODE_INFO = {
  meaning: '영어 소리만 나와요. 뜻을 떠올린 뒤 정답을 확인하고 O/X를 눌러요.',
  shadow: '소리를 들으면서 바로 따라 말해요. 채점 없이 다음 문장으로 넘어가요.',
  answer: '질문을 듣고 영어로 대답해 보세요. 뜻을 확인하고 O/X를 눌러요.',
};
function listenPool() {
  const deck = $('listenDeck').value, mode = $('listenMode').value;
  let a = cards().filter(c => !c.image && (/^all/.test(deck) || c.deck === deck));
  if (mode === 'answer') a = a.filter(c => /\?\s*$/.test(c.en));
  return a;
}
async function listenPlay() {
  if (!L.current) return;
  const n = $('listenMode').value === 'shadow' ? +$('listenRepeat').value : 1, rate = +$('listenRate').value;
  const c = L.current;
  for (let i = 0; i < n && L.current === c; i++) { await playText(c.en, rate); if (i < n - 1) await sleep(Math.max(1500, c.en.length * 70)); }
  if (L.current === c && L.heardAt == null) L.heardAt = performance.now();
}
function listenNext(play = true) {
  const mode = $('listenMode').value; L.shown = false;
  $('listenModeInfo').textContent = MODE_INFO[mode];
  $('listenRepeatLabel').hidden = mode !== 'shadow';
  $('listenTextLabel').hidden = mode !== 'shadow';
  const pool = listenPool();
  const c = L.current = pickNext(pool, 'smart', L.state, listenStat);
  $('listenAnswer').hidden = true; $('listenGrading').hidden = true;
  if (!c) { $('listenAsk').textContent = '이 조건에 맞는 문장이 없어요.'; $('listenReveal').hidden = true; $('listenNext').hidden = true; return; }
  $('listenDeckName').textContent = DECKS.find(d => d.id === c.deck)?.title || '내 표현';
  $('listenPos').textContent = pool.length + '문장';
  $('listenEn').textContent = c.en; $('listenKo').textContent = c.ko + (c.context ? ' · ' + c.context : '');
  $('listenPreview').textContent = c.en;
  $('listenPreview').hidden = !(mode === 'shadow' && $('listenText').checked);
  $('listenAsk').textContent = mode === 'shadow' ? '들으면서 바로 따라 말해 보세요.' : mode === 'answer' ? '질문을 듣고 영어로 대답해 보세요.' : '무슨 뜻일까요? ▶를 눌러 다시 들을 수 있어요.';
  $('listenReveal').hidden = mode === 'shadow'; $('listenNext').hidden = mode !== 'shadow';
  if (mode === 'shadow') { $('listenAnswer').hidden = false; }
  L.started = performance.now(); L.heardAt = null;
  if (play) listenPlay();
}
function listenReveal() {
  if (!L.current || L.shown || $('listenMode').value === 'shadow') return; L.shown = true;
  // 소리를 끝까지 듣기 전에 정답을 열면 '바로 알아들음'으로 치지 않는다.
  L.ms = L.heardAt == null ? 60000 : performance.now() - L.heardAt;
  $('listenAnswer').hidden = false; $('listenGrading').hidden = false; $('listenReveal').hidden = true;
}
async function listenGrade(ok) {
  if (!L.current || !L.shown) return;
  const c = L.current; L.current = null;
  await logResult(c.id, ok, L.ms, 'listen');
  listenNext();
}
$('listenDeck').innerHTML = '<option value="all">모든 묶음 섞기</option>' + DECKS.map(d => `<option value="${esc(d.id)}">${esc(d.title)}</option>`).join('');
['listenMode', 'listenDeck'].forEach(id => $(id).onchange = () => { L.state = { seq: 0, recent: [] }; listenNext(false); });
$('listenText').onchange = () => { $('listenPreview').hidden = !$('listenText').checked; };
$('listenPlay').onclick = listenPlay;
$('listenReveal').onclick = listenReveal;
$('listenRight').onclick = () => listenGrade(true);
$('listenWrong').onclick = () => listenGrade(false);
$('listenNext').onclick = () => listenNext();
$('listenSkip').onclick = () => listenNext();
$('autoListen').onclick = () => runAuto('listen', async alive => {
  if (!L.current || L.shown) listenNext(false);
  if (!L.current) return stopAuto();
  await listenPlay(); if (!alive()) return;
  await sleep(+$('autoListenGap').value * 1000); if (!alive()) return;
  if ($('listenMode').value !== 'shadow') { listenReveal(); await sleep(2500); if (!alive()) return; }
  listenNext(false);
});

// ---------- 기록 탭: 단계별 진행 ----------
// 기록 탭 한 줄: 막대 + 단계별 개수와 비율 + [새 카드 연습하기]
const PROGRESS_ROWS = [];
function progressRow(name, list, stat, unit, startNew) {
  const n = levelCounts(list, stat), total = list.length || 1, pct = k => { const v = Math.round(n[k] / total * 100); return n[k] && !v ? '1% 미만' : v + '%'; };
  const idx = PROGRESS_ROWS.push(startNew) - 1;
  return `<div class="row-lv"><b>${name} <small>${list.length}${unit}</small></b>${levelBar(n, list.length)}<span class="legend">${['mastered', 'familiar', 'learning', 'new'].map(k => `<span>${LEVELS[k].dot} ${LEVELS[k].name} ${n[k]} (${pct(k)})</span>`).join('')}</span>${startNew && n.new ? `<button class="lvbtn" data-progressnew="${idx}">⚪ 새 카드 ${n.new}${unit === '개' ? '개' : '장'} 연습하기</button>` : ''}</div>`;
}
function startNewIn(tab, orderId, extra) {
  const el = $(orderId); el.value = 'new';
  setTab(tab); extra?.(); el.dispatchEvent(new Event('change'));
}
function renderProgress() {
  PROGRESS_ROWS.length = 0;
  const legend = '<div class="lv-legend"><span>🟢 <b>완전히 외움</b> 최근 3번 연속 O + 서로 다른 3일에 5초 안에 O</span><span>🟡 <b>익숙함</b> 최근 2번 연속 O</span><span>🟠 <b>연습 중</b> 해봤지만 아직 연속 O가 부족하거나 마지막에 X</span><span>⚪ <b>새 카드</b> 아직 안 해봄</span></div>';
  const rows = [
    progressRow('기초 말하기', cards().filter(c => !c.image), summary, '문장', () => startNewIn('practice', 'order', () => { setSpeakMode('basic'); $('deck').value = 'all'; $('stage').value = 'ordered'; refreshPatterns(); })),
    ...(window.EXTRA_PROGRESS || []).map(f => f()),
    progressRow('단어', WORD_LIST, wordStat, '개', () => startNewIn('words', 'wordOrder', () => { $('wordCat').value = 'all'; $('wordKind').value = 'all'; })),
    progressRow('듣기', cards().filter(c => !c.image), listenStat, '문장', null),
  ].join('');
  $('progress').innerHTML = '<h2>얼마나 외웠나</h2>' + legend + rows + '<p class="muted small">완전히 외움은 서로 다른 3일에 맞혀야 해서, 빨라도 3일째부터 올라가요. 듣기는 듣기 탭에서 새 문장이 더 자주 나와요.</p>';
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-progressnew]'); if (b) PROGRESS_ROWS[+b.dataset.progressnew]?.();
  const d = e.target.closest('[data-startnew]');
  if (d) { $('deck').value = d.dataset.startnew; $('stage').value = 'ordered'; $('order').value = 'new'; seq = 0; recent = []; refreshPatterns(); setTab('practice'); setSpeakMode('basic'); next(); }
});
renderHistory = (orig => () => { orig(); renderProgress(); })(renderHistory);

// ---------- 탭 전환 · 단축키 ----------
setTab = (orig => name => { stopAuto(); orig(name); if (name === 'words' && !W.current) wordNext(); if (name === 'listen' && !L.current) listenNext(false); })(setTab);
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
document.addEventListener('keydown', e => {
  const tab = !$('words').hidden ? 'words' : !$('listen').hidden ? 'listen' : null;
  if (!tab || /INPUT|TEXTAREA|SELECT|AUDIO|SUMMARY/.test(e.target.tagName) || e.isComposing || e.keyCode === 229 || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.code;
  if (!['Space', 'Digit1', 'Numpad1', 'Digit2', 'Numpad2', 'KeyR', 'ArrowRight'].includes(k)) return;
  e.preventDefault();
  if (tab === 'words') {
    if (k === 'Space') wordReveal(); else if (/1$/.test(k)) wordGrade(false); else if (/2$/.test(k)) wordGrade(true);
    else if (k === 'KeyR' && W.current) playText(W.current.en); else if (k === 'ArrowRight') wordNext();
  } else {
    if (k === 'Space') { if (L.shown || $('listenMode').value === 'shadow') listenPlay(); else listenReveal(); }
    else if (/1$/.test(k)) listenGrade(false); else if (/2$/.test(k)) listenGrade(true);
    else if (k === 'KeyR') listenPlay(); else if (k === 'ArrowRight') listenNext();
  }
});
// 그림 단어는 단어 탭으로 옮겼으므로 말하기 탭의 '카드 종류'는 숨긴다(내 표현 그림 카드는 그대로 나온다).
$('visual').value = 'mixed'; $('visual').closest('label').hidden = true;
$('wordCount').innerHTML = WORD_LIST.filter(x => wordStat(x.id).stable).length + '<small>/' + WORD_LIST.length + '</small>';

// 말하기 묶음 메뉴에 '전체 묶음 순서대로'(01번 묶음부터 끝까지 차례대로)를 더한다.
// 한 묶음 연습 → 전체 쭉 → 모든 묶음 섞기 순서로 넓혀 갈 수 있게.
(function () {
  const sel = $('deck'); if (!sel) return;
  // 묶음 목록은 앱이 나중에 채우므로, 채워질 때마다 이 항목이 있는지 확인해 넣는다.
  // 여러 묶음 고르기: 고른 묶음만 모아 연습·운전 모드로 반복한다(고른 목록은 이 기기에 기억).
  let multi = []; try { multi = JSON.parse(localStorage.getItem('loop-multi-decks') || '[]'); } catch {}
  const multiLabel = () => multi.length ? `고른 묶음만 (${multi.length}개) · 다시 고르기` : '여러 묶음 고르기…';
  const addOpt = () => { const all = sel.querySelector('[value="all"]'); if (!all || sel.querySelector('[value="allseq"]')) return;
    const o = document.createElement('option'); o.value = 'allseq'; o.textContent = '전체 묶음 순서대로 (01번부터)'; all.before(o);
    const m = document.createElement('option'); m.value = 'multi'; m.textContent = multiLabel(); all.after(m); };
  const pick = document.createElement('div'); pick.id = 'multiPick'; pick.hidden = true;
  pick.innerHTML = '<div class="mp-box"><h3>연습할 묶음 고르기</h3><div id="mpList"></div><div class="mp-btns"><button id="mpNone">모두 해제</button><button id="mpOk" class="primary">이 묶음만 연습</button></div></div>';
  document.body.appendChild(pick);
  const st = document.createElement('style');
  st.textContent = '#multiPick{position:fixed;inset:0;z-index:60;background:rgba(24,34,59,.45);display:flex;align-items:center;justify-content:center;padding:16px}#multiPick[hidden]{display:none}#multiPick .mp-box{background:#fff;border-radius:18px;padding:16px;width:min(460px,100%);max-height:85vh;display:flex;flex-direction:column}#multiPick h3{margin:0 0 8px}#mpList{overflow:auto;display:grid;gap:2px;margin-bottom:10px}#mpList label{display:flex;gap:8px;align-items:center;padding:6px 4px;font-weight:400}#multiPick .mp-btns{display:grid;grid-template-columns:1fr 2fr;gap:8px}';
  document.head.appendChild(st);
  const openPick = () => { $('mpList').innerHTML = DECKS.filter(d => cards().some(c => c.deck === d.id)).map(d => `<label><input type="checkbox" value="${esc(d.id)}" ${multi.includes(d.id) ? 'checked' : ''}> ${esc(d.title)} <small class="muted">(${cards().filter(c => c.deck === d.id).length})</small></label>`).join(''); pick.hidden = false; };
  $('mpNone').onclick = () => pick.querySelectorAll('input').forEach(i => { i.checked = false; });
  $('mpOk').onclick = () => { multi = [...pick.querySelectorAll('input:checked')].map(i => i.value); try { localStorage.setItem('loop-multi-decks', JSON.stringify(multi)); } catch {}
    pick.hidden = true; sel.querySelector('[value="multi"]').textContent = multiLabel(); if (!multi.length) sel.value = 'all'; seq = 0; recent = []; refreshPatterns(); next(); };
  sel.addEventListener('change', () => { if (sel.value === 'multi') openPick(); });
  addOpt(); new MutationObserver(addOpt).observe(sel, { childList: true });
  eligible = (orig => () => {
    if (sel.value !== 'allseq' && sel.value !== 'multi') return orig();
    const v = sel.value; sel.value = 'all'; let a; try { a = orig(); } finally { sel.value = v; }
    if (v === 'multi') a = a.filter(c => multi.includes(c.deck));
    const rank = new Map(DECKS.map((d, i) => [d.id, i]));
    return a.map((c, i) => [c, i]).sort((x, y) => (rank.get(x[0].deck) ?? 999) - (rank.get(y[0].deck) ?? 999) || x[1] - y[1]).map(x => x[0]);
  })(eligible);
  sel.addEventListener('change', () => { if (sel.value === 'allseq' && $('order').value !== 'sequence') { $('order').value = 'sequence'; seq = 0; recent = []; next(); } });
  // 앱이 이 항목을 기억해 두었다가 처음 열 때 고르면, 위 처리가 붙기 전이라 '카드 없음'이 뜰 수 있다 → 다시 뽑는다.
  const fixFirst = () => { if (/^(allseq|multi)$/.test(sel.value) && !current && eligible().length) next(); };
  [0, 600, 2000].forEach(ms => setTimeout(fixFirst, ms));
})();
// 반복 방식 선택을 기억한다(처음엔 '순서대로', 나중에 '오답 우선'으로 바꾸면 그대로 유지).
['order', 'stage', 'drillOrder', 'wordOrder', 'bizOrder'].forEach(id => {
  const el = $(id); if (!el) return;
  try { const v = localStorage.getItem('loop-sel-' + id); if (v && [...el.options].some(o => o.value === v)) el.value = v; } catch {}
  el.addEventListener('change', () => { try { localStorage.setItem('loop-sel-' + id, el.value); } catch {} });
});

// 학습 단계 메뉴에 이 묶음에서 몇 문장이 나오는지 표시한다.
const STAGE_LABEL = { ordered: '전체 · 기초부터 순서대로', core: '기초 필수부터', pattern: '같은 틀로 바꿔 말하기', extended: '상황 확장', all: '모든 단계 섞기' };
function updateStageCounts() {
  let picked = []; try { picked = JSON.parse(localStorage.getItem('loop-multi-decks') || '[]'); } catch {}
  const deck = /^all/.test($('deck').value) ? 'all' : $('deck').value, inDeck = cards().filter(c => deck === 'all' || c.deck === deck || (deck === 'multi' && picked.includes(c.deck)));
  const patternIds = new Set(PATTERNS.filter(p => deck === 'all' || p.deck === deck).flatMap(p => p.cardIds));
  const n = { ordered: inDeck.length, all: inDeck.length, core: inDeck.filter(c => (c.stage || 'core') === 'core').length, extended: inDeck.filter(c => c.stage === 'extended').length, pattern: cards().filter(c => patternIds.has(c.id)).length };
  [...$('stage').options].forEach(o => { if (STAGE_LABEL[o.value]) o.textContent = `${STAGE_LABEL[o.value]} (${n[o.value]})`; });
}
refreshPatterns = (orig => () => { orig(); updateStageCounts(); })(refreshPatterns);

// 단어 탭 체크 칸(한국어 뜻·예문 보기) 선택을 기억한다.
['wordKo', 'wordSentence'].forEach(id => {
  const el = $(id); if (!el) return;
  try { const v = localStorage.getItem('loop-chk-' + id); if (v !== null) el.checked = v === '1'; } catch {}
  el.addEventListener('change', () => { try { localStorage.setItem('loop-chk-' + id, el.checked ? '1' : '0'); } catch {} });
});

// 원어민 소리 줄(🔊)과 강세 보기: 카드의 say(한글 소리)·stress(세게 읽는 단어)를 정답 아래에 보여 준다.
(() => {
  const en = $('english'); if (!en) return;
  const line = document.createElement('p'); line.id = 'sayLine'; line.hidden = true;
  const tog = document.createElement('button'); tog.id = 'stressToggle'; tog.className = 'textbutton';
  en.after(line); line.after(tog);
  let on = true; try { on = localStorage.getItem('loop-stress') !== '0'; } catch {}
  const esc2 = s => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  let last = null;
  function draw() {
    const c = typeof current !== 'undefined' && current; if (!c) return;
    const stress = c.stress || [];
    if (on && stress.length) {
      const set = new Set(stress.map(w => w.toLowerCase()));
      en.innerHTML = c.en.split(/(\s+)/).map(t => { const w = t.replace(/^[^\w']+|[^\w']+$/g, ''); return w && set.has(w.toLowerCase()) ? `<b class="stress">${esc2(t)}</b>` : esc2(t); }).join('');
      en.classList.add('stressed');
    } else { en.textContent = c.en; en.classList.remove('stressed'); }
    line.hidden = !c.say; line.innerHTML = c.say ? `🔊 <span class="say-label">원어민 소리</span> ${esc2(c.say)}` : '';
    tog.hidden = !stress.length; tog.textContent = on ? '강세 보기 끄기' : '강세 보기 켜기';
    last = en.innerHTML;
  }
  new MutationObserver(() => { if (en.innerHTML !== last) draw(); }).observe(en, { childList: true, characterData: true, subtree: true });
  tog.addEventListener('click', () => { on = !on; try { localStorage.setItem('loop-stress', on ? '1' : '0'); } catch {} draw(); });
})();

// ── 영어 어순 연습: 문제 방식(자연스러운 한국어 / 영어 어순 한국어), 어순 힌트, 덩어리 보기 ──
// 카드의 ko_order("나 갈게 / 집에 / 지금")와 en_chunks("I'll go / home / now.")를 쓴다.
let KO_MODE = 'natural';
try { KO_MODE = localStorage.getItem('loop-ko-mode') === 'order' ? 'order' : 'natural'; } catch {}
const koText = c => (KO_MODE === 'order' && c?.ko_order) ? c.ko_order : (c?.ko || '');
(() => {
  const st = document.createElement('style');
  st.textContent = `#orderHint{margin:0 auto}#orderHintText{color:#1d49e8;font-weight:700;font-size:18px;margin:6px 0}
    .chunk-line{font-size:14px;color:#33436a;margin:4px 0}.chunk-line .lbl{font-size:12px;color:#8a94a8;margin-right:4px}.chunk-line .ko{color:#64708a}`;
  document.head.appendChild(st);
  // 1) 문제 방식 선택(기초 말하기 왼쪽 설정)
  const lab = document.createElement('label');
  lab.innerHTML = '한국어 문제<select id="koMode"><option value="natural">자연스러운 한국어</option><option value="order">영어 어순 한국어 (덩어리)</option></select>';
  $('mode').closest('label').before(lab); $('koMode').value = KO_MODE;
  // 2) 어순 힌트 버튼(문제 아래)
  const kor = $('korean'), hint = document.createElement('button'), hintText = document.createElement('p');
  hint.id = 'orderHint'; hint.className = 'textbutton'; hint.textContent = '💡 영어 어순 힌트'; hintText.id = 'orderHintText'; hintText.hidden = true;
  kor.after(hint); hint.after(hintText);
  hint.onclick = () => { hintText.hidden = !hintText.hidden; };
  // 3) 정답 아래 덩어리 줄
  const chunk = document.createElement('p'); chunk.className = 'chunk-line'; chunk.id = 'chunkLine';
  ($('stressToggle') || $('english')).after(chunk);
  let last = null;
  function draw() {
    const c = current; if (!c) return;
    const want = c.image ? kor.textContent : koText(c);
    if (!c.image && kor.textContent !== want) kor.textContent = want;
    last = kor.textContent;
    const other = KO_MODE === 'order' ? c.ko : c.ko_order;
    hint.textContent = KO_MODE === 'order' ? '💬 자연스러운 한국어 보기' : '💡 영어 어순 힌트';
    hint.hidden = !c.ko_order || !!c.image || (KO_MODE !== 'order' && !/ \/ /.test(c.ko_order));
    hintText.textContent = other || ''; hintText.hidden = true;
    chunk.hidden = !c.en_chunks || !/ \/ /.test(c.en_chunks);
    chunk.innerHTML = c.en_chunks ? `🧩 <span class="lbl">덩어리</span><span lang="en">${esc(c.en_chunks)}</span><br><span class="ko">${esc(c.ko_order || '')}</span>` : '';
  }
  new MutationObserver(() => { if (kor.textContent !== last) draw(); }).observe(kor, { childList: true, characterData: true, subtree: true });
  $('koMode').addEventListener('change', e => { KO_MODE = e.target.value; try { localStorage.setItem('loop-ko-mode', KO_MODE); } catch {} last = null; draw(); });
  draw();
  // 4) 듣기 탭: 정답에 덩어리별 뜻(영어 순서 그대로 이해하기)
  const lko = $('listenKo'); if (lko) {
    const lc = document.createElement('p'); lc.className = 'chunk-line'; lko.after(lc);
    const drawL = () => { const c = L.current; lc.hidden = !c?.en_chunks || !/ \/ /.test(c.en_chunks); lc.innerHTML = c?.en_chunks ? `🧩 <span lang="en">${esc(c.en_chunks)}</span><br><span class="ko">${esc(c.ko_order || '')}</span>` : ''; };
    new MutationObserver(drawL).observe($('listenEn'), { childList: true, characterData: true, subtree: true });
  }
})();

// ── 오늘 하고 싶었던 말: 영어로 못 한 한국어를 적어 두면 나중에 카드로 만든다 ──
(() => {
  const st = document.createElement('style');
  st.textContent = `#memoPanel textarea{min-height:60px}#memoPanel ul{margin:8px 0 0;padding-left:18px}#memoPanel li{font-size:14px;margin:4px 0}#memoPanel li small{color:#8a94a8;margin-left:6px}#memoPanel li button{min-height:0;padding:0 6px;border:0;background:none;color:#9aa1ab}`;
  document.head.appendChild(st);
  const p = document.createElement('details'); p.id = 'memoPanel'; p.className = 'panel';
  p.innerHTML = '<summary>📝 오늘 하고 싶었던 말 <span id="memoCount" class="muted"></span></summary><p class="muted small">영어로 말하고 싶었는데 못 한 말을 한국어로 적어 두세요. 다음에 Claude에게 "메모 카드로 만들어줘"라고 하면 쉬운 영어 카드로 만들어 드려요.</p>' +
    '<textarea id="memoInput" maxlength="300" placeholder="예: 그거 어제 미리 다 끝내 놨어"></textarea><div class="row" style="justify-content:flex-start"><button id="memoSave" class="primary">적어 두기</button><button id="memoCopy">전체 복사</button></div><ul id="memoList"></ul>';
  $('practice').appendChild(p);
  let memos = []; try { memos = JSON.parse(localStorage.getItem('loop-memos') || '[]'); } catch {}
  let doc = null;  // claude.ai 앱에서는 내 계정 저장소에도 둔다(전용 앱은 firebase.js가 loopMemos로 맞춘다)
  const persist = () => { try { localStorage.setItem('loop-memos', JSON.stringify(memos)); } catch {} doc?.set({ memos }).catch(() => {}); window.loopMemos?.onSave?.(memos); };
  window.loopMemos = Object.assign(window.loopMemos || {}, {
    get: () => memos,
    merge(remote) { const seen = new Set(memos.map(m => m.time + m.text)); for (const m of remote || []) if (!seen.has(m.time + m.text)) memos.push(m);
      memos.sort((a, b) => a.time.localeCompare(b.time)); draw(); if (memos.length !== (remote || []).length) persist(); else try { localStorage.setItem('loop-memos', JSON.stringify(memos)); } catch {} },
  });
  const draw = () => {
    $('memoCount').textContent = memos.length ? `(${memos.length})` : '';
    $('memoList').innerHTML = memos.map((m, i) => `<li>${esc(m.text)}<small>${m.time.slice(5, 10)}</small><button data-del="${i}" aria-label="지우기">✕</button></li>`).join('');
  };
  $('memoSave').onclick = () => { const t = $('memoInput').value.trim(); if (!t) return; memos.push({ text: t, time: new Date().toISOString() }); $('memoInput').value = ''; persist(); draw(); };
  $('memoList').onclick = e => { const b = e.target.closest('[data-del]'); if (!b) return; memos.splice(+b.dataset.del, 1); persist(); draw(); };
  $('memoCopy').onclick = async () => { const t = '[오늘 하고 싶었던 말]\n' + memos.map(m => '- ' + m.text).join('\n'); try { await navigator.clipboard.writeText(t); $('memoCopy').textContent = '복사됨 ✓'; } catch { $('memoInput').value = t; $('memoInput').select(); } };
  draw();
  (async () => {
    if (!window.claude?.use) return;
    const [store, user] = await Promise.all([claude.use('db'), claude.use('user')]); const uid = user ? await user.id() : null;
    if (!store || !uid) return;
    doc = store.doc('data/users/' + uid + '/memo~list');
    try { const s = await doc.get(); const remote = s.exists ? (s.data()?.memos || []) : [];
      const seen = new Set(memos.map(m => m.time + m.text)); for (const m of remote) if (!seen.has(m.time + m.text)) memos.push(m);
      memos.sort((a, b) => a.time.localeCompare(b.time)); draw(); if (memos.length !== remote.length) persist(); } catch {}
  })();
})();
