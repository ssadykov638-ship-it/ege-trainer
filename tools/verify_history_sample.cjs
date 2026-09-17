const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  fs.mkdirSync('review/history', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*supabase*', r => r.abort());
    await page.goto('http://localhost:4173/');
    const keys = ['431','1324','Уложенная комиссия','23','5','1423','245','двенадцатый','Юрий Долгорукий','3','3','Борис Годунов','34','5','3','1','4'];
    await page.evaluate(keys => {
      const source = subjects.history_oge.sources[0];
      if (source.variants.length !== 1) throw Error('Only one variant should exist');
      const variant = source.variants[0];
      if (variant.questions.length !== 17) throw Error('Missing tasks');
      variant.questions.forEach((q, i) => {
        const key = keys[i];
        if (q.sourceTask !== i + 1) throw Error('Source mapping shifted');
        const answer = q.type === 'match' ? { matching: Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)])) } : q.type === 'multi' ? { selected: [...key].map(d=>Number(d)-1).reverse() } : q.type === 'single' ? { selected: Number(key)-1 } : { selected: key };
        if (!isCorrect(q, answer) || isCorrect(q, undefined)) throw Error(`Key ${i+1}`);
        const wrong = q.type === 'match' ? { matching: {} } : q.type === 'multi' ? { selected: [] } : { selected: q.type === 'single' ? -1 : 'wrong' };
        if (isCorrect(q, wrong)) throw Error('Incorrect answer accepted');
      });
      if (!isCorrect(variant.questions[5], { selected: '2314' })) throw Error('Alternate pairing order rejected');
      if (variant.questions.slice(7,10).some(q=>q.image !== variant.questions[7].image)) throw Error('Shared map missing');
      state.access = { name:'QA', login:'qa@example.invalid', role:'student' };
      state.examType = 'oge';
      state.subjectId = 'history_oge';
      state.sourceId = source.id;
      state.variantId = variant.id;
      state.questionIndex = 0;
      clearDraft();
      show('exam');
    }, keys);
    for (const width of [320,390,1280]) {
      await page.setViewportSize({width,height:900});
      for (let i=0;i<17;i++) {
        await page.evaluate(i=>{ state.questionIndex=i;clearDraft();show('exam'); }, i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
        assert.equal(overflow,false,`Overflow ${width}.${i+1}`);
        if (i === 9 || i === 16) {
          assert.equal(await page.evaluate(()=>{
            const text=document.querySelector('.task-context').getBoundingClientRect();
            const options=document.querySelector('#options').getBoundingClientRect();
            return text.width >= options.width - 1;
          }),true,'Passage must span all columns');
        }
        if (i === 6) {
          assert.equal(await page.locator('.task-table tbody tr').count(),3);
          assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['5647','55,18','1148','87,1','1415','13,82','141','10,7','3174','31','29','2,2']);
          assert.equal(await page.locator('.task-media').count(),0);
        }
        await page.screenshot({path:`review/history/${width}-q${i+1}.png`,fullPage:true});
      }
    }
    for (const [index, answer] of [[1,'1324'],[5,'2314']]) {
      await page.evaluate(index=>{state.questionIndex=index;clearDraft();show('exam');},index);
      const input = page.locator('#options input');
      assert.equal(await input.getAttribute('inputmode'),'numeric');
      assert.equal(await page.locator('.digit-grid').count(),0);
      await input.pressSequentially(answer);
      assert.equal(await input.inputValue(),answer);
      assert.equal(await input.evaluate(el=>document.activeElement===el),true);
      assert.equal(await page.evaluate(()=>isCorrect(currentQuestion(),{selected:state.selected})),true);
      await input.fill('0a123');
      assert.equal(await input.inputValue(),'0123');
      await input.fill('');
      assert.equal(await page.locator('#nextButton').isDisabled(),true);
    }
    await page.evaluate(()=>{state.questionIndex=7;clearDraft();show('exam');});
    await page.locator('#options input').pressSequentially('двенадцатый');
    assert.equal(await page.locator('#options input').inputValue(),'двенадцатый');
    assert.equal(await page.locator('#options input').evaluate(el=>document.activeElement===el),true);
    await page.getByRole('button',{name:'Открыть материал крупно'}).click();
    assert.equal(await page.evaluate(()=>state.screen),'image');
    await page.getByRole('button',{name:'Назад',exact:true}).click();
    assert.equal(await page.evaluate(()=>state.questionIndex),7);
    console.log('17 source keys, alternate pairs, shared map, zoom/back, full-width passages, native table and 51 viewport renders verified.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
