import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const URL = process.env.URL || 'http://localhost:3000';
const CHROME = '/usr/lib/chromium/chromium';

// Q1 answer=1, Q2 answer=0, Q3 answer=1
const MD = `# Browser Test Pack\n\n## Graf\n\n### P1?\n- [ ] Nie\n- [x] Tak\n\n> Wyjaśnienie: bo P1\n\n### P2?\n- [x] Tak\n- [ ] Nie\n\n### P3?\n- [ ] Nie\n- [x] Tak`;

const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

const ctxHost = await browser.createBrowserContext();
const ctxP1 = await browser.createBrowserContext();
const ctxP2 = await browser.createBrowserContext();

async function open(page) {
  await page.goto(`${URL}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.Alpine && !!document.body._x_dataStack, { timeout: 20000 });
}

async function enterMp(page, nickname) {
  await page.evaluate((nick) => {
    const s = document.body._x_dataStack[0];
    s.mpNickname = nick;
    s.mpServer = window.location.origin;
    s.view = 'multiplayer';
    if (!s.mpSocket) s.connectServer();
  }, nickname);
}

const waitScreen = (page, scr, timeout = 20000) =>
  page.waitForFunction((s) => document.body._x_dataStack[0].mpScreen === s, { timeout }, scr);

const waitIndex = (page, target, timeout = 30000) =>
  page.waitForFunction((t) => document.body._x_dataStack[0].mpIndex >= t, { timeout }, target);

const waitFirstQ = (page) =>
  page.waitForFunction(() => {
    const s = document.body._x_dataStack[0];
    return s.mpScreen === 'game' && s.mpIndex === 0 && !!s.mpCurrentQuestion;
  }, { timeout: 20000 });

const join = (page, code) =>
  page.evaluate((code) => { const s = document.body._x_dataStack[0]; s.mpJoinCode = code; s.joinRoom(); }, code);

const answer = (page, idx) =>
  page.evaluate((idx) => { const s = document.body._x_dataStack[0]; if (!s.mpAnswered) s.mpAnswer(idx); }, idx);

const getCode = (page) => page.evaluate(() => document.body._x_dataStack[0].mpCode);

async function noLeak(page) {
  const leaks = await page.evaluate(() =>
    [...document.querySelectorAll('button.option-button')]
      .map((b) => b.className)
      .filter((c) => c.includes('correct') || c.includes('wrong')));
  assert.deepEqual(leaks, [], 'option-button classes must never leak correct/wrong during game');
}

try {
  log('launch & load 3 browser views');
  const host = await ctxHost.newPage();
  const p1 = await ctxP1.newPage();
  const p2 = await ctxP2.newPage();
  await Promise.all([open(host), open(p1), open(p2)]);

  log('connect host + 2 players');
  await Promise.all([enterMp(host, 'Host'), enterMp(p1, 'P1'), enterMp(p2, 'P2')]);
  await Promise.all([waitScreen(host, 'menu'), waitScreen(p1, 'menu'), waitScreen(p2, 'menu')]);

  log('host creates lobby (hostPlays=false)');
  await host.evaluate(() => { const s = document.body._x_dataStack[0]; s.mpHostPlays = false; s.createRoom(); });
  await waitScreen(host, 'lobby');
  const code = await getCode(host);
  assert.match(code, /^[A-Z0-9]{6}$/, 'room code is 6 alnum chars');

  log('players join ' + code);
  await Promise.all([join(p1, code), join(p2, code)]);
  await Promise.all([waitScreen(p1, 'lobby'), waitScreen(p2, 'lobby')]);
  await host.waitForFunction(() => document.body._x_dataStack[0].mpPlayers.length === 2);

  log('host uploads pack and starts (3 questions, 5s/question)');
  await host.evaluate((md) => { const s = document.body._x_dataStack[0]; s.mpPackText = md; s.mpSendPack(); }, MD);
  await host.waitForFunction(() => document.body._x_dataStack[0].mpQuestionCount === 3);
  await host.evaluate(() => {
    const s = document.body._x_dataStack[0];
    s.mpStartCount = 3;
    s.mpTimePerQuestion = 5;
    s.mpStartGame();
  });
  await Promise.all([waitFirstQ(host), waitFirstQ(p1), waitFirstQ(p2)]);

  log('Q1: P1 answers, P2 stays silent -> no leak + "waiting" shown');
  await answer(p1, 1);
  await p1.waitForFunction(() => {
    const s = document.body._x_dataStack[0];
    const txt = document.body.innerText;
    return s.mpAnswered && (txt.includes('Czekanie') || txt.includes('Waiting'));
  });
  await noLeak(p1);
  await noLeak(p2);
  await noLeak(host);

  log('timer: server auto-advances to Q2 without P2 answering');
  await waitIndex(p1, 1, 20000); // 5s timer + 3s reveal + slack
  await waitIndex(p2, 1, 20000);

  log('Q2 and Q3 answered by both');
  await Promise.all([answer(p1, 1), answer(p2, 1)]);
  await waitIndex(p1, 2);
  await Promise.all([answer(p1, 1), answer(p2, 1)]);

  log('game ends -> results + review');
  await Promise.all([waitScreen(host, 'results'), waitScreen(p1, 'results'), waitScreen(p2, 'results')]);

  const resA = await host.evaluate(() => {
    const s = document.body._x_dataStack[0];
    return {
      results: JSON.parse(JSON.stringify(s.mpResults)),
      reviewLen: s.mpReview.length,
      hasHost: s.mpResults.some((r) => r.isHost),
    };
  });
  assert.equal(resA.results.length, 2, 'hostPlays=false -> only 2 players in results');
  assert.equal(resA.hasHost, false, 'host not listed when not playing');
  assert.equal(resA.reviewLen, 3, 'review covers all questions');

  const reviewOk = await p1.evaluate(() => {
    const details = document.querySelectorAll('details.review-question');
    const oneCorrectEach = details.length === 3 &&
      [...details].every((el) => el.querySelectorAll('.option-button.correct').length === 1);
    return { details: details.length, oneCorrectEach };
  });
  assert.equal(reviewOk.details, 3, 'review renders 3 question details');
  assert.equal(reviewOk.oneCorrectEach, true, 'each review question marks exactly one option correct');

  // ---------- Scenario B: hostPlays=true ----------
  log('SCENARIO B: fresh room, host also plays');
  const host2 = await ctxHost.newPage();
  await open(host2);
  await enterMp(host2, 'Host');
  await waitScreen(host2, 'menu');
  await host2.evaluate(() => { const s = document.body._x_dataStack[0]; s.mpHostPlays = true; s.createRoom(); });
  await waitScreen(host2, 'lobby');
  const code2 = await getCode(host2);
  await Promise.all([join(p1, code2), join(p2, code2)]);
  await Promise.all([waitScreen(p1, 'lobby'), waitScreen(p2, 'lobby')]);

  await host2.evaluate((md) => { const s = document.body._x_dataStack[0]; s.mpPackText = md; s.mpSendPack(); }, MD);
  await host2.waitForFunction(() => document.body._x_dataStack[0].mpQuestionCount === 3);
  await host2.evaluate(() => {
    const s = document.body._x_dataStack[0];
    s.mpStartCount = 3;
    s.mpTimePerQuestion = 10;
    s.mpStartGame();
  });
  await Promise.all([waitFirstQ(host2), waitFirstQ(p1), waitFirstQ(p2)]);

  // answer all 3 questions round-by-round
  for (let q = 1; q <= 3; q++) {
    await Promise.all([answer(host2, 1), answer(p1, 1), answer(p2, 1)]);
    if (q < 3) await waitIndex(p1, q);
  }

  await Promise.all([waitScreen(host2, 'results'), waitScreen(p1, 'results')]);
  const resB = await host2.evaluate(() =>
    JSON.parse(JSON.stringify({ results: document.body._x_dataStack[0].mpResults })));
  assert.equal(resB.results.length, 3, 'hostPlays=true -> all 3 in results');
  assert.ok(resB.results.some((r) => r.isHost), 'host present in results');

  log('E2E BROWSER OK');
  process.exit(0);
} catch (err) {
  console.error('BROWSER E2E FAILED:', err.message || err);
  process.exit(1);
} finally {
  await browser.close();
}