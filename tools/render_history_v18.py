from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v18')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (138, (190 / 1334, 975 / 1888, 1238 / 1334, 1695 / 1888)),
    'stamp.png': (139, (390 / 1334, 845 / 1888, 990 / 1334, 1400 / 1888)),
    'schema.png': (140, (170 / 1334, 250 / 1888, 1305 / 1334, 560 / 1888)),
    'culture.png': (140, (190 / 1334, 800 / 1888, 1255 / 1334, 1305 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
