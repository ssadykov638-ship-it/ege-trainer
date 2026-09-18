from pathlib import Path

import pypdfium2 as pdf


document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v15')
target.mkdir(parents=True, exist_ok=True)

regions = {
    'map.png': (115, (220 / 1334, 290 / 1888, 1218 / 1334, 1668 / 1888)),
    'medal.png': (116, (205 / 1334, 1080 / 1888, 505 / 1334, 1545 / 1888)),
    'schema.png': (117, (180 / 1334, 230 / 1888, 1250 / 1334, 570 / 1888)),
    'culture.png': (117, (190 / 1334, 860 / 1888, 1250 / 1334, 1455 / 1888)),
}

for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
