from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v29')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (225, (185 / 1334, 760 / 1888, 1270 / 1334, 1580 / 1888)),
    'medal.png': (226, (330 / 1334, 825 / 1888, 1080 / 1334, 1425 / 1888)),
    'schema.png': (227, (50 / 1334, 230 / 1888, 1280 / 1334, 535 / 1888)),
    'culture.png': (227, (185 / 1334, 700 / 1888, 1260 / 1334, 1315 / 1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
