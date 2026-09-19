from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v17')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (130, (190 / 1334, 330 / 1888, 1260 / 1334, 1320 / 1888)),
    'stamp.png': (131, (385 / 1334, 710 / 1888, 1050 / 1334, 1330 / 1888)),
    'schema.png': (132, (195 / 1334, 250 / 1888, 1250 / 1334, 625 / 1888)),
    'culture.png': (132, (195 / 1334, 735 / 1888, 1220 / 1334, 1495 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
