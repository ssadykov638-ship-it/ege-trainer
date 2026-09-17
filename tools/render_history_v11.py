from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v11')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (85, (210 / 1334, 285 / 1888, 1235 / 1334, 940 / 1888)),
    'stamp.png': (86, (750 / 1334, 215 / 1888, 1240 / 1334, 575 / 1888)),
    'schema.png': (86, (185 / 1334, 835 / 1888, 1255 / 1334, 1045 / 1888)),
    'culture.png': (86, (180 / 1334, 1330 / 1888, 1130 / 1334, 1730 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
