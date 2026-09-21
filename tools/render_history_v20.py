from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v20')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (154, (190 / 1334, 285 / 1888, 1270 / 1334, 990 / 1888)),
    'stamp.png': (155, (360 / 1334, 260 / 1888, 1060 / 1334, 805 / 1888)),
    'schema.png': (155, (175 / 1334, 1160 / 1888, 1250 / 1334, 1695 / 1888)),
    'culture.png': (156, (190 / 1334, 315 / 1888, 1210 / 1334, 835 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
