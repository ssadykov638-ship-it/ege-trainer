const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*supabase*', route => route.abort());
    await page.goto(process.env.QA_URL || 'http://localhost:4173/');
    const results = await page.evaluate(() => {
      const selected = [2,3,4,7,8,9,10,11,13,14,15,16,17,18,19];
      const source = subjects.social_oge.sources.find(s => s.id === 'kotova-liskova-oge-social-2026');
      if (!source || source.variants.length !== 30) throw Error('Expected 30 OGE variants');
      let count = 0;
      for (const [v, variant] of source.variants.entries()) {
        if (variant.questions.length !== 15) throw Error(`Variant ${v + 1}: task count`);
        const progress = { answers: {} };
        variant.questions.forEach((q, i) => {
          if (q.sourceTask !== selected[i] || q.sourceVariant !== v + 1) throw Error('Source mapping changed');
          for (const text of [q.text, ...(q.options || []), ...(q.left || []), ...(q.right || [])]) {
            if (/\bОтвет\b|[1-4]\)|^\d{1,2}\s*\||[|@_©\\]/u.test(text)) throw Error(`Variant ${v+1}, task ${i+1}: OCR contamination`);
          }
          if ([4,9,11,14,18].includes(q.sourceTask) && (!q.text.includes('А.') || !q.text.includes('Б.'))) throw Error('Incomplete judgment task');
          if (v === 0 && i === 8 && !q.text.startsWith('Признаком,')) throw Error('Task number prefix returned');
          if (v === 19 && i === 0 && q.options[3] !== 'холст') throw Error('Adjacent tasks merged again');
          let good, bad;
          if (q.type === 'single') {
            if (q.options.length !== 4 || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) throw Error('Invalid single key');
            good = { selected: q.correct };
            bad = { selected: (q.correct + 1) % 4 };
          } else if (q.type === 'match') {
            if (q.left.length !== q.correct.length || q.correct.some(n => n < 0 || n >= q.right.length)) throw Error('Invalid matching key');
            good = { matching: Object.fromEntries(q.correct.map((n, j) => [j, String(n)])) };
            bad = { matching: { ...good.matching, 0: String((q.correct[0] + 1) % q.right.length) } };
          } else throw Error('Unexpected question type');
          if (!isCorrect(q, good) || isCorrect(q, bad) || isCorrect(q, undefined)) throw Error('Grading failure');
          progress.answers[i] = good;
          count++;
        });
        if (countCorrect(variant, progress) !== 15) throw Error('Total score failure');
      }
      state.screen = 'subjects';
      state.access = { name: 'QA', login: 'qa@example.invalid', role: 'student' };
      state.examType = null;
      show('subjects');
      return { count, home: document.querySelector('#subjectScreen').innerText };
    });
    assert.equal(results.count, 450);
    assert.match(results.home, /ЕГЭ/);
    assert.match(results.home, /ОГЭ/);
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => { state.examType = null; show('subjects'); });
      await page.screenshot({ path: `review/oge/home-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'ОГЭ 9 класс' }).click();
      assert.equal(await page.evaluate(() => state.examType), 'oge');
      await page.getByRole('button', { name: /Обществознание/ }).click();
      assert.equal(await page.evaluate(() => state.subjectId), 'social_oge');
      await page.evaluate(() => {
        state.sourceId = 'kotova-liskova-oge-social-2026';
        show('variants');
      });
      await page.screenshot({ path: `review/oge/variants-${width}.png`, fullPage: true });
      await page.evaluate(() => { state.examType = null; show('subjects'); });
      await page.getByRole('button', { name: 'ЕГЭ 11 класс' }).click();
      assert.equal(await page.evaluate(() => state.examType), 'ege');
      assert.equal(await page.evaluate(() => [...document.querySelectorAll('#subjectList button')].filter(b => b.textContent.includes('Обществознание')).length), 1);
      await page.evaluate(() => goBack());
      assert.equal(await page.evaluate(() => state.examType), null);
    }
    console.log('450 OGE tasks: source numbering, key bounds, grading and totals verified. Text/source-key review remains separate.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
