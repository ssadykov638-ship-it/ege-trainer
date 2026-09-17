import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


# Search windows refer to the chart grid, not the surrounding exercise text.
WINDOWS = {
    4:(.51,.72),5:(.16,.36),6:(.49,.70),7:(.70,.89),8:(.33,.55),
    9:(.70,.92),10:(.45,.68),11:(.70,.93),12:(.33,.58),13:(.35,.59),
    14:(.68,.92),15:(.40,.65),16:(.39,.64),17:(.67,.90),18:(.47,.72),
    19:(.37,.60),20:(.67,.91),21:(.69,.93),22:(.14,.35),23:(.70,.92),
    24:(.42,.66),25:(.55,.79),26:(.32,.56),27:(.65,.88),28:(.29,.54),
    29:(.44,.69),30:(.62,.85),
}

# Verified source-page rectangles in the 390px review thumbnails (30px header).
CROPS = {
    4:((45,315,224,415),(230,330,350,402)),
    5:((75,116,217,214),(222,120,376,203)),
    6:((88,288,250,396),(257,290,364,386)),
    7:((55,420,232,514),(238,422,364,508)),
    8:((67,207,208,307),(214,260,355,308)),
    9:((68,415,222,528),(228,430,374,508)),
    10:((50,268,209,384),(214,285,372,378)),
    11:((72,410,239,529),(248,465,375,519)),
    12:((60,250,193,370),(200,250,360,342)),
    13:((65,237,246,350),(251,240,377,338)),
    14:((56,412,219,533),(237,415,377,534)),
    15:((79,260,239,369),(247,262,357,354)),
    16:((47,250,209,380),(220,260,348,332)),
    17:((59,420,235,526),(239,426,374,514)),
    18:((63,293,213,403),(218,297,367,379)),
    19:((60,248,224,370),(230,255,355,357)),
    20:((61,409,219,495),(226,410,376,488)),
    21:((57,405,213,520),(219,414,374,500)),
    22:((50,118,215,214),(225,119,360,205)),
    23:((54,411,211,529),(220,420,375,515)),
    24:((58,267,238,380),(242,263,376,368)),
    25:((59,354,255,464),(262,356,369,439)),
    26:((57,262,236,393),(239,275,373,335)),
    27:((63,390,224,503),(236,375,374,515)),
    28:((55,194,200,290),(204,214,305,269)),
    29:((59,260,212,385),(218,268,375,380)),
    30:((58,398,200,517),(207,415,370,499)),
}


def layout(image, source):
    original = image.convert('RGB')
    def source_crop(rect):
        left,top,right,bottom=rect
        scale=original.width/390
        return original.crop((round(left*scale),round((top-30)*scale),round(right*scale),round((bottom-30)*scale)))
    graph_rect,legend_rect=map(list,CROPS[source])
    top_trim={4:5,8:8,15:8,17:8,22:4,25:5,28:9,29:7}
    bottom_extra={5:7,8:4,11:5,18:5,25:12,29:10,30:12}
    legend_extra={5:9,9:12,13:10,15:12,17:7,19:9,20:9,22:9,24:10,25:16,28:8,29:12}
    graph_rect[0]-=8
    if source==13:
        graph_rect[2]+=4
    graph_rect[1]+=top_trim.get(source,0)
    graph_rect[3]+=bottom_extra.get(source,0)
    legend_rect[3]+=legend_extra.get(source,0)
    graph=source_crop(graph_rect)
    legend=source_crop(legend_rect)
    graph = ImageOps.autocontrast(graph.convert('L'),cutoff=.2)
    legend = ImageOps.autocontrast(legend.convert('L'),cutoff=.2)
    output_width=1000
    graph=graph.resize((output_width,round(graph.height*output_width/graph.width)),Image.Resampling.LANCZOS)
    # Keep labels large enough to read at phone width, as in the test variant.
    legend=legend.resize((output_width-80,round(legend.height*(output_width-80)/legend.width)),Image.Resampling.LANCZOS)
    result=Image.new('RGB',(output_width,graph.height+legend.height+60),'white')
    result.paste(graph,(0,0))
    result.paste(legend,(40,graph.height+30))
    return result,dict(source=source,graph=graph_rect,legend=legend_rect,size=list(result.size))


def main():
    Path('review').mkdir(exist_ok=True)
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-root',type=Path,required=True)
    args=parser.parse_args()
    report=[]
    for source in WINDOWS:
        pages=sorted((args.source_root/'social2026_variants_raw_v2'/f'variant-{source:02d}').glob('*.png'))
        result,diagnostics=layout(Image.open(pages[3 if source in (5,22) else 2]),source)
        out=Path('assets/social2026-charts')/f'variant-{source:02d}'
        out.mkdir(parents=True,exist_ok=True)
        result.save(out/'chart.webp','WEBP',quality=94,method=6)
        report.append(diagnostics)
    Path('review/chart-layout.json').write_text(json.dumps(report,indent=2))
    text=Path('local-interactive.js').read_text(encoding='utf-8')
    data=json.loads(text[text.index('push(')+5:text.rindex(');')])
    for variant in data['variants'][2:]:
        number=int(variant['title'].split()[-1])
        question=variant['questions'][8]
        question.update(isChart=True,image=f'./assets/social2026-charts/variant-{number+1:02d}/chart.webp',alt='Диаграмма с полной легендой')
    Path('local-interactive.js').write_text('window.localInteractiveSources = window.localInteractiveSources || [];\nwindow.localInteractiveSources.push('+json.dumps(data,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')


if __name__=='__main__':
    main()
