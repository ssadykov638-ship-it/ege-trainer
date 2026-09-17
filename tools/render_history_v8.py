from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v8')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (61, (190 / 1334, 875 / 1888, 1238 / 1334, 1528 / 1888)),
    'coin.png': (62, (285 / 1334, 825 / 1888, 1090 / 1334, 1275 / 1888)),
    'schema.png': (63, (145 / 1334, 260 / 1888, 1170 / 1334, 595 / 1888)),
    'culture.png': (63, (170 / 1334, 970 / 1888, 1215 / 1334, 1235 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
