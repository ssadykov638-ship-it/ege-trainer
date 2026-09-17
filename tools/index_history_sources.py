import json
import re
from pathlib import Path

root = Path('review/history/ocr')
pages = {int(path.stem[-3:]): path.read_text(encoding='utf-8') for path in root.glob('*.txt')}
starts = [number for number, text in sorted(pages.items()) if number < 240 and re.search(r'Часть\s+1', text)]
assert len(starts) == 30, f'Expected 30 first-part starts, got {len(starts)}'
variants = []
for index, first in enumerate(starts):
    next_start = starts[index + 1] if index + 1 < len(starts) else 240
    second_part = next((number for number in range(first, next_start)
                        if re.search(r'Часть\s+2', pages[number])), None)
    assert second_part is not None, f'Missing second-part boundary: {index + 1}'
    variants.append(dict(variant=index + 1, firstPage=first,
                         firstPartPages=list(range(first, second_part)),
                         sourceTasks=list(range(1, 18)),
                         answerPage=240 if index < 2 else 241 + (index - 2) // 4,
                         adaptationStatus='verified sample' if index == 0 else 'OCR only; not adapted'))
manifest = dict(source='История ОГЭ 2026.pdf', variants=variants,
                sharedMaterials={'map': [8, 9, 10], 'culture': [13, 14], 'worldHistoryEvents': [15, 16, 17]},
                warning='Page indexing and OCR are preparation, not a completed adaptation or answer-key verification.')
Path('tools/history-source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print('Indexed all 30 variants; source tasks 1-17 and shared-material dependencies retained.')
