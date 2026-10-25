"""Generate deterministic 1200x630 social cards.

The PNGs are committed to public/og/ and the build only references them, so CI
does not need Pillow or a CJK font. Re-run this script after editing titles or
adding a published post:

    python scripts/make-og.py
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (11, 12, 17)
INK = (233, 231, 227)
MUTED = (133, 132, 151)
FAINT = (43, 46, 61)
VIOLET = (154, 140, 255)
BLUE = (110, 168, 255)
ORANGE = (232, 150, 95)

FONT_DIR = Path("C:/Windows/Fonts")
FONT_CN_BOLD = FONT_DIR / "msyhbd.ttc"
FONT_CN = FONT_DIR / "msyh.ttc"
FONT_MONO = FONT_DIR / "consola.ttf"
FONT_MONO_BOLD = FONT_DIR / "consolab.ttf"

posts_dir = Path("content/posts")
out_dir = Path("public/og")


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if path.exists():
        return ImageFont.truetype(str(path), size)
    # Deterministic Linux fallback for manual regeneration only.
    for candidate in (
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


MONO = font(FONT_MONO, 18)
MONO_BOLD = font(FONT_MONO_BOLD, 20)
CN_SMALL = font(FONT_CN, 26)
CN_BODY = font(FONT_CN, 22)


def tracked(draw: ImageDraw.ImageDraw, xy, text, fnt, fill, spacing=2):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=fnt, fill=fill)
        x += draw.textlength(char, font=fnt) + spacing


def read_frontmatter(text: str) -> dict[str, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        return {}
    result: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip().strip('"').strip("'")
    return result


def wrap_cjk(text: str, fnt, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = current + char
        if current and fnt.getlength(candidate) > max_width:
            lines.append(current)
            current = char
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def card_base(draw: ImageDraw.ImageDraw, accent, register_color):
    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(20, 22, 30), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(20, 22, 30), width=1)
    draw.line([(40, 40), (72, 40)], fill=register_color, width=2)
    draw.line([(40, 40), (40, 72)], fill=register_color, width=2)
    draw.line([(W - 40, H - 40), (W - 72, H - 40)], fill=register_color, width=2)
    draw.line([(W - 40, H - 40), (W - 40, H - 72)], fill=register_color, width=2)
    draw.rectangle([(40, 34), (78, 72)], outline=accent, width=2)


def header(draw, label_right):
    draw.text((48, 43), "LX", font=MONO_BOLD, fill=VIOLET)
    tracked(draw, (94, 44), "LEERSXIE / NOCTILUX", MONO, MUTED, 2)
    tracked(draw, (W - 360, 44), label_right, MONO, MUTED, 2)
    draw.line([(40, 96), (W - 40, 96)], fill=FAINT, width=1)


def footer(draw, left, right):
    draw.line([(40, H - 94), (W - 40, H - 94)], fill=FAINT, width=1)
    tracked(draw, (40, H - 70), left, MONO, MUTED, 2)
    tracked(draw, (W - 410, H - 70), right, MONO, BLUE, 2)


def make_default():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    card_base(draw, VIOLET, BLUE)
    header(draw, "PERSONAL ARCHIVE")
    title = font(FONT_CN_BOLD, 104)
    draw.text((40, 174), "夜航档案", font=title, fill=INK)
    draw.rectangle([(44, 316), (54, 400)], fill=VIOLET)
    tracked(draw, (78, 326), "NOTES FROM A QUIET ORBIT", MONO_BOLD, INK, 3)
    draw.text((78, 360), "文章、项目，和那些暂时还没想清楚的事。", font=CN_SMALL, fill=MUTED)
    draw.text((W - 120, 172), "01", font=MONO, fill=FAINT)
    draw.line([(W - 120, 200), (W - 40, 200)], fill=FAINT, width=1)
    footer(draw, "ARTICLES / PROJECTS / NOTES", "LEERSXIE.GITHUB.IO/LX-BLOG2.0")
    Path("public").mkdir(exist_ok=True)
    img.save("public/og-default.png", optimize=True)
    print("wrote public/og-default.png")


def make_post(path: Path, index: int, total: int):
    fm = read_frontmatter(path.read_text(encoding="utf-8"))
    title = fm.get("title", path.stem)
    date = fm.get("published", "")
    category = fm.get("category", "未分类")
    tags = [tag.strip().strip('"').strip("'") for tag in fm.get("tags", "").strip("[]").split(",") if tag.strip()]
    digest = hashlib.sha1(path.stem.encode("utf-8")).hexdigest()
    accent = VIOLET if int(digest[:2], 16) % 2 == 0 else BLUE

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    card_base(draw, accent, accent)
    header(draw, f"DOC. {index:02d} / {total:02d}")

    # Right-side deterministic index field.
    draw.line([(820, 120), (820, H - 120)], fill=FAINT, width=1)
    for offset in range(0, 4):
        y = 150 + offset * 88
        draw.line([(846, y), (1110, y + 42)], fill=(28, 31, 43), width=1)
    number = font(FONT_MONO_BOLD, 112)
    draw.text((850, 170), f"{index:02d}", font=number, fill=accent)
    small = font(FONT_MONO, 16)
    tracked(draw, (850, 320), "ARCHIVE ENTRY", small, MUTED, 2)
    draw.line([(850, 350), (1090, 350)], fill=FAINT, width=1)
    draw.text((850, 374), date, font=MONO, fill=INK)
    draw.text((850, 408), category, font=CN_BODY, fill=MUTED)

    # Left title.
    title_size = 72 if len(title) <= 12 else 60 if len(title) <= 20 else 52
    title_font = font(FONT_CN_BOLD, title_size)
    lines = wrap_cjk(title, title_font, 700)
    y = 158
    for line in lines[:4]:
        draw.text((40, y), line, font=title_font, fill=INK)
        y += int(title_size * 1.28)

    # Tag strip.
    draw.line([(40, 392), (760, 392)], fill=FAINT, width=1)
    tag_text = "  /  ".join(tags[:3]) if tags else "NO TAGS"
    draw.text((40, 414), tag_text, font=CN_BODY, fill=MUTED)
    draw.text((40, 462), "夜航档案 · 个人技术记录", font=CN_BODY, fill=MUTED)

    footer(draw, f"NOCTILUX / {path.stem.upper()}", "LEERSXIE.GITHUB.IO/LX-BLOG2.0")
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / f"{path.stem}.png"
    img.save(target, optimize=True)
    print(f"wrote {target}")


make_default()
post_files = []
for path in posts_dir.glob("*.md"):
    fm = read_frontmatter(path.read_text(encoding="utf-8"))
    if fm.get("draft", "false").lower() == "true":
        continue
    post_files.append((fm.get("published", "0000-00-00"), path))
post_files.sort(key=lambda item: item[0], reverse=True)
for i, (_, post) in enumerate(post_files, start=1):
    make_post(post, i, len(post_files))
