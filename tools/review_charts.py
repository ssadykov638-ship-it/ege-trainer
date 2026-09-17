from pathlib import Path
from PIL import Image, ImageDraw

Path('review').mkdir(exist_ok=True)

for batch in range(3):
    sheet=Image.new('RGB',(1200,1800),'#eee')
    draw=ImageDraw.Draw(sheet)
    for index,source in enumerate(range(4+batch*9,13+batch*9)):
        image=Image.open(Path('assets/social2026-charts')/f'variant-{source:02d}'/'chart.webp')
        image.thumbnail((390,560))
        x,y=(index%3)*400,(index//3)*600
        sheet.paste(image,(x,y+30))
        draw.text((x+8,y+8),f'Source {source} / visible {source-1}',fill='black')
    sheet.save(f'review/final-charts-{batch}.jpg',quality=95)
