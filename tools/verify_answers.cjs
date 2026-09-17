const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage();
    await page.route('**/*supabase*',route=>route.abort());
    await page.goto(process.env.QA_URL||'http://localhost:4173/');
    const count=await page.evaluate(()=>{
      const variants=subjects.social.sources.filter(s=>s.id==='kotova-liskova-social-2026-ocr'||s.id==='kotova-liskova-personal-2026-social').flatMap(s=>s.variants);
      let count=0;
      for(const variant of variants){
        const progress={answers:{}};
        variant.questions.forEach((q,index)=>{
          if(!['multi','match','short','digits','single'].includes(q.type))throw Error(`${variant.title}.${index+1}: missing type`);
          let answer,bad;
          if(q.type==='match'){
            answer={matching:Object.fromEntries(q.correct.map((v,i)=>[i,String(v)]))};
            bad={matching:{...answer.matching,0:String((q.correct[0]+1)%q.right.length)}};
          }else if(q.type==='multi'){
            answer={selected:[...q.correct].reverse()};
            bad={selected:q.correct.slice(1)};
          }else if(q.type==='short'||q.type==='digits'){
            answer={selected:q.correct[0]};bad={selected:'invalid-answer'};
          }else{answer={selected:q.correct};bad={selected:-1};}
          if(!isCorrect(q,answer)||isCorrect(q,bad)||isCorrect(q,undefined))throw Error(`${variant.title}.${index+1}: wrong grading`);
          progress.answers[index]=answer;
          count++;
        });
        if(countCorrect(variant,progress)!==variant.questions.length)throw Error('Wrong total score');
      }
      return count;
    });
    console.log(`Verified grading for ${count} tasks: correct, incorrect, missing answers and totals`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
