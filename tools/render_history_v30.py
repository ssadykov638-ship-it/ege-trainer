from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v30')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (233, (300 / 1334, 665 / 1888, 1110 / 1334, 1745 / 1888)),
    'coin.png': (234, (265 / 1334, 890 / 1888, 1110 / 1334, 1425 / 1888)),
    'schema.png': (235, (50 / 1334, 225 / 1888, 1280 / 1334, 575 / 1888)),
    'culture.png': (235, (180 / 1334, 715 / 1888, 1260 / 1334, 1340 / 1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
