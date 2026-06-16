/**
 * src/controllers/reportController.ts
 *
 * POST /api/reports           — create + synchronously generate a report
 * GET  /api/reports           — list caller's reports
 * GET  /api/reports/datasets  — list datasets available for report generation
 * GET  /api/reports/:id/download — stream the generated file
 */

import type { RequestHandler } from 'express';
import type { AuthenticatedRequest, ReportFormat } from '../types';
import {
  createReportRecord,
  markReportReady,
  markReportFailed,
  listReports,
  getReportById,
  fetchDatasetRecords,
  listDatasets,
} from '../services/reportService';
import {
  generatePDF,
  generateExcel,
  generateCSV,
} from '../services/reportGenerators';
import { sendSuccess, sendError } from '../utils/response';

// In-memory store for generated file buffers.
// Production would use S3/object-storage keyed by report ID.
const reportBuffers = new Map<string, { buffer: Buffer; mimeType: string; filename: string }>();

// ─── POST /api/reports ────────────────────────────────────────────────────────

export const createReport: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user.sub;
    const { name, description = '', format, dataset_id, tags = [] } = req.body as {
      name: string;
      description?: string;
      format: ReportFormat;
      dataset_id: string;
      tags?: string[];
    };

    // Validate required fields
    if (!name?.trim()) {
      sendError(res, 'Report name is required.', { status: 422 });
      return;
    }
    if (!['PDF', 'CSV', 'Excel'].includes(format)) {
      sendError(res, 'Format must be PDF, CSV, or Excel.', { status: 422 });
      return;
    }
    if (!dataset_id) {
      sendError(res, 'dataset_id is required.', { status: 422 });
      return;
    }

    // 1. Create the report row (status = processing)
    const reportRow = await createReportRecord({
      name: name.trim(),
      description: description.trim(),
      format,
      datasetId: dataset_id,
      createdBy: userId,
      tags,
    });

    // 2. Fetch dataset records
    const datasetData = await fetchDatasetRecords(dataset_id);
    if (!datasetData) {
      await markReportFailed(reportRow.id);
      sendError(res, 'Dataset not found or has been archived.', { status: 404 });
      return;
    }

    // 3. Generate file buffer
    let buffer: Buffer;
    let mimeType: string;
    let filename: string;
    const safeName = name.trim().replace(/[^a-z0-9_\-]/gi, '_');

    try {
      switch (format) {
        case 'PDF': {
          buffer   = await generatePDF(datasetData, name.trim());
          mimeType = 'application/pdf';
          filename = `${safeName}.pdf`;
          break;
        }
        case 'Excel': {
          buffer   = await generateExcel(datasetData, name.trim());
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `${safeName}.xlsx`;
          break;
        }
        case 'CSV': {
          buffer   = generateCSV(datasetData);
          mimeType = 'text/csv; charset=utf-8';
          filename = `${safeName}.csv`;
          break;
        }
        default:
          throw new Error(`Unsupported format: ${format as string}`);
      }
    } catch (genErr) {
      await markReportFailed(reportRow.id);
      return next(genErr);
    }

    // 4. Persist buffer in memory & mark report ready
    reportBuffers.set(reportRow.id, { buffer, mimeType, filename });
    const readyReport = await markReportReady(reportRow.id, buffer.length);

    sendSuccess(
      res,
      { report: readyReport },
      { status: 201, message: `${format} report generated successfully.` },
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports ─────────────────────────────────────────────────────────

export const getReports: RequestHandler = async (req, res, next) => {
  try {
    const userId  = (req as AuthenticatedRequest).user.sub;
    const reports = await listReports(userId);
    sendSuccess(res, { reports, total: reports.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/datasets ────────────────────────────────────────────────

export const getDatasets: RequestHandler = async (req, res, next) => {
  try {
    const userId   = (req as AuthenticatedRequest).user.sub;
    const datasets = await listDatasets(userId);
    sendSuccess(res, { datasets });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/:id/download ───────────────────────────────────────────

export const downloadReport: RequestHandler = async (req, res, next) => {
  try {
    const userId   = (req as AuthenticatedRequest).user.sub;
    const reportId = req.params['id'];

    if (!reportId) {
      sendError(res, 'Report ID required.', { status: 400 });
      return;
    }

    const report = await getReportById(reportId, userId);
    if (!report) {
      sendError(res, 'Report not found or access denied.', { status: 404 });
      return;
    }
    if (report.status !== 'ready') {
      sendError(res, `Report is not ready for download (status: ${report.status}).`, { status: 409 });
      return;
    }

    const stored = reportBuffers.get(reportId);

    // Buffer missing (server restarted) — regenerate on the fly
    if (!stored) {
      const config = report.config_json as { dataset_id?: string };
      const datasetId = config?.dataset_id;

      if (!datasetId) {
        sendError(res, 'Report configuration is missing dataset reference.', { status: 500 });
        return;
      }

      const datasetData = await fetchDatasetRecords(datasetId);
      if (!datasetData) {
        sendError(res, 'Source dataset no longer exists.', { status: 404 });
        return;
      }

      let buffer: Buffer;
      let mimeType: string;
      let filename: string;
      const safeName = report.name.replace(/[^a-z0-9_\-]/gi, '_');

      switch (report.format) {
        case 'PDF':
          buffer   = await generatePDF(datasetData, report.name);
          mimeType = 'application/pdf';
          filename = `${safeName}.pdf`;
          break;
        case 'Excel':
          buffer   = await generateExcel(datasetData, report.name);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `${safeName}.xlsx`;
          break;
        case 'CSV':
          buffer   = generateCSV(datasetData);
          mimeType = 'text/csv; charset=utf-8';
          filename = `${safeName}.csv`;
          break;
        default:
          sendError(res, `Unsupported format: ${report.format}`, { status: 500 });
          return;
      }

      reportBuffers.set(reportId, { buffer, mimeType, filename });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    res.setHeader('Content-Type', stored.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${stored.filename}"`);
    res.setHeader('Content-Length', stored.buffer.length);
    res.send(stored.buffer);
  } catch (err) {
    next(err);
  }
};
