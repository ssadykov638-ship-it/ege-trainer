from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v22')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (170, (325 / 1334, 330 / 1888, 1225 / 1334, 1390 / 1888)),
    'coin.png': (171, (215 / 1334, 710 / 1888, 1220 / 1334, 1035 / 1888)),
    'schema.png': (171, (180 / 1334, 1415 / 1888, 1210 / 1334, 1625 / 1888)),
    'culture.png': (172, (190 / 1334, 320 / 1888, 1190 / 1334, 810 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
