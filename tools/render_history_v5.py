from pathlib import Path
import pypdfium2 as pdf

document = pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('assets/oge-history/v5')
target.mkdir(parents=True, exist_ok=True)
regions = {
    'map.png': (37, (320/1334, 765/1888, 1105/1334, 1660/1888)),
    'coin.png': (38, (500/1334, 950/1888, 930/1334, 1390/1888)),
    'schema.png': (39, (300/1334, 270/1888, 1130/1334, 550/1888)),
    'culture.png': (39, (180/1334, 890/1888, 1110/1334, 1360/1888)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    width, height = image.size
    box = tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(fractions))
    image.crop(box).save(target / name)
