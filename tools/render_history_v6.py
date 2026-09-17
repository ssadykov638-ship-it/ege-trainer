from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v6')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (45, (265/1334, 710/1888, 1145/1334, 1660/1888)),
    'stamp.png': (46, (420/1334, 930/1888, 1040/1334, 1390/1888)),
    'schema.png': (47, (175/1334, 275/1888, 1230/1334, 630/1888)),
    'culture.png': (47, (175/1334, 925/1888, 1210/1334, 1340/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
