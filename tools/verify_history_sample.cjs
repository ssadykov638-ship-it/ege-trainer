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
      if (source.variants.length !== 16) throw Error('Expected sixteen verified variants');
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
    const keys10=['531','3421','Святейший синод','25','5','1432','352','восемнадцатый','Пугачёв','1','4','Юрий Долгорукий','34','2','1','3','4'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[9];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==10)throw Error('Variant 10 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 10 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[2],{selected:'Синод'}))throw Error('Variant 10 alternate synod');
      if(!isCorrect(variant.questions[5],{selected:'3214'}))throw Error('Variant 10 alternate order');
      if(!isCorrect(variant.questions[8],{selected:'Пугачев'}))throw Error('Variant 10 alternate spelling');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 10 shared map');
      state.variantIndex=9;state.variantId=variant.id;
    },keys10);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 10 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['94 244,1','116 505,5','9456,1','11 671,8','9354,8','11 392,4','5784,4','7878,5','7747,2','9631,3','2555,5','3015,7']);
        await page.screenshot({path:`review/history/v10-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys11=['324','2314','мировой суд','35','3','1423','453','Екатерина Вторая','Севастополь','4','2','Севастополь','34','5','1','4','3'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[10];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==11)throw Error('Variant 11 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 11 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2314'}))throw Error('Variant 11 alternate order');
      if(!isCorrect(variant.questions[7],{selected:'Екатерина II'}))throw Error('Variant 11 alternate empress');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 11 shared map');
      state.variantIndex=10;state.variantId=variant.id;
    },keys11);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 11 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['15,0','85,0','72,0','28,0','56,1','43,9','41,2','58,8']);
        await page.screenshot({path:`review/history/v11-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys12=['423','3421','старообрядцы','25','4','2431','234','Святослав','Киев','4','4','Лефорт','14','5','4','1','3'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[11];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==12)throw Error('Variant 12 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 12 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[2],{selected:'староверы'})||!isCorrect(variant.questions[2],{selected:'раскольники'}))throw Error('Variant 12 alternate term');
      if(!isCorrect(variant.questions[5],{selected:'3124'}))throw Error('Variant 12 alternate order');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 12 shared map');
      state.variantIndex=11;state.variantId=variant.id;
    },keys12);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 12 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['1518,9','1605,8','2352,7','2273,4','1809','1907,7','2242,6','2159','2018,2','2156,1','1910','1814,9']);
        await page.screenshot({path:`review/history/v12-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys13=['153','2314','декабристы','24','3','1423','254','четырнадцатого','Иван IV','4','2','Яссы','35','4','3','4','1'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[12];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==13)throw Error('Variant 13 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 13 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2314'}))throw Error('Variant 13 alternate order');
      if(!isCorrect(variant.questions[8],{selected:'Иван Грозный'}))throw Error('Variant 13 alternate monarch');
      if(!isCorrect(variant.questions[11],{selected:'Ясский мир'}))throw Error('Variant 13 alternate treaty');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 13 shared map');
      state.variantIndex=12;state.variantId=variant.id;
    },keys13);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 13 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['4,37','2,71','4,00','2,65','4,27','2,75','4,56','3,36']);
        await page.screenshot({path:`review/history/v13-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys14=['431','3214','герб','34','4','4123','523','двенадцатый','половцы','1','2','Невская','25','4','3','1','2'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[13];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==14)throw Error('Variant 14 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 14 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2341'}))throw Error('Variant 14 alternate order');
      if(!isCorrect(variant.questions[11],{selected:'Невская битва'}))throw Error('Variant 14 alternate battle');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 14 shared map');
      state.variantIndex=13;state.variantId=variant.id;
    },keys14);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 14 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['1889','844','509','480','510','223']);
        await page.screenshot({path:`review/history/v14-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys15=['352','2413','Судебник','12','4','2143','341','шестнадцатый','Иван III','2','3','Речь Посполитая','14','2','1','3','2'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[14];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==15)throw Error('Variant 15 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 15 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'4321'}))throw Error('Variant 15 alternate order');
      if(!isCorrect(variant.questions[8],{selected:'Иван Третий'}))throw Error('Variant 15 alternate monarch');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 15 shared map');
      state.variantIndex=14;state.variantId=variant.id;
    },keys15);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 15 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['3543','6659','10 202','7424','17 626','4529']);
        await page.screenshot({path:`review/history/v15-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    const keys16=['513','1324','большая соха','23','3','4123','142','Тарутино','Наполеон Бонапарт','3','2','Варяг','35','4','1','4','2'];
    await page.evaluate(keys=>{
      const variant=subjects.history_oge.sources[0].variants[15];
      variant.questions.forEach((q,i)=>{
        if(q.sourceTask!==i+1||q.sourceVariant!==16)throw Error('Variant 16 mapping');
        const key=keys[i];
        const answer=q.type==='match'?{matching:Object.fromEntries([...key].map((d,j)=>[j,String(Number(d)-1)]))}:q.type==='multi'?{selected:[...key].map(d=>Number(d)-1).reverse()}:q.type==='single'?{selected:Number(key)-1}:{selected:key};
        if(!isCorrect(q,answer))throw Error(`Variant 16 key ${i+1}`);
      });
      if(!isCorrect(variant.questions[5],{selected:'2341'}))throw Error('Variant 16 alternate order');
      if(!isCorrect(variant.questions[8],{selected:'Наполеон Первый'}))throw Error('Variant 16 alternate commander');
      if(variant.questions.slice(7,10).some(q=>q.image!==variant.questions[7].image))throw Error('Variant 16 shared map');
      state.variantIndex=15;state.variantId=variant.id;
    },keys16);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(let i=0;i<17;i++){
        await page.evaluate(i=>{state.questionIndex=i;clearDraft();show('exam');},i);
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Variant 16 overflow ${width}.${i+1}`);
        if(i===6)assert.deepEqual(await page.locator('.task-table tbody td').allTextContents(),['37,7','54,5','84,8','74,1','105,2','197,0']);
        await page.screenshot({path:`review/history/v16-${width}-q${i+1}.png`,fullPage:true});
      }
    }
    await page.setViewportSize({width:320,height:900});
    await page.evaluate(()=>{
      const variant=subjects.history_oge.sources[0].variants[14];
      const progress=state.progress[variant.id];
      state.variantIndex=14;
      state.variantId=variant.id;
      progress.completed=true;
      progress.answers={0:{matching:{0:'0',1:'0',2:'0'}},1:{selected:'2413'}};
      show('result');
    });
    assert.equal(await page.locator('#reviewList').isVisible(),false,'Mistake review must start closed');
    assert.equal(await page.locator('#mistakesReviewButton').isVisible(),true,'Mistake review button missing');
    await page.locator('#mistakesReviewButton').click();
    assert.equal(await page.locator('#reviewList').isVisible(),true,'Mistake review did not open');
    assert.equal(await page.locator('#reviewList .review-item').count(),16,'Only incorrect tasks must be shown');
    assert.match(await page.locator('#reviewList .review-item').first().innerText(),/Ответ ученика:/);
    assert.match(await page.locator('#reviewList .review-item').first().innerText(),/Правильно:/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Result review overflow');
    await page.screenshot({path:'review/history/mistake-review-320.png',fullPage:true});
    await page.locator('#mistakesReviewButton').click();
    assert.equal(await page.locator('#reviewList').isVisible(),false,'Mistake review did not close');
    console.log('272 source keys, alternate answers, shared maps, native tables, 816 viewport renders and mistake review verified.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
