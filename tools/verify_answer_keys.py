import argparse
import ast
import json
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--source-root',type=Path,required=True)
args=parser.parse_args()
text=Path('local-interactive.js').read_text(encoding='utf-8')
data=json.loads(text[text.index('push(')+5:text.rindex(');')])
tree=ast.parse((args.source_root/'build_social2026_interactive.py').read_text(encoding='utf-8'))
keys={node.targets[0].id:ast.literal_eval(node.value) for node in tree.body if isinstance(node,ast.Assign) and isinstance(node.targets[0],ast.Name) and node.targets[0].id in ('ANSWERS_1_8','ANSWERS_9_16')}
count=0
for visible,variant in enumerate(data['variants'],1):
    source=visible if visible<3 else visible+1
    expected=keys['ANSWERS_1_8'][source]+keys['ANSWERS_9_16'][source]
    assert len(variant['questions'])==len(expected)==16
    for number,(question,answer) in enumerate(zip(variant['questions'],expected),1):
        assert question['type'] in ('multi','match')
        actual=''.join(str(index+1) for index in question['correct'])
        valid=sorted(actual)==sorted(answer) if question['type']=='multi' else actual==answer
        assert valid,f'{visible}.{number}: {actual} != {answer}'
        count+=1
print(f'Checked {count} keys against source answer tables')
