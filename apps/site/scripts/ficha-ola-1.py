#!/usr/bin/env python3
"""Genera las fichas comerciales ES/EN de la primera ola de demos.

Fuente editorial: apps/site/src/content/{es,en}.json.
Activos: miniaturas y capturas aprobadas de los tenants.
Salida publicable: apps/site/public/*.pdf.
Salida de QA: output/pdf/*.pdf.

Dependencias editoriales: `python3 -m pip install -r scripts/requirements-ficha.txt`.
"""

from __future__ import annotations

import json
import shutil
from io import BytesIO
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas


REPO_ROOT = Path(__file__).resolve().parents[3]
CONTENT_DIR = REPO_ROOT / "apps/site/src/content"
PUBLIC_DIR = REPO_ROOT / "apps/site/public"
OUTPUT_DIR = REPO_ROOT / "output/pdf"

SITE_ORIGIN = "https://camp.logic2b.com"
PAGE_W, PAGE_H = A4
MARGIN = 42
CONTENT_W = PAGE_W - 2 * MARGIN

INK = HexColor("#171816")
PAPER = HexColor("#F4F4EF")
WHITE = HexColor("#FCFCF8")
MUTED = HexColor("#686B64")
BORDER = HexColor("#D5D7CF")
SAGE = HexColor("#C9D6B7")
LIME = HexColor("#DDF28B")

MINIATURES = {
    "olivar": REPO_ROOT / "tenants/olivar/content/media/miniatura.webp",
    "pinadamar": REPO_ROOT / "tenants/pinadamar/content/media/miniatura.webp",
    "mardefondo": REPO_ROOT / "tenants/mardefondo/content/media/miniatura.webp",
}

CAPTURES = (
    (
        REPO_ROOT / "tenants/olivar/content/media/capturas/tienda-1366.png",
        "olivar",
    ),
    (
        REPO_ROOT / "tenants/mardefondo/content/media/capturas/planning-1366.webp",
        "mardefondo",
    ),
    (
        REPO_ROOT / "tenants/mardefondo/content/media/capturas/inteligente-1366.webp",
        "mardefondo",
    ),
)

OUTPUTS = {
    "es": "logic2b-campings-primera-ola.pdf",
    "en": "logic2b-campings-first-wave.pdf",
}


def clean_text(value: str) -> str:
    """Mantiene el PDF en WinAnsi y evita guiones Unicode problemáticos."""

    return value.translate(
        str.maketrans(
            {
                "\u2010": "-",
                "\u2011": "-",
                "\u2012": "-",
                "\u2013": "-",
                "\u2014": "-",
                "\u2212": "-",
                "\u2018": "'",
                "\u2019": "'",
                "\u201c": '"',
                "\u201d": '"',
                "\u2192": "->",
            }
        )
    )


def split_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = clean_text(text).split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    *,
    font: str = "Helvetica",
    size: float = 10,
    leading: float | None = None,
    color: Color = INK,
    max_lines: int | None = None,
) -> float:
    line_height = leading or size * 1.3
    lines = split_lines(text, font, size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    pdf.setFont(font, size)
    pdf.setFillColor(color)
    for line in lines:
        pdf.drawString(x, y, line)
        y -= line_height
    return y


def draw_round_image(
    pdf: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    width: float,
    height: float,
    *,
    radius: float = 8,
    focus: tuple[float, float] = (0.5, 0.5),
) -> None:
    with Image.open(path) as source:
        source = source.convert("RGB")
        target_ratio = width / height
        source_ratio = source.width / source.height
        if source_ratio > target_ratio:
            crop_w = max(1, round(source.height * target_ratio))
            left = round((source.width - crop_w) * focus[0])
            left = min(max(0, left), source.width - crop_w)
            box = (left, 0, left + crop_w, source.height)
        else:
            crop_h = max(1, round(source.width / target_ratio))
            top = round((source.height - crop_h) * focus[1])
            top = min(max(0, top), source.height - crop_h)
            box = (0, top, source.width, top + crop_h)
        cropped = source.crop(box)
        pixel_w = max(1, round(width * 2))
        pixel_h = max(1, round(height * 2))
        rendered = ImageOps.fit(cropped, (pixel_w, pixel_h), Image.Resampling.LANCZOS)
        encoded = BytesIO()
        rendered.save(encoded, format="JPEG", quality=82, optimize=True, progressive=True)
        encoded.seek(0)

    pdf.saveState()
    clip = pdf.beginPath()
    clip.roundRect(x, y, width, height, radius)
    pdf.clipPath(clip, stroke=0, fill=0)
    pdf.drawImage(ImageReader(encoded), x, y, width, height, mask="auto")
    pdf.restoreState()


def draw_wordmark(pdf: canvas.Canvas, y: float) -> None:
    pdf.setFont("Helvetica-Bold", 10.5)
    pdf.setFillColor(INK)
    pdf.drawString(MARGIN, y, "Logic2B")
    x = MARGIN + pdfmetrics.stringWidth("Logic2B", "Helvetica-Bold", 10.5) + 4
    pdf.setFont("Helvetica", 10.5)
    pdf.setFillColor(MUTED)
    pdf.drawString(x, y, "Campings")


def draw_page_chrome(pdf: canvas.Canvas, page: int, total: int, footer: str) -> None:
    draw_wordmark(pdf, PAGE_H - 35)
    pdf.setFont("Helvetica-Bold", 7)
    pdf.setFillColor(MUTED)
    pdf.drawRightString(PAGE_W - MARGIN, PAGE_H - 35, f"{page:02d} / {total:02d}")
    pdf.setStrokeColor(BORDER)
    pdf.setLineWidth(0.5)
    pdf.line(MARGIN, 34, PAGE_W - MARGIN, 34)
    pdf.setFont("Helvetica", 6.7)
    pdf.setFillColor(MUTED)
    pdf.drawString(MARGIN, 21, clean_text(footer))


def draw_kicker(pdf: canvas.Canvas, text: str, x: float, y: float, color: Color = MUTED) -> None:
    pdf.setFillColor(color)
    pdf.setFont("Helvetica-Bold", 7.4)
    pdf.drawString(x, y, clean_text(text).upper())


def draw_pill(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    *,
    fill: Color = LIME,
    text_color: Color = INK,
) -> float:
    label = clean_text(text).upper()
    width = pdfmetrics.stringWidth(label, "Helvetica-Bold", 6.8) + 18
    pdf.setFillColor(fill)
    pdf.roundRect(x, y, width, 19, 9.5, stroke=0, fill=1)
    pdf.setFillColor(text_color)
    pdf.setFont("Helvetica-Bold", 6.8)
    pdf.drawString(x + 9, y + 6.3, label)
    return width


def absolute_url(path: str) -> str:
    return f"{SITE_ORIGIN}{path}" if path.startswith("/") else path


def draw_link_button(
    pdf: canvas.Canvas,
    label: str,
    url: str,
    x: float,
    y: float,
    width: float,
    *,
    dark: bool = True,
) -> None:
    fill = INK if dark else WHITE
    text_color = WHITE if dark else INK
    pdf.setFillColor(fill)
    pdf.roundRect(x, y, width, 29, 14.5, stroke=0, fill=1)
    pdf.setFillColor(text_color)
    pdf.setFont("Helvetica-Bold", 8)
    pdf.drawString(x + 13, y + 10, clean_text(label))
    pdf.drawRightString(x + width - 13, y + 10, "->")
    pdf.linkURL(url, (x, y, x + width, y + 29), relative=0)


def draw_qr(pdf: canvas.Canvas, url: str, x: float, y: float, size: float) -> None:
    widget = qr.QrCodeWidget(url)
    bounds = widget.getBounds()
    drawing = Drawing(size, size, transform=[size / (bounds[2] - bounds[0]), 0, 0, size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, pdf, x, y)
    pdf.linkURL(url, (x, y, x + size, y + size), relative=0)


def validate_inputs(portfolio: dict[str, Any]) -> None:
    items = portfolio.get("items", [])
    slugs = [item.get("slug") for item in items]
    if slugs != ["olivar", "pinadamar", "mardefondo"]:
        raise ValueError(f"Se esperaban olivar, pinadamar y mardefondo; recibido: {slugs}")
    missing = [str(path) for path in (*MINIATURES.values(), *(item[0] for item in CAPTURES)) if not path.is_file()]
    if missing:
        raise FileNotFoundError("Faltan activos aprobados:\n" + "\n".join(missing))


def cover_page(pdf: canvas.Canvas, portfolio: dict[str, Any], footer: str) -> None:
    doc = portfolio["ficha"]["documento"]
    draw_page_chrome(pdf, 1, 3, footer)
    draw_kicker(pdf, doc["portadaKicker"], MARGIN, 748)
    draw_text(
        pdf,
        doc["portadaTitulo"],
        MARGIN,
        712,
        485,
        font="Helvetica-Bold",
        size=31,
        leading=33,
        max_lines=3,
    )
    draw_text(pdf, doc["portadaTexto"], MARGIN, 596, 455, size=11.5, leading=16, color=MUTED)
    draw_pill(pdf, doc["portadaEtiqueta"], MARGIN, 524)

    items = portfolio["items"]
    gap = 8
    image_w = (CONTENT_W - 2 * gap) / 3
    for index, item in enumerate(items):
        x = MARGIN + index * (image_w + gap)
        draw_round_image(pdf, MINIATURES[item["slug"]], x, 202, image_w, 285, radius=8)
        pdf.setFillColor(Color(0, 0, 0, alpha=0.72))
        pdf.roundRect(x + 10, 216, image_w - 20, 59, 6, stroke=0, fill=1)
        pdf.setFillColor(WHITE)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(x + 20, 251, clean_text(item["nivel"]))
        pdf.setFont("Helvetica", 7.7)
        pdf.setFillColor(HexColor("#DFE1DA"))
        pdf.drawString(x + 20, 234, clean_text(item["escala"]))
        draw_text(pdf, item["perfil"], x + 20, 222, image_w - 38, size=7, leading=8, color=WHITE, max_lines=1)
    pdf.showPage()


def portfolio_page(pdf: canvas.Canvas, portfolio: dict[str, Any], footer: str) -> None:
    doc = portfolio["ficha"]["documento"]
    draw_page_chrome(pdf, 2, 3, footer)
    draw_kicker(pdf, doc["eleccionKicker"], MARGIN, 752)
    draw_text(pdf, doc["eleccionTitulo"], MARGIN, 718, 475, font="Helvetica-Bold", size=23, leading=25)

    card_h = 192
    card_gap = 8
    card_y = 650
    for index, item in enumerate(portfolio["items"]):
        y = card_y - index * (card_h + card_gap) - card_h
        pdf.setFillColor(WHITE)
        pdf.setStrokeColor(BORDER)
        pdf.roundRect(MARGIN, y, CONTENT_W, card_h, 9, stroke=1, fill=1)
        draw_round_image(pdf, MINIATURES[item["slug"]], MARGIN + 8, y + 8, 151, card_h - 16, radius=6)

        text_x = MARGIN + 176
        text_w = CONTENT_W - 190
        pill_w = draw_pill(pdf, item["nivel"], text_x, y + card_h - 32, fill=SAGE)
        pdf.setFont("Helvetica-Bold", 7.2)
        pdf.setFillColor(MUTED)
        pdf.drawString(text_x + pill_w + 8, y + card_h - 25.7, clean_text(f"{item['escala']} · {item['perfil']}"))
        draw_text(pdf, item["nombre"], text_x, y + card_h - 52, text_w, font="Helvetica-Bold", size=15, leading=17)
        draw_text(pdf, item["promesa"], text_x, y + card_h - 76, text_w, size=8.5, leading=11.5, color=MUTED, max_lines=3)

        draw_kicker(pdf, doc["recorrido"], text_x, y + 68, color=MUTED)
        journey_y = y + 52
        for step_index, step in enumerate(item["recorrido"]):
            pdf.setFillColor(INK)
            pdf.setFont("Helvetica-Bold", 6.5)
            pdf.drawString(text_x, journey_y, f"{step_index + 1:02d}")
            draw_text(pdf, step, text_x + 22, journey_y, text_w - 22, size=7.5, leading=9, max_lines=1)
            journey_y -= 14

        link_url = absolute_url(item["momentoHref"])
        moment_label = clean_text(f"{portfolio['momento']}: {item['momento']}")
        draw_text(pdf, moment_label, text_x, y + 10, text_w - 87, size=6.4, leading=7, color=MUTED, max_lines=1)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 7.2)
        link_label = clean_text(f"{doc['enlace']} ->")
        pdf.drawRightString(MARGIN + CONTENT_W - 14, y + 10, link_label)
        pdf.linkURL(link_url, (MARGIN + CONTENT_W - 89, y + 3, MARGIN + CONTENT_W - 10, y + 22), relative=0)
    pdf.showPage()


def comparison_page(pdf: canvas.Canvas, portfolio: dict[str, Any], footer: str) -> None:
    doc = portfolio["ficha"]["documento"]
    compare = portfolio["comparador"]
    items = portfolio["items"]
    draw_page_chrome(pdf, 3, 3, footer)
    draw_kicker(pdf, doc["comparacionKicker"], MARGIN, 752)
    draw_text(pdf, doc["comparacionTitulo"], MARGIN, 718, 475, font="Helvetica-Bold", size=23, leading=25)

    table_x = MARGIN
    table_top = 667
    label_w = 103
    column_w = (CONTENT_W - label_w) / 3
    header_h = 48
    row_h = 58
    rows = ("captacion", "operacion", "automatizacion", "decision")
    table_h = header_h + row_h * len(rows)

    pdf.setFillColor(INK)
    pdf.roundRect(table_x, table_top - table_h, CONTENT_W, table_h, 8, stroke=0, fill=1)
    for index, item in enumerate(items):
        x = table_x + label_w + index * column_w
        if index > 0:
            pdf.setStrokeColor(HexColor("#3B3D38"))
            pdf.line(x, table_top - table_h + 10, x, table_top - 10)
        draw_text(pdf, item["nivel"], x + 10, table_top - 19, column_w - 20, font="Helvetica-Bold", size=8.2, leading=9, color=LIME, max_lines=1)
        draw_text(pdf, item["nombre"], x + 10, table_top - 33, column_w - 20, font="Helvetica-Bold", size=8, leading=9, color=WHITE, max_lines=1)

    for row_index, key in enumerate(rows):
        row_top = table_top - header_h - row_index * row_h
        pdf.setStrokeColor(HexColor("#3B3D38"))
        pdf.line(table_x + 10, row_top, table_x + CONTENT_W - 10, row_top)
        draw_text(pdf, compare["filas"][key], table_x + 11, row_top - 17, label_w - 20, font="Helvetica-Bold", size=7.3, leading=9, color=SAGE, max_lines=2)
        for column_index, item in enumerate(items):
            x = table_x + label_w + column_index * column_w + 10
            draw_text(pdf, item["comparacion"][key], x, row_top - 17, column_w - 20, size=7.1, leading=9, color=HexColor("#E2E3DD"), max_lines=4)

    capture_y = 214
    capture_gap = 8
    capture_w = (CONTENT_W - 2 * capture_gap) / 3
    capture_h = 88
    captions = (
        items[0]["momento"],
        items[1]["momento"],
        items[2]["momento"],
    )
    for index, ((capture, slug), caption) in enumerate(zip(CAPTURES, captions, strict=True)):
        x = MARGIN + index * (capture_w + capture_gap)
        focus = (0.5, 0.35) if index == 0 else (0.5, 0.5)
        draw_round_image(pdf, capture, x, capture_y, capture_w, capture_h, radius=6, focus=focus)
        draw_text(pdf, caption, x, capture_y - 12, capture_w, font="Helvetica-Bold", size=6.8, leading=8, color=MUTED, max_lines=1)

    cta_y = 69
    cta_h = 113
    pdf.setFillColor(PAPER)
    pdf.roundRect(MARGIN, cta_y, CONTENT_W, cta_h, 9, stroke=0, fill=1)
    draw_kicker(pdf, doc["cierreKicker"], MARGIN + 17, cta_y + 91)
    draw_text(pdf, doc["cierreTitulo"], MARGIN + 17, cta_y + 70, 324, font="Helvetica-Bold", size=15, leading=17, max_lines=2)
    draw_text(pdf, doc["cierreTexto"], MARGIN + 17, cta_y + 31, 342, size=7.5, leading=9.5, color=MUTED, max_lines=3)

    contact_url = f"{SITE_ORIGIN}/#contacto"
    qr_size = 70
    draw_qr(pdf, contact_url, PAGE_W - MARGIN - qr_size - 17, cta_y + 22, qr_size)
    pdf.setFont("Helvetica-Bold", 6.5)
    pdf.setFillColor(INK)
    pdf.drawRightString(PAGE_W - MARGIN - 17, cta_y + 11, clean_text(doc["cierreCta"]))

    disclaimer = f"{doc['avisoTitulo']}: {portfolio['nota']}"
    draw_text(pdf, disclaimer, MARGIN, 55, CONTENT_W, size=5.8, leading=7, color=MUTED, max_lines=2)
    pdf.showPage()


def generate(locale: str) -> Path:
    content_path = CONTENT_DIR / f"{locale}.json"
    with content_path.open(encoding="utf-8") as handle:
        content = json.load(handle)
    portfolio = content["portfolio"]
    validate_inputs(portfolio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    filename = OUTPUTS[locale]
    qa_output = OUTPUT_DIR / filename
    public_output = PUBLIC_DIR / filename

    pdf = canvas.Canvas(
        str(qa_output),
        pagesize=A4,
        pageCompression=1,
        invariant=1,
    )
    pdf.setTitle(clean_text(portfolio["ficha"]["documento"]["portadaTitulo"]))
    pdf.setAuthor("Logic2B Campings")
    pdf.setSubject(clean_text(portfolio["ficha"]["texto"]))
    pdf.setCreator("Logic2B Campings · ficha-ola-1.py")

    footer = portfolio["ficha"]["documento"]["pie"]
    cover_page(pdf, portfolio, footer)
    portfolio_page(pdf, portfolio, footer)
    comparison_page(pdf, portfolio, footer)
    pdf.save()
    shutil.copyfile(qa_output, public_output)
    return qa_output


def main() -> None:
    generated = [generate(locale) for locale in ("es", "en")]
    for path in generated:
        print(f"generado: {path.relative_to(REPO_ROOT)} ({path.stat().st_size / 1024:.0f} kB)")


if __name__ == "__main__":
    main()
