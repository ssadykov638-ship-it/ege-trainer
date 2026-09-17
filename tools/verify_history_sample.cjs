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
      if (source.variants.length !== 9) throw Error('Expected nine verified variants');
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
      state.variantIndex = 0;
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
    const keys2 = ['351','4321','половцы','13','3','2143','125','Николай Второй','Цусимское','4','2','Айгунский','14','4','2','4','1'];
    await page.evaluate(keys => {
      const variant = subjects.history_oge.sources[0].variants[1];
      if (variant.questions.length !== 17) throw Error('Missing variant 2 tasks');
      variant.questions.forEach((q, i) => {
        if (q.sourceTask !== i + 1 || q.sourceVariant !== 2) throw Error('Variant 2 mapping');
        const key = keys[i];
        const answer = q.type === 'match' ? { matching: Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)])) } : q.type === 'multi' ? { selected: [...key].map(d=>Number(d)-1).reverse() } : q.type === 'single' ? { selected: Number(key)-1 } : { selected: key };
        if (!isCorrect(q, answer) || isCorrect(q, undefined)) throw Error(`Variant 2 key ${i+1}`);
      });
      if (!isCorrect(variant.questions[5], {selected:'4321'})) throw Error('Variant 2 alternate order');
      if (variant.questions.slice(7,10).some(q=>q.image !== variant.questions[7].image)) throw Error('Variant 2 shared map');
      state.variantId = variant.id;
      state.variantIndex = 1;
    }, keys2);
    for (const width of [320,390,1280]) {
      await page.setViewportSize({width,height:900});
      for (let i=0;i<17;i++) {
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 2 overflow ${width}.${i+1}`);
        if (i===6) {
          assert.equal(await page.locator('.task-table tbody tr').count(),4);
          assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['660','208','522','174','841','336','562','249']);
        }
        await page.screenshot({path:`review/history/v2-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys3 = ['134','4312','былины','45','5','1432','243','семнадцатый','Амур','2','4','Багратион','35','4','2','4','1'];
    await page.evaluate(keys => {
      const variant = subjects.history_oge.sources[0].variants[2];
      if (variant.questions.length !== 17) throw Error('Missing variant 3 tasks');
      variant.questions.forEach((q, i) => {
        if (q.sourceTask !== i + 1 || q.sourceVariant !== 3) throw Error('Variant 3 mapping');
        const key = keys[i];
        const answer = q.type === 'match' ? { matching: Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)])) } : q.type === 'multi' ? { selected: [...key].map(d=>Number(d)-1).reverse() } : q.type === 'single' ? { selected: Number(key)-1 } : { selected: key };
        if (!isCorrect(q, answer) || isCorrect(q, undefined)) throw Error(`Variant 3 key ${i+1}`);
      });
      if (!isCorrect(variant.questions[5], {selected:'3214'})) throw Error('Variant 3 alternate order');
      if (variant.questions.slice(7,10).some(q=>q.image !== variant.questions[7].image)) throw Error('Variant 3 shared map');
      state.variantId = variant.id;
      state.variantIndex = 2;
    }, keys3);
    for (const width of [320,390,1280]) {
      await page.setViewportSize({width,height:900});
      for (let i=0;i<17;i++) {
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 3 overflow ${width}.${i+1}`);
        if (i===6) assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['94 244','118 690','125 683','9354','11 735','12 512','5784','8220','9788','7747','9973','10 957']);
        await page.screenshot({path:`review/history/v3-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys4 = ['431','4213','бироновщина','24','3','1324','135','семнадцатый','Речь Посполитая','3','2','Канкрин','25','2','3','2','1'];
    await page.evaluate(keys => {
      const variant = subjects.history_oge.sources[0].variants[3];
      variant.questions.forEach((q, i) => {
        if (q.sourceTask !== i + 1 || q.sourceVariant !== 4) throw Error('Variant 4 mapping');
        const key = keys[i];
        const answer = q.type === 'match' ? {matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))} : q.type === 'multi' ? {selected:[...key].map(d=>Number(d)-1).reverse()} : q.type === 'single' ? {selected:Number(key)-1} : {selected:key};
        if (!isCorrect(q, answer)) throw Error(`Variant 4 key ${i+1}`);
      });
      if (!isCorrect(variant.questions[5], {selected:'2413'})) throw Error('Variant 4 alternate order');
      state.variantIndex=3; state.variantId=variant.id;
    }, keys4);
    for (const width of [320,390,1280]) {
      await page.setViewportSize({width,height:900});
      for (let i=0;i<17;i++) {
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 4 overflow ${width}.${i+1}`);
        await page.screenshot({path:`review/history/v4-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys5 = ['531','3124','обязанные','35','4','3124','413','Иван Грозный','Каспийское','3','4','Пётр Третий','14','4','1','3','4'];
    await page.evaluate(keys => {
      const variant=subjects.history_oge.sources[0].variants[4];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==5) throw Error('Variant 5 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer)) throw Error(`Variant 5 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2431'})) throw Error('Variant 5 alternate order');
      if(!isCorrect(variant.questions[7],{selected:'Иван Четвёртый'})) throw Error('Variant 5 alternate monarch');
      state.variantIndex=4;state.variantId=variant.id;
    },keys5);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 5 overflow ${width}.${i+1}`);
        await page.screenshot({path:`review/history/v5-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys6=['532','4321','меньшевики','25','1','4123','512','Пётр Первый','Швеция','4','4','Сибирское','34','2','3','1','2'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[5];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==6)throw Error('Variant 6 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 6 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2341'}))throw Error('Variant 6 alternate order');
      state.variantIndex=5;state.variantId=variant.id;
    },keys6);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 6 overflow ${width}.${i+1}`);
        await page.screenshot({path:`review/history/v6-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys7=['235','1243','Соборное уложение','15','5','1423','213','тринадцатый','Александр Невский','4','2','мировые суды','15','2','1','2','3'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[6];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==7)throw Error('Variant 7 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 7 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2314'}))throw Error('Variant 7 alternate order');
      if(!isCorrect(variant.questions[11],{selected:'мировой суд'}))throw Error('Variant 7 alternate court');
      state.variantIndex=6;state.variantId=variant.id;
    },keys7);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 7 overflow ${width}.${i+1}`);
        await page.screenshot({path:`review/history/v7-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys8=['135','2413','подушная подать','24','4','1324','541','Александр Первый','Фили','1','3','Иван Четвёртый','23','1','2','1','3'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[7];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==8)throw Error('Variant 8 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 8 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2413'}))throw Error('Variant 8 alternate order');
      if(!isCorrect(variant.questions[7],{selected:'Александр I'}))throw Error('Variant 8 alternate emperor');
      if(!isCorrect(variant.questions[11],{selected:'Иван Грозный'}))throw Error('Variant 8 alternate monarch');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 8 shared map');
      state.variantIndex=7;state.variantId=variant.id;
    },keys8);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 8 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['24','61,50','26','51,33','32','50,00']);
        await page.screenshot({path:`review/history/v8-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys9=['314','1423','Тройственный союз','34','4','3124','435','двенадцатый','Новгород','1','3','Багратион','35','5','2','1','3'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[8];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==9)throw Error('Variant 9 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 9 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2431'}))throw Error('Variant 9 alternate order');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 9 shared map');
      state.variantIndex=8;state.variantId=variant.id;
    },keys9);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 9 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['224 179','733 367','13 944','39 027','3 275 362','6 416 247']);
        await page.screenshot({path:`review/history/v9-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    console.log('153 source keys, alternate answers, shared maps, native tables and 459 viewport renders verified.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
