from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v25')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (194, (275 / 1334, 270 / 1888, 1205 / 1334, 1650 / 1888)),
    'coin.png': (195, (280 / 1334, 960 / 1888, 1120 / 1334, 1390 / 1888)),
    'schema.png': (196, (180 / 1334, 260 / 1888, 1245 / 1334, 625 / 1888)),
    'culture.png': (196, (190 / 1334, 820 / 1888, 1190 / 1334, 1470 / 1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
