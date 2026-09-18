from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v12')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (92, (295 / 1334, 280 / 1888, 1150 / 1334, 1120 / 1888)),
    'badge.png': (93, (870 / 1334, 200 / 1888, 1215 / 1334, 675 / 1888)),
    'schema.png': (93, (185 / 1334, 710 / 1888, 1255 / 1334, 930 / 1888)),
    'culture.png': (93, (180 / 1334, 1265 / 1888, 1120 / 1334, 1690 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
