import { downloadCSV } from './csv';

// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────
// CSV
// ─────────────────────────────────────────────────────────────

export function exportToCSV(filenameBase, headers, rows) {
  downloadCSV(`${filenameBase}-${timestamp()}.csv`, headers, rows);
}

// ─────────────────────────────────────────────────────────────
// Excel (SpreadsheetML 2003 XML — opens natively in Excel,
// no external library required)
// ─────────────────────────────────────────────────────────────

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cellXml(value) {
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  const type = isNumber ? 'Number' : 'String';
  return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
}

export function exportToExcel(filenameBase, sheetName, headers, rows) {
  const headerRow = `<Row>${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join('')}</Row>`;
  const dataRows = rows
    .map((row) => `<Row>${row.map((cell) => cellXml(cell)).join('')}</Row>`)
    .join('');

  const columnWidth = 130;
  const columns = headers.map(() => `<Column ss:Width="${columnWidth}"/>`).join('');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#AA1C41" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${xmlEscape(sheetName)}">
  <Table>
   ${columns}
   ${headerRow}
   ${dataRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, `${filenameBase}-${timestamp()}.xls`);
}

// ─────────────────────────────────────────────────────────────
// PDF (minimal hand-rolled PDF writer — no external library
// required). Produces a paginated landscape table with a title,
// header row, and striped body rows using the base Helvetica font.
// ─────────────────────────────────────────────────────────────

const PAGE_WIDTH = 792; // landscape Letter
const PAGE_HEIGHT = 612;
const MARGIN = 36;
const ROW_HEIGHT = 18;
const TITLE_SIZE = 16;
const HEADER_SIZE = 9.5;
const BODY_SIZE = 9;

function pdfEscape(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u0080-\uffff]/g, ''); // strip non-WinAnsi chars (base14 fonts only)
}

function truncateToWidth(text, colWidth, charWidth) {
  const str = String(text ?? '');
  const maxChars = Math.max(3, Math.floor((colWidth - 6) / charWidth));
  if (str.length <= maxChars) return str;
  return `${str.slice(0, Math.max(0, maxChars - 3))}...`;
}

/**
 * Builds a simple multi-page tabular PDF as a Blob.
 * columns: [{ label, width }]
 * rows: array of arrays (strings), same order as columns
 */
export function buildTablePDF({ title, subtitle, columns, rows }) {
  const usableWidth = PAGE_WIDTH - MARGIN * 2;
  const totalColWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const scale = usableWidth / totalColWidth;
  const cols = columns.map((c) => ({ ...c, width: c.width * scale }));

  const headerTop = PAGE_HEIGHT - MARGIN - (subtitle ? 46 : 32);
  const rowsPerPage = Math.max(1, Math.floor((headerTop - MARGIN - ROW_HEIGHT) / ROW_HEIGHT));
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length; // 1-based object number
  };

  const catalogNum = 1;
  const pagesNum = 2;
  const fontRegNum = 3;
  const fontBoldNum = 4;

  // Reserve numbers 1-4 for catalog/pages/fonts; content streams and page
  // objects are appended after, then we patch the Pages Kids list.
  objects[0] = null; // placeholder for catalog
  objects[1] = null; // placeholder for pages
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  const pageObjNums = [];

  for (let p = 0; p < totalPages; p += 1) {
    const pageRows = rows.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    let y = PAGE_HEIGHT - MARGIN;
    const lines = [];

    lines.push('BT');
    lines.push(`/F2 ${TITLE_SIZE} Tf`);
    lines.push(`${MARGIN} ${y - TITLE_SIZE} Td`);
    lines.push(`(${pdfEscape(title)}) Tj`);
    lines.push('ET');
    y -= TITLE_SIZE + 6;

    if (subtitle) {
      lines.push('BT');
      lines.push(`/F1 9 Tf`);
      lines.push(`${MARGIN} ${y - 9} Td`);
      lines.push(`(${pdfEscape(subtitle)}) Tj`);
      lines.push('ET');
      y -= 9 + 10;
    } else {
      y -= 8;
    }

    // Header row background
    const headerY = y - ROW_HEIGHT;
    lines.push('0.667 0.110 0.255 rg'); // #AA1C41
    lines.push(`${MARGIN} ${headerY} ${usableWidth} ${ROW_HEIGHT} re f`);

    // Header text (white)
    lines.push('1 1 1 rg');
    lines.push('BT');
    lines.push(`/F2 ${HEADER_SIZE} Tf`);
    let x = MARGIN + 4;
    cols.forEach((col) => {
      const charWidth = HEADER_SIZE * 0.52;
      const label = truncateToWidth(col.label, col.width, charWidth);
      lines.push(`1 0 0 1 ${x.toFixed(1)} ${(headerY + 5).toFixed(1)} Tm`);
      lines.push(`(${pdfEscape(label)}) Tj`);
      x += col.width;
    });
    lines.push('ET');

    y = headerY;

    // Body rows (striped backgrounds first, then all text)
    pageRows.forEach((row, idx) => {
      const rowY = y - ROW_HEIGHT * (idx + 1);
      if (idx % 2 === 1) {
        lines.push('0.965 0.957 0.949 rg');
        lines.push(`${MARGIN} ${rowY} ${usableWidth} ${ROW_HEIGHT} re f`);
      }
    });

    lines.push('0 0 0 rg');
    lines.push('BT');
    lines.push(`/F1 ${BODY_SIZE} Tf`);
    pageRows.forEach((row, idx) => {
      const rowY = y - ROW_HEIGHT * (idx + 1);
      let cx = MARGIN + 4;
      cols.forEach((col, colIdx) => {
        const charWidth = BODY_SIZE * 0.52;
        const value = truncateToWidth(row[colIdx], col.width, charWidth);
        lines.push(`1 0 0 1 ${cx.toFixed(1)} ${(rowY + 5).toFixed(1)} Tm`);
        lines.push(`(${pdfEscape(value)}) Tj`);
        cx += col.width;
      });
    });
    lines.push('ET');

    // Footer page number
    lines.push('0.463 0.478 0.424 rg');
    lines.push('BT');
    lines.push('/F1 8 Tf');
    lines.push(`${PAGE_WIDTH - MARGIN - 70} ${MARGIN - 12} Td`);
    lines.push(`(Page ${p + 1} of ${totalPages}) Tj`);
    lines.push('ET');

    const content = lines.join('\n');
    const streamLength = content.length + 1; // account for the trailing \n before endstream
    const contentNum = addObject(`<< /Length ${streamLength} >>\nstream\n${content}\nendstream`);
    const pageNum = addObject(
      `<< /Type /Page /Parent ${pagesNum} 0 R /Resources << /Font << /F1 ${fontRegNum} 0 R /F2 ${fontBoldNum} 0 R >> >> /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentNum} 0 R >>`
    );
    pageObjNums.push(pageNum);
  }

  objects[catalogNum - 1] = `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`;
  objects[pagesNum - 1] = `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>`;

  // Assemble the PDF file
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, idx) => {
    offsets.push(pdf.length);
    pdf += `${idx + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function exportToPDF(filenameBase, { title, subtitle, columns, rows }) {
  const blob = buildTablePDF({ title, subtitle, columns, rows });
  triggerDownload(blob, `${filenameBase}-${timestamp()}.pdf`);
}
