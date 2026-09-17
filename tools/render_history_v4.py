from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v4')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (29, (250/1334, 717/1888, 1190/1334, 1680/1888)),
    'medal.png': (30, (455/1334, 950/1888, 900/1334, 1395/1888)),
    'schema.png': (31, (165/1334, 285/1888, 1175/1334, 570/1888)),
    'culture.png': (31, (195/1334, 940/1888, 1245/1334, 1290/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
