/**
 * src/services/csvParser.ts
 *
 * Parses a CSV buffer into a structured result ready for database insertion.
 * Uses csv-parse (sync) so the controller can await a single promise.
 */

import { parse } from 'csv-parse/sync';
import type { ColumnDescriptor } from '../types';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];   // each row keyed by header
  columnDescriptors: ColumnDescriptor[];
  rowCount: number;
  columnCount: number;
}

export interface ParseError {
  ok: false;
  message: string;
}

export type ParseResult = ({ ok: true } & ParsedCSV) | ParseError;

/**
 * Parse a raw CSV buffer.
 *
 * Returns a discriminated union so callers can branch on ok without try/catch.
 */
export function parseCSV(buffer: Buffer, filename: string): ParseResult {
  // Reject obviously non-CSV content (binary magic bytes)
  if (buffer[0] === 0xff || buffer[0] === 0xd0 || buffer[0] === 0x50) {
    return {
      ok: false,
      message: `${filename} appears to be a binary file, not a CSV. Please export your spreadsheet as CSV first.`,
    };
  }

  let records: string[][];

  try {
    records = parse(buffer, {
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true,   // allow ragged rows rather than hard-fail
      bom: true,                  // strip UTF-8 BOM if present
    }) as string[][];
  } catch (err) {
    return {
      ok: false,
      message: `Could not parse ${filename}: ${(err as Error).message}`,
    };
  }

  if (records.length < 2) {
    return {
      ok: false,
      message: `${filename} must have at least a header row and one data row.`,
    };
  }

  const rawHeaders = records[0];
  if (!rawHeaders || rawHeaders.length === 0) {
    return { ok: false, message: 'Header row is empty.' };
  }

  // Sanitise headers — deduplicate, strip blanks
  const headers = sanitiseHeaders(rawHeaders);
  const dataRows = records.slice(1);

  // Map each data row to a keyed object
  const rows: Record<string, string>[] = dataRows.map(cells =>
    Object.fromEntries(
      headers.map((header, i) => [header, cells[i]?.trim() ?? '']),
    ),
  );

  // Build column descriptors — find first non-empty sample per column
  const columnDescriptors: ColumnDescriptor[] = headers.map(name => {
    const sample =
      rows.find(r => r[name] !== '')?.[ name] ?? '';
    return { name, sample };
  });

  return {
    ok: true,
    headers,
    rows,
    columnDescriptors,
    rowCount: rows.length,
    columnCount: headers.length,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitiseHeaders(raw: string[]): string[] {
  const seen = new Map<string, number>();

  return raw.map(h => {
    // Normalise: trim, collapse whitespace, replace non-alphanum with _
    let name = h.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (!name) name = 'column';

    // Deduplicate: col, col_1, col_2 …
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count}`;
  });
}
