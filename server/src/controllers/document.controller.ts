import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';
import { documentService } from '../services/document.service';
import type { BookingIdParam } from '../schemas/booking.schema';
import type { UploadUrlInput, ConfirmUploadInput } from '../schemas/document.schema';

export const documentController = {
  // POST /bookings/:id/upload-url → 200
  getUploadUrl: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const input = req.validated.body as UploadUrlInput;
    const result = await documentService.getUploadUrl(id, req.user!.id, input);
    res.status(200).json(envelope(result));
  }),

  // POST /bookings/:id/confirm-upload → 201
  confirmUpload: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const input = req.validated.body as ConfirmUploadInput;
    const document = await documentService.confirmUpload(id, req.user!.id, input);
    res.status(201).json(envelope({ document }));
  }),

  // GET /bookings/:id/documents → 200
  list: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const documents = await documentService.listDocuments(id, req.user!.id);
    res.status(200).json(envelope({ documents }));
  }),

  // GET /bookings/:id/draft-url → 200
  getDraftUrl: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const result = await documentService.getDraftUrl(id, req.user!.id);
    res.status(200).json(envelope(result));
  }),
};
