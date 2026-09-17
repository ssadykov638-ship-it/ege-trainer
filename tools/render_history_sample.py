from pathlib import Path
import pypdfium2 as pdf

SOURCE = Path(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
TARGET = Path('assets/oge-history/v1')
TARGET.mkdir(parents=True, exist_ok=True)
document = pdf.PdfDocument(SOURCE)
# Fractions of the full page; include all labels and map legends.
regions = {
    'map.png': (4, (210/893, 194/1263, 762/893, 935/1263)),
    'coin.png': (5, (286/893, 514/1263, 690/893, 890/1263)),
    'schema.png': (6, (122/893, 180/1263, 782/893, 377/1263)),
    'culture.png': (6, (120/893, 599/1263, 830/893, 1002/1263)),
    'table.png': (3, (121/893, 675/1263, 833/893, 865/1263)),
}
for name, (page, fractions) in regions.items():
    image = document[page - 1].render(scale=3).to_pil()
    w, h = image.size
    box = tuple(round(f * (w if index % 2 == 0 else h)) for index, f in enumerate(fractions))
    image.crop(box).save(TARGET / name)
    print(name)
