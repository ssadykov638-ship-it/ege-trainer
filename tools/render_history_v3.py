from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v3')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (21, (198/1334, 765/1888, 1249/1334, 1528/1888)),
    'stamp.png': (22, (240/1334, 807/1888, 1180/1334, 1310/1888)),
    'schema.png': (23, (275/1334, 260/1888, 1165/1334, 565/1888)),
    'culture.png': (23, (190/1334, 900/1888, 1165/1334, 1350/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
