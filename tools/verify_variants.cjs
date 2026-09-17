const {chromium}=require('playwright');
const fs=require('node:fs');

(async()=>{
  fs.mkdirSync('review',{recursive:true});
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage();
  await page.route('**/*supabase*',route=>route.abort());
  await page.goto('http://localhost:4173/');
  await page.waitForFunction(()=>window.localInteractiveSources?.length);
  const report=[];
  for(const width of [390,1280]){
    await page.setViewportSize({width,height:900});
    for(let v=0;v<29;v++){
      for(let q=0;q<16;q++){
        if(v<21&&q!==8)continue;
        const result=await page.evaluate(({v,q})=>{
          state.access={id:'qa-local',name:'QA',role:'student'};
          state.subjectId='social';state.sourceId='kotova-liskova-social-2026-ocr';
          state.variantIndex=v;state.questionIndex=q;state.selected=null;state.matching={};
          show('exam');
          const variant=currentVariant(),question=currentQuestion();
          if(variant.questions.length!==16)throw Error('Wrong task count');
          if(v>=21&&(question.sourceTask!==q+1||question.sourceVariant!==v+2))throw Error('Wrong task order');
          if(question.options?.some(value=>/^\d+$/.test(value)))throw Error('Placeholder answer');
          if(question.type==='match'&&(question.left.length!==5||question.correct.length!==5||question.correct.some(index=>index>=question.right.length)))throw Error('Invalid matching task');
          return {v:v+1,q:q+1,type:question.type,overflow:document.documentElement.scrollWidth>innerWidth};
        },{v,q});
        await page.locator('.task-media img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
        if(result.overflow)throw Error('Horizontal overflow '+JSON.stringify(result));
        report.push(result);
        if(q===8&&[3,5,19,21,22,28].includes(v))await page.screenshot({path:`review/variant-${v+1}-${width}.png`,fullPage:true});
      }
    }
  }
  fs.writeFileSync('review/browser-check.json',JSON.stringify(report,null,2));
  console.log(`Checked ${report.length} task renders across desktop and mobile`);
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
