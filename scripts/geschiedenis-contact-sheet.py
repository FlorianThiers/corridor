#!/usr/bin/env python3
"""Generate geschiedenis manifest contact sheet for review."""
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/geschiedenis/manifest.json"
OUT = Path("/opt/cursor/artifacts/geschiedenis-contact-sheet.png")

COLS = 4
THUMB_W = 320
THUMB_H = 200
LABEL_H = 88
PAD = 12
FONT_SIZE = 13
TITLE_H = 36


def file_number(path: str) -> str:
    name = Path(path).name
    m = re.match(r"(\d+)", name)
    return m.group(1) if m else "?"


def wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = sorted(
        data["items"],
        key=lambda e: int(file_number(e["path"])),
    )
    rows = (len(items) + COLS - 1) // COLS
    cell_w = THUMB_W + PAD * 2
    cell_h = THUMB_H + LABEL_H + PAD * 2
    width = COLS * cell_w + PAD
    height = TITLE_H + rows * cell_h + PAD

    sheet = Image.new("RGB", (width, height), (248, 248, 248))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", FONT_SIZE)
        title_font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16
        )
    except OSError:
        font = ImageFont.load_default()
        title_font = font

    draw.text(
        (PAD, 8),
        "Corridor geschiedenis — visuele controle (19 beelden)",
        fill=(20, 20, 20),
        font=title_font,
    )

    for idx, entry in enumerate(items):
        row, col = divmod(idx, COLS)
        x0 = PAD + col * cell_w
        y0 = TITLE_H + row * cell_h

        img_path = ROOT / "public" / entry["path"].lstrip("/")
        thumb = Image.open(img_path).convert("RGB")
        thumb.thumbnail((THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
        tx = x0 + PAD + (THUMB_W - thumb.width) // 2
        ty = y0 + PAD
        sheet.paste(thumb, (tx, ty))

        draw.rectangle(
            [x0, y0, x0 + cell_w - PAD, y0 + cell_h - PAD],
            outline=(180, 180, 180),
            width=1,
        )

        num = file_number(entry["path"])
        people = "ja" if entry.get("has_recognisable_people") else "nee"
        short_alt = entry["alt"]
        if len(short_alt) > 120:
            short_alt = short_alt[:117] + "…"

        label_y = y0 + PAD + THUMB_H + 6
        draw.text((x0 + PAD, label_y), f"{num}", fill=(0, 0, 0), font=title_font)
        for i, line in enumerate(wrap(draw, short_alt, font, THUMB_W)):
            draw.text((x0 + PAD, label_y + 20 + i * 15), line, fill=(40, 40, 40), font=font)
        draw.text(
            (x0 + PAD, label_y + 20 + 3 * 15),
            f"personen: {people}",
            fill=(120, 0, 0) if people == "ja" else (0, 90, 0),
            font=font,
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT} ({width}x{height})")


if __name__ == "__main__":
    main()
