from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 630
BG = (11, 12, 17)
INK = (233, 231, 227)
MUTED = (133, 132, 151)
FAINT = (50, 53, 68)
VIOLET = (154, 140, 255)
BLUE = (110, 168, 255)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# fine grid
for x in range(0, W, 80):
    d.line([(x, 0), (x, H)], fill=(20, 22, 30), width=1)
for y in range(0, H, 80):
    d.line([(0, y), (W, y)], fill=(20, 22, 30), width=1)

# register marks
d.line([(40, 40), (72, 40)], fill=VIOLET, width=2)
d.line([(40, 40), (40, 72)], fill=VIOLET, width=2)
d.line([(W - 40, H - 40), (W - 72, H - 40)], fill=BLUE, width=2)
d.line([(W - 40, H - 40), (W - 40, H - 72)], fill=BLUE, width=2)

font_cn = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 104)
font_cn_small = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 26)
font_mono = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
font_mono_bold = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)

def tracked(draw, xy, text, font, fill, spacing=3):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing

# top
d.rectangle([(40, 34), (78, 72)], outline=VIOLET, width=2)
d.text((48, 43), "LX", font=font_mono_bold, fill=VIOLET)
tracked(d, (94, 44), "LEERSXIE / NOCTILUX", font_mono, MUTED, 2)
tracked(d, (W - 328, 44), "PERSONAL ARCHIVE", font_mono, MUTED, 2)
d.line([(40, 96), (W - 40, 96)], fill=FAINT, width=1)

# main title
d.text((40, 174), "夜航档案", font=font_cn, fill=INK)
d.rectangle([(44, 316), (54, 400)], fill=VIOLET)
tracked(d, (78, 326), "NOTES FROM A QUIET ORBIT", font_mono_bold, INK, 3)
d.text((78, 360), "文章、项目，和那些暂时还没想清楚的事。", font=font_cn_small, fill=MUTED)

# bottom
d.line([(40, H - 94), (W - 40, H - 94)], fill=FAINT, width=1)
tracked(d, (40, H - 70), "ARTICLES / PROJECTS / NOTES", font_mono, MUTED, 2)
tracked(d, (W - 244, H - 70), "LEERSXIE.GITHUB.IO", font_mono, BLUE, 2)

# corner number
d.text((W - 120, 172), "01", font=font_mono, fill=FAINT)
d.line([(W - 120, 200), (W - 40, 200)], fill=FAINT, width=1)

Path("public").mkdir(exist_ok=True)
img.save("public/og-default.png", optimize=True)
print("wrote public/og-default.png", img.size)
