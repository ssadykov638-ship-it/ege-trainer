from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v19')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (146, (190 / 1334, 300 / 1888, 1225 / 1334, 1670 / 1888)),
    'stamp.png': (147, (390 / 1334, 970 / 1888, 1030 / 1334, 1430 / 1888)),
    'schema.png': (148, (190 / 1334, 250 / 1888, 1230 / 1334, 650 / 1888)),
    'culture.png': (148, (190 / 1334, 790 / 1888, 1215 / 1334, 1375 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
