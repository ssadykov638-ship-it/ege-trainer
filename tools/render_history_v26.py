from pathlib import Path
import pypdfium2 as pdf
document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v26'); target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (202, (190 / 1334, 285 / 1888, 1260 / 1334, 1385 / 1888)),
    'assignation.png': (203, (385 / 1334, 650 / 1888, 1060 / 1334, 1085 / 1888)),
    'schema.png': (203, (285 / 1334, 1420 / 1888, 1150 / 1334, 1660 / 1888)),
    'culture.png': (204, (185 / 1334, 300 / 1888, 1030 / 1334, 880 / 1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil(); width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
