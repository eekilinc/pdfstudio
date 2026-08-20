import { PDFDocument, rgb, degrees, StandardFonts, PDFPage, LineCapStyle } from 'pdf-lib';
import type { Annotation, PDFDocumentState, TextAnnotation, DrawingAnnotation, ShapeAnnotation, SignatureAnnotation, StampAnnotation, RedactionAnnotation } from '../types/pdf';

// Sanitize characters for standard PDF 14 WinAnsi fonts
export function toWinAnsi(str: string): string {
  if (!str) return '';
  return str
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

// Parse hex color string '#RRGGBB' to pdf-lib rgb(r, g, b)
export function hexToRgb(hex: string) {
  if (!hex || hex === 'transparent') return null;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return rgb(0, 0, 0);
  const num = parseInt(cleanHex, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

export async function exportModifiedPdf(docState: PDFDocumentState): Promise<Uint8Array> {
  if (!docState.data) {
    throw new Error('No PDF document loaded.');
  }

  // Load existing PDF document
  const srcDoc = await PDFDocument.load(docState.data);
  const outDoc = await PDFDocument.create();

  // Pre-embed standard fonts
  const fontHelvetica = await outDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await outDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await outDoc.embedFont(StandardFonts.TimesRoman);
  const fontCourier = await outDoc.embedFont(StandardFonts.Courier);

  // Copy pages in the desired order (filtering out deleted ones)
  const validPageIndices = docState.pageOrder.filter(idx => {
    const pageState = docState.pages.find(p => p.pageIndex === idx);
    return pageState && !pageState.isDeleted;
  });

  if (validPageIndices.length === 0) {
    throw new Error('Belgede kaydedilecek sayfa bulunamadı.');
  }

  for (let i = 0; i < validPageIndices.length; i++) {
    const pageIndex = validPageIndices[i];
    const pageState = docState.pages.find(p => p.pageIndex === pageIndex);
    if (!pageState) continue;

    let outPage: PDFPage;

    if (pageState.isBlank || pageState.originalPageNumber === 0) {
      // Create a pristine blank page
      outPage = outDoc.addPage([pageState.width || 595.28, pageState.height || 841.89]);
    } else {
      // Copy existing page from source doc
      const [copiedPage] = await outDoc.copyPages(srcDoc, [pageState.originalPageNumber - 1]);
      outPage = outDoc.addPage(copiedPage);
    }

    // Apply rotation
    if (pageState && pageState.rotation !== undefined) {
      const currentRot = outPage.getRotation().angle;
      outPage.setRotation(degrees((currentRot + pageState.rotation) % 360));
    }

    // Get current page dimensions for coordinate matching
    const { width: _pWidth, height: pHeight } = outPage.getSize();

    // Render annotations for this page
    const pageAnnotations = docState.annotations[pageIndex] || [];

    for (const ann of pageAnnotations) {
      try {
        await renderAnnotationToPdfPage(ann, outPage, outDoc, pHeight, {
          Helvetica: fontHelvetica,
          HelveticaBold: fontHelveticaBold,
          Times: fontTimes,
          Courier: fontCourier,
        });
      } catch (err) {
        console.error('Annotation render error for', ann.id, err);
      }
    }
  }

  return await outDoc.save();
}

async function renderAnnotationToPdfPage(
  ann: Annotation,
  page: PDFPage,
  doc: PDFDocument,
  pHeight: number,
  fonts: Record<string, any>
) {
  // Convert standard coordinate system (Origin at top-left in web canvas vs bottom-left in PDF)
  // ann.y in canvas is from top, so pdfY = pHeight - ann.y - ann.height (or specific point)

  const strokeColor = hexToRgb(ann.color) || rgb(0, 0, 0);
  const opacity = ann.opacity !== undefined ? ann.opacity : 1.0;

  switch (ann.type) {
    case 'redact': {
      const redactAnn = ann as RedactionAnnotation;
      const pdfY = pHeight - redactAnn.y - redactAnn.height;
      const fillRgb = hexToRgb(redactAnn.color || '#000000') || rgb(0, 0, 0);
      page.drawRectangle({
        x: redactAnn.x,
        y: pdfY,
        width: redactAnn.width,
        height: redactAnn.height,
        color: fillRgb,
        opacity: 1.0,
      });
      break;
    }

    case 'rect': {
      const shape = ann as ShapeAnnotation;
      const pdfY = pHeight - shape.y - shape.height;
      const fillRgb = shape.fillColor && shape.fillColor !== 'transparent' ? hexToRgb(shape.fillColor) : undefined;
      page.drawRectangle({
        x: shape.x,
        y: pdfY,
        width: shape.width,
        height: shape.height,
        borderColor: strokeColor,
        borderWidth: shape.strokeWidth || 2,
        color: fillRgb || undefined,
        opacity: opacity,
      });
      break;
    }

    case 'circle': {
      const shape = ann as ShapeAnnotation;
      const radiusX = shape.width / 2;
      const radiusY = shape.height / 2;
      const centerX = shape.x + radiusX;
      const centerY = pHeight - (shape.y + radiusY);
      const fillRgb = shape.fillColor && shape.fillColor !== 'transparent' ? hexToRgb(shape.fillColor) : undefined;

      page.drawEllipse({
        x: centerX,
        y: centerY,
        xScale: radiusX,
        yScale: radiusY,
        borderColor: strokeColor,
        borderWidth: shape.strokeWidth || 2,
        color: fillRgb || undefined,
        opacity: opacity,
      });
      break;
    }

    case 'line': {
      const shape = ann as ShapeAnnotation;
      const startX = shape.x;
      const startY = pHeight - shape.y;
      const endX = shape.endX !== undefined ? shape.endX : shape.x + shape.width;
      const endY = pHeight - (shape.endY !== undefined ? shape.endY : shape.y + shape.height);

      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        thickness: shape.strokeWidth || 2,
        color: strokeColor,
        opacity: opacity,
      });
      break;
    }

    case 'arrow': {
      const shape = ann as ShapeAnnotation;
      const startX = shape.x;
      const startY = pHeight - shape.y;
      const endX = shape.endX !== undefined ? shape.endX : shape.x + shape.width;
      const endY = pHeight - (shape.endY !== undefined ? shape.endY : shape.y + shape.height);
      const thickness = shape.strokeWidth || 2;

      // Draw main line
      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        thickness: thickness,
        color: strokeColor,
        opacity: opacity,
      });

      // Calculate arrow head points
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLen = Math.max(12, thickness * 4);
      const arrowAngle = Math.PI / 6; // 30 degrees

      const leftX = endX - headLen * Math.cos(angle - arrowAngle);
      const leftY = endY - headLen * Math.sin(angle - arrowAngle);
      const rightX = endX - headLen * Math.cos(angle + arrowAngle);
      const rightY = endY - headLen * Math.sin(angle + arrowAngle);

      page.drawLine({
        start: { x: endX, y: endY },
        end: { x: leftX, y: leftY },
        thickness: thickness,
        color: strokeColor,
        opacity: opacity,
      });

      page.drawLine({
        start: { x: endX, y: endY },
        end: { x: rightX, y: rightY },
        thickness: thickness,
        color: strokeColor,
        opacity: opacity,
      });
      break;
    }

    case 'pen':
    case 'highlighter': {
      const drawAnn = ann as DrawingAnnotation;
      if (!drawAnn.points || drawAnn.points.length < 2) break;

      const isHighlighter = drawAnn.type === 'highlighter';
      const drawOpacity = isHighlighter ? (drawAnn.opacity || 0.4) : (drawAnn.opacity || 1.0);
      const thickness = drawAnn.strokeWidth || (isHighlighter ? 18 : 3);

      for (let i = 0; i < drawAnn.points.length - 1; i++) {
        const p1 = drawAnn.points[i];
        const p2 = drawAnn.points[i + 1];

        page.drawLine({
          start: { x: p1.x, y: pHeight - p1.y },
          end: { x: p2.x, y: pHeight - p2.y },
          thickness: thickness,
          color: strokeColor,
          opacity: drawOpacity,
          lineCap: LineCapStyle.Round,
        });
      }
      break;
    }

    case 'text': {
      const textAnn = ann as TextAnnotation;
      let font = fonts.Helvetica;
      if (textAnn.fontWeight === 'bold') {
        font = fonts.HelveticaBold;
      }
      if (textAnn.fontFamily === 'Times New Roman' || textAnn.fontFamily === 'serif') {
        font = fonts.Times;
      } else if (textAnn.fontFamily === 'Courier' || textAnn.fontFamily === 'monospace') {
        font = fonts.Courier;
      }

      const fontSize = textAnn.fontSize || 14;
      const pdfY = pHeight - textAnn.y - fontSize;

      // Draw background if present
      if (textAnn.backgroundColor && textAnn.backgroundColor !== 'transparent') {
        const bgRgb = hexToRgb(textAnn.backgroundColor);
        if (bgRgb) {
          page.drawRectangle({
            x: textAnn.x - 4,
            y: pdfY - 4,
            width: textAnn.width + 8,
            height: textAnn.height + 8,
            color: bgRgb,
            opacity: 0.9,
          });
        }
      }

      // Handle multi-line text
      const lines = textAnn.text.split('\n');
      const lineHeight = fontSize * 1.25;

      lines.forEach((line, lineIndex) => {
        if (!line.trim() && lines.length === 1) return;
        page.drawText(toWinAnsi(line), {
          x: textAnn.x,
          y: pdfY - lineIndex * lineHeight,
          size: fontSize,
          font: font,
          color: strokeColor,
          opacity: opacity,
        });
      });
      break;
    }

    case 'signature': {
      const sigAnn = ann as SignatureAnnotation;
      if (!sigAnn.imageData) break;

      try {
        const imageBytes = await fetch(sigAnn.imageData).then(res => res.arrayBuffer());
        const pngImage = await doc.embedPng(imageBytes);
        const pdfY = pHeight - sigAnn.y - sigAnn.height;

        page.drawImage(pngImage, {
          x: sigAnn.x,
          y: pdfY,
          width: sigAnn.width,
          height: sigAnn.height,
          opacity: opacity,
        });
      } catch (e) {
        console.error('Failed to embed signature PNG:', e);
      }
      break;
    }

    case 'stamp': {
      const stampAnn = ann as StampAnnotation;
      const pdfY = pHeight - stampAnn.y - stampAnn.height;
      const stampColor = hexToRgb(stampAnn.color || '#e11d48') || rgb(0.88, 0.11, 0.28);

      // Draw Stamp Outer Double Border
      page.drawRectangle({
        x: stampAnn.x,
        y: pdfY,
        width: stampAnn.width,
        height: stampAnn.height,
        borderColor: stampColor,
        borderWidth: 3,
        color: rgb(1, 1, 1),
        opacity: 0.85,
      });

      page.drawRectangle({
        x: stampAnn.x + 3,
        y: pdfY + 3,
        width: stampAnn.width - 6,
        height: stampAnn.height - 6,
        borderColor: stampColor,
        borderWidth: 1,
        opacity: 0.9,
      });

      const mainText = toWinAnsi(stampAnn.customText || stampAnn.stampType);
      const font = fonts.HelveticaBold;
      const textWidth = font.widthOfTextAtSize(mainText, 16);
      const textX = stampAnn.x + (stampAnn.width - textWidth) / 2;
      const textY = pdfY + stampAnn.height / 2 - 5;

      page.drawText(mainText, {
        x: Math.max(stampAnn.x + 6, textX),
        y: textY,
        size: 16,
        font: font,
        color: stampColor,
      });

      if (stampAnn.date || stampAnn.subtitle) {
        const sub = toWinAnsi(stampAnn.date || stampAnn.subtitle || '');
        const subFont = fonts.Helvetica;
        const subWidth = subFont.widthOfTextAtSize(sub, 9);
        const subX = stampAnn.x + (stampAnn.width - subWidth) / 2;
        page.drawText(sub, {
          x: Math.max(stampAnn.x + 6, subX),
          y: textY - 14,
          size: 9,
          font: subFont,
          color: stampColor,
        });
      }
      break;
    }

    case 'image': {
      const imgAnn = ann as any;
      if (!imgAnn.imageData) break;

      try {
        const imageBytes = await fetch(imgAnn.imageData).then((res) => res.arrayBuffer());
        const isPng = imgAnn.imageData.includes('image/png') || imgAnn.imageData.startsWith('data:image/png');
        const pdfImage = isPng ? await doc.embedPng(imageBytes) : await doc.embedJpg(imageBytes);
        const pdfY = pHeight - imgAnn.y - imgAnn.height;

        page.drawImage(pdfImage, {
          x: imgAnn.x,
          y: pdfY,
          width: imgAnn.width,
          height: imgAnn.height,
          opacity: opacity,
        });
      } catch (e) {
        console.error('Failed to embed image:', e);
      }
      break;
    }

    case 'measure': {
      const measureAnn = ann as any;
      const startX = measureAnn.x;
      const startY = pHeight - measureAnn.y;
      const endX = measureAnn.endX !== undefined ? measureAnn.endX : measureAnn.x + measureAnn.width;
      const endY = pHeight - (measureAnn.endY !== undefined ? measureAnn.endY : measureAnn.y + measureAnn.height);
      const color = hexToRgb(measureAnn.color || '#f59e0b') || rgb(0.96, 0.62, 0.04);

      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        thickness: 2,
        color: color,
        opacity: opacity,
      });

      const text = toWinAnsi(measureAnn.distanceFormatted || '0 cm');
      const font = fonts.HelveticaBold;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 + 5;
      page.drawText(text, {
        x: midX,
        y: midY,
        size: 10,
        font: font,
        color: color,
      });
      break;
    }

    case 'checkbox': {
      const cbAnn = ann as any;
      const pdfY = pHeight - cbAnn.y - cbAnn.height;
      const color = hexToRgb(cbAnn.color || '#0f172a') || rgb(0.1, 0.1, 0.2);

      page.drawRectangle({
        x: cbAnn.x,
        y: pdfY,
        width: cbAnn.width || 18,
        height: cbAnn.height || 18,
        borderColor: color,
        borderWidth: 1.5,
        color: rgb(1, 1, 1),
      });

      if (cbAnn.checked) {
        page.drawLine({
          start: { x: cbAnn.x + 3, y: pdfY + 9 },
          end: { x: cbAnn.x + 7, y: pdfY + 4 },
          thickness: 2,
          color: color,
        });
        page.drawLine({
          start: { x: cbAnn.x + 7, y: pdfY + 4 },
          end: { x: cbAnn.x + 14, y: pdfY + 14 },
          thickness: 2,
          color: color,
        });
      }
      break;
    }
  }
}

export async function createBlankPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([595.28, 841.89]); // Standard A4 (595.28 x 841.89 pt)
  return await doc.save();
}
