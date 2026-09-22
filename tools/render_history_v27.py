from pathlib import Path
import pypdfium2 as pdf
document=pdf.PdfDocument(r'C:\Users\Sellers Point\Downloads\Telegram Desktop\История ОГЭ 2026.pdf')
target=Path('assets/oge-history/v27');target.mkdir(parents=True,exist_ok=True)
regions={'map.png':(209,(380/1334,625/1888,1080/1334,1690/1888)),'medal.png':(210,(290/1334,650/1888,1070/1334,1110/1888)),'schema.png':(210,(50/1334,1370/1888,1280/1334,1660/1888)),'culture.png':(211,(200/1334,310/1888,1100/1334,790/1888))}
for name,(page,f) in regions.items():
 image=document[page-1].render(scale=3).to_pil();w,h=image.size;box=tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(f));image.crop(box).save(target/name)
