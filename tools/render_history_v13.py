from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v13')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (99, (270 / 1334, 685 / 1888, 1172 / 1334, 1668 / 1888)),
    'medal.png': (100, (300 / 1334, 985 / 1888, 1138 / 1334, 1395 / 1888)),
    'schema.png': (101, (300 / 1334, 275 / 1888, 1120 / 1334, 610 / 1888)),
    'culture.png': (101, (190 / 1334, 805 / 1888, 1215 / 1334, 1365 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
