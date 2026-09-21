from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v21')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (162, (320 / 1334, 320 / 1888, 1130 / 1334, 1515 / 1888)),
    'medal.png': (163, (215 / 1334, 895 / 1888, 1220 / 1334, 1415 / 1888)),
    'schema.png': (164, (250 / 1334, 250 / 1888, 1140 / 1334, 650 / 1888)),
    'culture.png': (164, (185 / 1334, 735 / 1888, 1110 / 1334, 1355 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
