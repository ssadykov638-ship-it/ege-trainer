import json
import re
from pathlib import Path


def main():
    content = Path('oge-interactive.js').read_text(encoding='utf-8')
    source = json.loads(content[content.index('push(') + 5:content.rindex(');')])
    findings = []
    checked = 0
    for variant in source['variants']:
        for index, question in enumerate(variant['questions'], 1):
            checked += 1
            fields = {'text': [question['text']]}
            fields.update({key: question[key] for key in ('options', 'left', 'right') if key in question})
            for field, values in fields.items():
                for row, text in enumerate(values):
                    reasons = []
                    if re.search(r'^\d{1,2}\s*\|', text): reasons.append('boxed task number')
                    if re.search(r'\bОтвет\b|(?<!\d)[1-4]\)', text): reasons.append('adjacent task or answer block')
                    if re.search(r'[|@_©\\]|[А-Яа-я]{22}', text): reasons.append('suspicious OCR symbols')
                    if re.search(r'[А-Яа-я]/|/[А-Яа-я]|\^', text): reasons.append('corrupted word or watermark')
                    if field == 'text' and re.match(r'[а-я]', text): reasons.append('possibly missing start')
                    if reasons:
                        findings.append(dict(variant=question['sourceVariant'], task=index,
                                             sourceTask=question['sourceTask'], field=field, row=row,
                                             reasons=reasons, text=text))
    report = dict(checked=checked, findings=findings,
                  status='Automated audit only; a clean result does not certify source fidelity.')
    Path('review/oge/text-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Audited {checked} tasks across {len(source["variants"])} variants; {len(findings)} fields need source review.')
    for finding in findings:
        print(f'{finding["variant"]}.{finding["task"]} {finding["field"]}: {", ".join(finding["reasons"])}')


if __name__ == '__main__':
    main()
