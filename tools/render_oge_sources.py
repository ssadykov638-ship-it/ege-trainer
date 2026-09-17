import argparse
from pathlib import Path
import pypdfium2 as pdf

parser=argparse.ArgumentParser()
parser.add_argument('pdf',type=Path)
args=parser.parse_args()
root=Path('review/oge/pages')
root.mkdir(parents=True,exist_ok=True)
document=pdf.PdfDocument(str(args.pdf))
for number in [182,183]+[2+v*6+p for v in range(30) for p in range(5)]:
    target=root/f'page-{number:03d}.png'
    if not target.exists():
        document[number-1].render(scale=3).to_pil().save(target)
print('Rendered 150 question pages and 2 answer-table pages')
