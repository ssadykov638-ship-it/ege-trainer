import json
import re
from pathlib import Path

SELECTED=[2,3,4,7,8,9,10,11,13,14,15,16,17,18,19]
# Transcribed and visually checked against the two answer-table pages, PDF 182-183.
SINGLE_KEYS={
2:'424141432212124'+'431334244242241',
3:'211211413212242'+'144213132124312',
4:'123332333131323'+'333331231111232',
7:'244211443411112'+'211211441423414',
8:'344444241314414'+'443322414231442',
9:'233222133331333'+'412124133343133',
10:'341124224424442'+'422442232243111',
11:'322334341343233'+'313333111111333',
13:'342112332224134'+'234244422232144',
14:'431323331131331'+'133131133333421',
16:'432443242141241'+'222434322414123',
17:'413123114433411'+'224411323114224',
18:'143333114143321'+'122112323423332',
}
MATCH_KEYS='22312 31312 22112 21234 11212 21211 12211 11222 22211 12221 31221 23213 23211 21122 32123 13122 12121 12334 32312 13211 12123 11122 21121 22112 12121 32211 31121 12221 23121 33212'.split()
GROUP_KEYS='1234 1423 1324 1324 1423 1234 1423 1324 2314 2413 1234 3412 1423 1423 3412 1324 2314 2413 1324 2413 1324 1324 1423 1423 1423 1234 1423 2314 1423 3412'.split()

OCR_REPLACEMENTS={
    'заявлёениео':'заявление о', 'одинаковыми)мотивами':'одинаковыми мотивами',
    'определённыхСвидов':'определённых видов', 'увеличивается-спрос/на.':'увеличивается спрос на',
    'лримере':'примере', '©/евбёй-':'о своей', 'уборщиды':'уборщицы',
    'качествс й':'качеств', 'законый':'законы', 'Жакой':'Какой',
    'всемиОв':'всеми в', 'времёни':'времени', 'отнощений':'отношений',
    '(волонтёрской)у':'(волонтёрской)', 'традиционныех/ денности':'традиционные ценности',
    'продёссов':'процессов', 'культурнозисторический':'культурно-исторический',
    'реагироватьна':'реагировать на', 'налог.Объектом':'налог. Объектом',
    'о тому что':'о том, что', 'приреды':'природы', 'рещением':'решением',
    'лидерана':'лидера на', 'регулированияэкономики':'регулирования экономики',
    'подалив':'подали в', 'правид':'правил', 'оничей':'они ей',
    'обмёнять':'обменять', 'сохранноёть':'сохранность', 'планирбвание':'планирование',
    '/уйяйже,':'ниже', 'ередетвами':'средствами', 'разЗвития':'развития',
    'унеличивается':'увеличивается', 'масбовой':'массовой', 'исподьзует':'использует',
    'произведства':'производства', 'экдномические':'экономические', 'другбе':'другое',
    'экономимеское':'экономическое', 'бтрасль':'отрасль', 'мослужить':'послужить',
    'синтернет-магазином':'с интернет-магазином',
    'образований;/обладающих':'образований, обладающих',
    '(волонтёрской)/деятельности':'(волонтёрской) деятельности',
    'и/”природы':'и природы', 'жизни. общества':'жизни общества',
    'Виталий П:-/обнаружил -':'Виталий П. обнаружил',
    'на-/средства':'на средства', 'культуры,/использует':'культуры, использует',
    'регулированияэкономики':'регулирования экономики', 'часово е ней':'часов, с ней',
    'клуба( неправомерны':'клуба неправомерны', 'БВ.':'Б.', 'А, ':'А. ', 'Б, ':'Б. ',
    'инфляциимогут':'инфляции могут', 'технолоряй':'технологий'
}

def clean(value):
    # OCR artifact from the boxed task number, not part of the question.
    value=re.sub(r'^\s*Г\s*\*\s*\|\s*','',value)
    value=re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',value)
    value=re.sub(r'(?m)^.*(?:©\s*2026|Копирование|ВАРИАНТ \d|ТИПОВЫЕ ЭКЗАМЕНАЦИОННЫЕ).*$','',value)
    value=re.sub(r'(?m)^\s*\[[^\]]{1,6}\]\s*','',value)
    value=re.sub(r'^\s*\d{1,2}\s*\|\s*','',value)
    value=value.replace('—','-').replace('`','').replace('\\','')
    for old,new in OCR_REPLACEMENTS.items():value=value.replace(old,new)
    value=re.sub(r"(?<=[А-Яа-я])['’”](?=[/\s])",'',value)
    value=re.sub(r'(?<=[А-Яа-я])\s*/+\s*(?=[А-Яа-я])',' ',value)
    value=value.replace('|',' ').replace('_',' ').replace('^','')
    value=re.sub(r'(?<=\w)[°‹]','',value)
    value=re.sub(r'\s+',' ',value).strip(' ,:;.[]|')
    return re.sub(r'^\d{1,2}\s*\|\s*','',value)

def singles(text):
    tokens=list(re.finditer(r'(?<!\d)(1|2|3|4|8|83)\)\s*',text))
    groups=[]
    current=[]
    for token in tokens:
        if current and re.search(r'Ответ\s*[:;]',text[current[-1].end():token.start()]):
            groups.append(current);current=[]
        if token.group(1)=='1' and current:
            groups.append(current);current=[]
        if not current and token.group(1)!='1':
            continue
        current.append(token)
    if current:groups.append(current)
    result=[]
    for group in groups:
        numbers=[3 if token.group(1) in ('8','83') else int(token.group(1)) for token in group]
        if sorted(numbers)!=[1,2,3,4]:
            continue
        start=group[0].start()
        prefix=text[:start]
        boundary=list(re.finditer(r'Ответ\s*[:;]',prefix))
        prefix=prefix[boundary[-1].end():] if boundary else prefix
        judgement=prefix.rfind('Верны ли')
        if judgement>=0:
            prefix=prefix[judgement:]
        else:
            instruction=list(re.finditer(r'Ответ запишите[^\n]*(?:\n\s*указав номер задания\.)?',prefix))
            if instruction:prefix=prefix[instruction[-1].end():]
            paragraphs=re.split(r'\n\s*\n',prefix.strip())
            paragraphs=[p for p in paragraphs if len(clean(p))>15 and re.search('[А-Яа-я]{3}',p)]
            prefix=paragraphs[-1] if paragraphs else prefix
        options={}
        for i,token in enumerate(group):
            end=group[i+1].start() if i+1<len(group) else len(text)
            value=text[token.end():end]
            value=re.split(r'Ответ\s*[:;]',value,maxsplit=1)[0]
            options[numbers[i]]=clean(value)
        result.append(dict(type='single',text=clean(prefix),options=[options[n] for n in range(1,5)]))
    return result

def matching_columns(variant):
    for page in range(2+(variant-1)*6,7+(variant-1)*6):
        data=json.loads(Path(f'review/oge/ocr/page-{page:03d}.json').read_text(encoding='utf-8'))
        lines=[line for block in data['blocks'] for paragraph in block['paragraphs'] for line in paragraph['lines']]
        starts=[line['bbox']['y0'] for line in lines if 'Установите соответствие' in line['text']]
        if not starts:continue
        top=starts[0]
        end=next(line['bbox']['y0'] for line in lines if line['bbox']['y0']>top and 'Запишите в таблицу' in line['text'])
        words=[word for line in lines for word in line['words'] if top<word['bbox']['y0']<end]
        first_left=next(word['bbox']['y0'] for word in words if word['text']=='А)')
        split=next(word['bbox']['x0'] for word in words if word['text']=='1)' and word['bbox']['x0']>800)-8
        columns=[]
        for right in (False,True):
            rows=[]
            for line in lines:
                selected=[word['text'] for word in line['words'] if first_left-25<=word['bbox']['y0']<end and (word['bbox']['x0']>=split)==right]
                if selected:rows.append(' '.join(selected))
            columns.append('\n'.join(rows))
        return columns
    raise ValueError(f'Matching columns not found: {variant}')

def match_block(text,variant):
    start=text.index('Установите соответствие')
    end=text.index('Запишите в таблицу',start)
    block=text[start:end]
    left_text,right_text=matching_columns(variant)
    letters=list(re.finditer(r'(?m)(?<!\w)([АБВГД])\)\s*',left_text))
    left=[]
    for i,token in enumerate(letters):
        value=left_text[token.end():letters[i+1].start() if i+1<len(letters) else len(left_text)]
        left.append(clean(value))
    right_tokens=list(re.finditer(r'(?<!\d)(1|2|3|4|8|83)\)\s*',right_text))
    right=[]
    for i,token in enumerate(right_tokens):
        value=right_text[token.end():right_tokens[i+1].start() if i+1<len(right_tokens) else len(right_text)]
        right.append(clean(value))
    assert len(left)==5,(variant,'match left',left)
    assert len(right)==max(map(int,MATCH_KEYS[variant-1])),(variant,'match right',right)
    stem=block.split('А)')[0]
    stem=re.split(r'к каждому|к каждой',stem,flags=re.I)[0]
    stem=stem.split(';')[0].split(':')[0]
    question=dict(type='match',text=clean(stem),left=left,right=right,correct=[int(n)-1 for n in MATCH_KEYS[variant-1]])
    text=text[:start]+text[end:]
    # Remove the answer table and keep the next complete choice task.
    text=re.sub(r'Запишите в таблицу[^\n]*\n[^\n]*','',text,count=1)
    return question,text

def grouping(text,variant):
    start=text.index('Выберите и запишите')
    end=re.search(r'(?im)\bОтвет\b|\bОтиет\b|Заполните пропуск',text[start:])
    block=text[start:start+end.start()] if end else text[start:].split('Заполните пропуск')[0]
    choices=list(re.finditer(r'(?<!\d)(1|2|3|4|8|83)\)\s*',block))
    assert len(choices)==4,(variant,'grouping',block)
    left=[clean(block[t.end():choices[i+1].start() if i+1<len(choices) else len(block)]) for i,t in enumerate(choices)]
    # Context before the instructions is essential for identifying the two objects.
    prefix=text[:start]
    answers=list(re.finditer(r'Ответ\s*[:;]',prefix))
    if answers:prefix=prefix[answers[-1].end():]
    prefix=re.sub(r'^\s*[\[\]| ]+','',prefix)
    answer=GROUP_KEYS[variant-1]
    return dict(type='match',text=clean(prefix),left=left,right=['Черты сходства','Черты различия'],correct=[0 if str(i+1) in answer[:2] else 1 for i in range(4)])

def main():
    root=Path('review/oge/ocr')
    variants=[];report=[]
    corrections=json.loads(Path('tools/oge_text_corrections.json').read_text(encoding='utf-8'))
    for variant in range(1,31):
        texts=[(root/f'page-{2+(variant-1)*6+i:03d}.txt').read_text(encoding='utf-8') for i in range(5)]
        questions={}
        combined=re.sub(r'Выберите\s+и\s+запишите','Выберите и запишите','\n\n'.join(texts))
        combined=re.sub(r'\bОтвет\s*(?=\[)', 'Ответ: ', combined)
        matching,remaining=match_block(combined,variant)
        questions[15]=matching
        items=singles(remaining.split('Выберите и запишите')[0])
        assert len(items)==13,(variant,'single count',len(items))
        questions.update(zip(SINGLE_KEYS,items))
        questions[19]=grouping(combined,variant)
        ordered=[]
        for number in SELECTED:
            q=questions[number]
            if number in SINGLE_KEYS:q['correct']=int(SINGLE_KEYS[number][variant-1])-1
            q.update(sourceVariant=variant,sourceTask=number)
            correction=corrections.get(f'{variant}.{number}',{})
            if 'textStart' in correction:
                assert correction['textStart'] in q['text'],(variant,number,'missing correction anchor')
                q['text']=q['text'][q['text'].index(correction['textStart']):]
            if 'text' in correction:q['text']=correction['text']
            q['explanation']='Эталон из таблицы ответов: '+(SINGLE_KEYS[number][variant-1] if number in SINGLE_KEYS else MATCH_KEYS[variant-1] if number==15 else GROUP_KEYS[variant-1])+'.'
            assert len(q['text'])>15,(variant,number,'short stem',q)
            ordered.append(q)
            report.append(f'{variant}.{len(ordered)} (original {number}) '+json.dumps(q,ensure_ascii=False))
        variants.append(dict(id=f'kotova-liskova-oge-social-2026-v{variant}',title=f'Вариант {variant}',questions=ordered))
    source=dict(subjectId='social_oge',id='kotova-liskova-oge-social-2026',title='Тренировочные варианты',year='2026',description='Котова-Лискова · ОГЭ · 2026',authorLine='Котова-Лискова · ОГЭ · 2026',variants=variants)
    Path('oge-interactive.js').write_text('window.localInteractiveSources = window.localInteractiveSources || [];\nwindow.localInteractiveSources.push('+json.dumps(source,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')
    Path('review/oge/tasks.txt').write_text('\n'.join(report),encoding='utf-8')
    print('Built 30 variants, 450 tasks')

if __name__=='__main__':main()
