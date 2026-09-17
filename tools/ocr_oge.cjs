const fs=require('node:fs'),path=require('node:path');
const {createWorker}=require('tesseract.js');
(async()=>{
  const root='review/oge';fs.mkdirSync(`${root}/ocr`,{recursive:true});
  const names=fs.readdirSync(`${root}/pages`).filter(n=>n.endsWith('.png')).sort((a,b)=>{
    const priority=n=>/182|183/.test(n)?0:1;
    return priority(a)-priority(b)||a.localeCompare(b);
  });
  const queue=names.filter(n=>!fs.existsSync(`${root}/ocr/${n.replace('.png','.json')}`));
  const langPath=process.argv[2];
  await Promise.all(Array.from({length:3},async()=>{
    const worker=await createWorker('rus',1,langPath?{langPath,gzip:false,cachePath:`${root}/lang`}:{});
    try{
      while(queue.length){
        const name=queue.shift();
        const result=await worker.recognize(path.join(root,'pages',name),{}, {text:true,blocks:true});
        fs.writeFileSync(`${root}/ocr/${name.replace('.png','.json')}`,JSON.stringify(result.data));
        fs.writeFileSync(`${root}/ocr/${name.replace('.png','.txt')}`,result.data.text);
        console.log(name,result.data.text.length);
      }
    }finally{await worker.terminate();}
  }));
})().catch(error=>{console.error(error);process.exit(1)});
