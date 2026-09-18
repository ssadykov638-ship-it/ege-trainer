from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v14')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (107, (205 / 1334, 310 / 1888, 1230 / 1334, 1645 / 1888)),
    'coin.png': (108, (280 / 1334, 955 / 1888, 1145 / 1334, 1435 / 1888)),
    'schema.png': (109, (350 / 1334, 255 / 1888, 1075 / 1334, 570 / 1888)),
    'culture.png': (109, (200 / 1334, 830 / 1888, 1240 / 1334, 1490 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(
        round(value * (width if index % 2 == 0 else height))
        for index, value in enumerate(fractions)
    )
    image.crop(box).save(target / name)
