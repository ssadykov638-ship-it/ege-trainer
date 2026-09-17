from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v7')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (53, (330/1334, 745/1888, 1090/1334, 1535/1888)),
    'medal.png': (54, (500/1334, 900/1888, 945/1334, 1370/1888)),
    'schema.png': (55, (280/1334, 260/1888, 1120/1334, 650/1888)),
    'culture.png': (55, (170/1334, 1005/1888, 1230/1334, 1435/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
