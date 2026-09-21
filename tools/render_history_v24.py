from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v24')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (186, (290 / 1334, 300 / 1888, 1175 / 1334, 1465 / 1888)),
    'medal.png': (187, (315 / 1334, 970 / 1888, 1100 / 1334, 1375 / 1888)),
    'schema.png': (188, (150 / 1334, 275 / 1888, 1230 / 1334, 585 / 1888)),
    'culture.png': (188, (195 / 1334, 790 / 1888, 1270 / 1334, 1325 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
