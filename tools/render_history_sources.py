from pathlib import Path
import pypdfium2 as pdf

source = Path(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target = Path('review/history/pages')
target.mkdir(parents=True, exist_ok=True)
document = pdf.PdfDocument(source)
for number in range(2, 248):
    path = target / f'page-{number:03d}.png'
    if not path.exists():
        page = document[number - 1]
        bitmap = page.render(scale=2.5)
        bitmap.to_pil().save(path)
        bitmap.close()
        page.close()
    print(number, flush=True)
