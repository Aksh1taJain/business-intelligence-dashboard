/**
 * src/services/reportGenerators.ts
 *
 * Converts dataset rows into binary buffers for each format.
 *
 * generatePDF   → Buffer (application/pdf)
 * generateExcel → Buffer (application/vnd.openxmlformats…)
 * generateCSV   → Buffer (text/csv)
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import type { DatasetWithRecords } from './reportService';

// ─── Shared meta ──────────────────────────────────────────────────────────────

function generatedLine(): string {
  return `Generated: ${new Date().toUTCString()}`;
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

const BRAND_BLUE = '#3B82F6';
const PAGE_MARGIN = 50;
const COL_WIDTH_MAX = 120;
const COL_WIDTH_MIN = 60;

export async function generatePDF(
  data: DatasetWithRecords,
  reportName: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', compress: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { dataset, columns, rows } = data;
    const pageW = doc.page.width - PAGE_MARGIN * 2;

    // ── Cover header ──────────────────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 110)
      .fill(BRAND_BLUE);

    doc
      .fillColor('#FFFFFF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('DataPulse', PAGE_MARGIN, 28);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Business Intelligence Platform', PAGE_MARGIN, 56);

    doc
      .fontSize(9)
      .fillColor('rgba(255,255,255,0.7)')
      .text(generatedLine(), PAGE_MARGIN, 80);

    // ── Report title ──────────────────────────────────────────────────────────
    doc
      .fillColor('#1E293B')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(reportName, PAGE_MARGIN, 130);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(`Dataset: ${dataset.name}`, PAGE_MARGIN, 156);

    // ── Summary box ───────────────────────────────────────────────────────────
    const summaryY = 180;
    doc
      .roundedRect(PAGE_MARGIN, summaryY, pageW, 56, 4)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    const summaryItems = [
      { label: 'Total Rows',    value: rows.length.toLocaleString() },
      { label: 'Columns',       value: columns.length.toString() },
      { label: 'Dataset',       value: dataset.name },
    ];

    summaryItems.forEach((item, i) => {
      const x = PAGE_MARGIN + 16 + i * (pageW / 3);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(item.label, x, summaryY + 10);
      doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold').text(item.value, x, summaryY + 24);
    });

    // ── Data table ────────────────────────────────────────────────────────────
    if (columns.length === 0 || rows.length === 0) {
      doc.fillColor('#64748B').fontSize(11).font('Helvetica')
        .text('No data records found in this dataset.', PAGE_MARGIN, summaryY + 80);
      doc.end();
      return;
    }

    // Calculate column widths — distribute evenly, clamped to min/max
    const rawColW = Math.floor(pageW / columns.length);
    const colW = Math.min(COL_WIDTH_MAX, Math.max(COL_WIDTH_MIN, rawColW));
    const visibleCols = Math.min(columns.length, Math.floor(pageW / colW));
    const displayCols = columns.slice(0, visibleCols);

    const tableY = summaryY + 76;
    const ROW_H   = 20;
    const HEAD_H  = 26;

    let curY = tableY;

    // Header row
    doc
      .rect(PAGE_MARGIN, curY, pageW, HEAD_H)
      .fill('#1E40AF');

    displayCols.forEach((col, ci) => {
      doc
        .fillColor('#FFFFFF')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(
          col.replace(/_/g, ' ').toUpperCase(),
          PAGE_MARGIN + ci * colW + 4,
          curY + 8,
          { width: colW - 8, ellipsis: true },
        );
    });
    curY += HEAD_H;

    // Data rows — paginate
    rows.forEach((row, ri) => {
      // New page if needed
      if (curY + ROW_H > doc.page.height - PAGE_MARGIN - 20) {
        doc.addPage();
        curY = PAGE_MARGIN;

        // Repeat header
        doc.rect(PAGE_MARGIN, curY, pageW, HEAD_H).fill('#1E40AF');
        displayCols.forEach((col, ci) => {
          doc
            .fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
            .text(col.replace(/_/g, ' ').toUpperCase(),
              PAGE_MARGIN + ci * colW + 4, curY + 8,
              { width: colW - 8, ellipsis: true });
        });
        curY += HEAD_H;
      }

      // Alternating row fill
      if (ri % 2 === 0) {
        doc.rect(PAGE_MARGIN, curY, pageW, ROW_H).fill('#F8FAFC');
      }

      displayCols.forEach((col, ci) => {
        doc
          .fillColor('#334155')
          .fontSize(8)
          .font('Helvetica')
          .text(
            String(row[col] ?? ''),
            PAGE_MARGIN + ci * colW + 4,
            curY + 5,
            { width: colW - 8, ellipsis: true },
          );
      });

      // Row border
      doc.rect(PAGE_MARGIN, curY, pageW, ROW_H).stroke('#E2E8F0');
      curY += ROW_H;
    });

    // Outer table border
    doc.rect(PAGE_MARGIN, tableY, pageW, curY - tableY).stroke('#CBD5E1');

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 35;
    doc
      .moveTo(PAGE_MARGIN, footerY).lineTo(doc.page.width - PAGE_MARGIN, footerY)
      .stroke('#E2E8F0');
    doc
      .fillColor('#94A3B8').fontSize(8).font('Helvetica')
      .text('DataPulse BI Platform — Confidential', PAGE_MARGIN, footerY + 8);

    doc.end();
  });
}

// ─── Excel ────────────────────────────────────────────────────────────────────

export async function generateExcel(
  data: DatasetWithRecords,
  reportName: string,
): Promise<Buffer> {
  const { dataset, columns, rows } = data;
  const wb = new ExcelJS.Workbook();

  wb.creator  = 'DataPulse BI';
  wb.created  = new Date();
  wb.modified = new Date();

  // ── Data sheet ────────────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Data', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  // Title rows
  ws.mergeCells('A1', `${colLetter(columns.length)}1`);
  const titleCell = ws.getCell('A1');
  titleCell.value = reportName;
  titleCell.font  = { size: 14, bold: true, color: { argb: 'FF0F172A' } };
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0ECFF' } };

  ws.mergeCells('A2', `${colLetter(columns.length)}2`);
  const subCell = ws.getCell('A2');
  subCell.value = `Dataset: ${dataset.name}  |  ${rows.length.toLocaleString()} rows  |  ${generatedLine()}`;
  subCell.font  = { size: 9, color: { argb: 'FF64748B' } };

  ws.getRow(1).height = 28;
  ws.getRow(2).height = 18;

  // Header row (row 3)
  const headerRow = ws.getRow(3);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col;
    cell.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
    };
  });
  headerRow.height = 22;

  // Data rows
  rows.forEach((row, ri) => {
    const wsRow = ws.getRow(ri + 4);
    columns.forEach((col, ci) => {
      const cell = wsRow.getCell(ci + 1);
      const raw  = row[col] ?? '';
      // Try to coerce to number for numeric columns
      const num  = Number(raw);
      cell.value = raw !== '' && !isNaN(num) ? num : raw;
      cell.font  = { size: 9 };
      cell.fill  = ri % 2 === 0
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }
        : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    });
  });

  // Column widths — sample first 50 rows to estimate
  columns.forEach((col, i) => {
    const maxLen = Math.max(
      col.length,
      ...rows.slice(0, 50).map(r => String(r[col] ?? '').length),
    );
    ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 2, 10), 40);
  });

  // Auto-filter on header row
  ws.autoFilter = {
    from: { row: 3, column: 1 },
    to:   { row: 3, column: columns.length },
  };

  // ── Summary sheet ─────────────────────────────────────────────────────────
  const sumWs = wb.addWorksheet('Summary');
  const summaryData = [
    ['Report Name',   reportName],
    ['Dataset',       dataset.name],
    ['Total Rows',    rows.length],
    ['Columns',       columns.length],
    ['Generated',     new Date().toISOString()],
    ['Column List',   columns.join(', ')],
  ];

  summaryData.forEach(([label, value], i) => {
    const row = sumWs.getRow(i + 1);
    const lCell = row.getCell(1);
    const vCell = row.getCell(2);
    lCell.value = label;
    lCell.font  = { bold: true, size: 10 };
    vCell.value = value;
    vCell.font  = { size: 10 };
  });
  sumWs.getColumn(1).width = 18;
  sumWs.getColumn(2).width = 50;

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function generateCSV(data: DatasetWithRecords): Buffer {
  const { columns, rows } = data;

  const escape = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines: string[] = [
    columns.map(escape).join(','),
    ...rows.map(row => columns.map(col => escape(row[col] ?? '')).join(',')),
  ];

  return Buffer.from('\uFEFF' + lines.join('\r\n'), 'utf8'); // BOM for Excel compat
}

// ─── Helper: Excel column letter (1→A, 26→Z, 27→AA …) ───────────────────────

function colLetter(n: number): string {
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
