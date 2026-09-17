from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v10')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (77, (210 / 1334, 775 / 1888, 1230 / 1334, 1685 / 1888)),
    'medal.png': (78, (285 / 1334, 1000 / 1888, 1125 / 1334, 1435 / 1888)),
    'schema.png': (79, (250 / 1334, 280 / 1888, 1100 / 1334, 545 / 1888)),
    'culture.png': (79, (180 / 1334, 890 / 1888, 1250 / 1334, 1225 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
