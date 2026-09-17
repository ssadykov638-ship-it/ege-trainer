from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v2')
target.mkdir(parents=True, exist_ok=True)
# Include the map legend and both numbered cultural illustrations.
regions = {
    'map.png': (13, (337/1334, 813/1888, 1098/1334, 1631/1888)),
    'medal.png': (14, (372/1334, 983/1888, 1058/1334, 1368/1888)),
    'schema.png': (15, (288/1334, 262/1888, 1120/1334, 509/1888)),
    'culture.png': (15, (191/1334, 864/1888, 1105/1334, 1260/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
