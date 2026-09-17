import json
import runpy
from pathlib import Path

tables = runpy.run_path('tools/build_oge.py')
text = Path('oge-interactive.js').read_text(encoding='utf-8')
source = json.loads(text[text.index('push(') + 5:text.rindex(');')])
checked = 0
for variant_number, variant in enumerate(source['variants'], 1):
    assert len(variant['questions']) == len(tables['SELECTED']) == 15
    for visible, (original, question) in enumerate(zip(tables['SELECTED'], variant['questions']), 1):
        assert question['sourceTask'] == original
        assert question['sourceVariant'] == variant_number
        if original in tables['SINGLE_KEYS']:
            key = tables['SINGLE_KEYS'][original][variant_number - 1]
            expected = int(key) - 1
        elif original == 15:
            key = tables['MATCH_KEYS'][variant_number - 1]
            expected = [int(digit) - 1 for digit in key]
        else:
            key = tables['GROUP_KEYS'][variant_number - 1]
            expected = [0 if str(row) in key[:2] else 1 for row in range(1, 5)]
        assert question['correct'] == expected, (variant_number, visible, original)
        assert question['explanation'].endswith(key + '.')
        checked += 1
print(f'{checked} keys mapped to original task numbers, not shifted display numbers.')
print('This verifies mapping against transcribed constants, not an independent PDF transcription audit.')
