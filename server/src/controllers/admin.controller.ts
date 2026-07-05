import { asyncHandler } from '../utils/asyncHandler';
import { envelope, paginated } from '../utils/envelope';
import { adminService } from '../services/admin.service';
import type {
  AdminBookingListQuery,
  AdminBookingIdParams,
  AdminUserListQuery,
  AdminUserIdParams,
  AdminDocumentParams,
  UpdateStatusInput,
  DraftUploadUrlInput,
  DraftConfirmInput,
  UpdateNoteInput,
  MarkPaidInput,
} from '../schemas/admin.schema';

export const adminController = {
  // GET /admin/bookings
  listBookings: asyncHandler(async (req, res) => {
    const query = req.validated.query as AdminBookingListQuery;
    const { data, meta } = await adminService.listBookings(query);
    res.status(200).json(paginated(data, meta));
  }),

  // GET /admin/bookings/:id
  getBooking: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const booking = await adminService.getBooking(id);
    res.status(200).json(envelope({ booking }));
  }),

  // PATCH /admin/bookings/:id/status
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as UpdateStatusInput;
    const booking = await adminService.updateStatus(id, input);
    res.status(200).json(envelope({ booking }));
  }),

  // POST /admin/bookings/:id/draft-upload-url
  createDraftUploadUrl: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as DraftUploadUrlInput;
    const result = await adminService.createDraftUploadUrl(id, input);
    res.status(200).json(envelope(result));
  }),

  // POST /admin/bookings/:id/draft-confirm
  confirmDraftUpload: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as DraftConfirmInput;
    const booking = await adminService.confirmDraftUpload(id, input);
    res
      .status(200)
      .json(
        envelope(
          { booking },
          'Draft uploaded. Booking status set to draft_ready. User notified by email.',
        ),
      );
  }),

  // POST /admin/bookings/:id/final-draft-upload-url
  createFinalDraftUploadUrl: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as DraftUploadUrlInput;
    const result = await adminService.createFinalDraftUploadUrl(id, input);
    res.status(200).json(envelope(result));
  }),

  // POST /admin/bookings/:id/final-draft-confirm
  confirmFinalDraftUpload: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as DraftConfirmInput;
    const booking = await adminService.confirmFinalDraftUpload(id, input);
    res
      .status(200)
      .json(envelope({ booking }, 'Final draft uploaded. User notified by email.'));
  }),

  // PATCH /admin/bookings/:id/note
  updateNote: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as UpdateNoteInput;
    const booking = await adminService.updateNote(id, input);
    res.status(200).json(envelope({ booking }));
  }),

  // POST /admin/bookings/:id/mark-paid
  markPaid: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminBookingIdParams;
    const input = req.validated.body as MarkPaidInput;
    const booking = await adminService.markPaid(id, req.user!.id, input);
    res
      .status(200)
      .json(envelope({ booking }, 'Payment verified with Razorpay. Booking transitioned to filing.'));
  }),

  // GET /admin/bookings/:id/documents/:documentId/download-url
  getDocumentDownloadUrl: asyncHandler(async (req, res) => {
    const { id, documentId } = req.validated.params as AdminDocumentParams;
    const result = await adminService.getDocumentDownloadUrl(id, documentId);
    res.status(200).json(envelope(result));
  }),

  // GET /admin/users
  listUsers: asyncHandler(async (req, res) => {
    const query = req.validated.query as AdminUserListQuery;
    const { data, meta } = await adminService.listUsers(query);
    res.status(200).json(paginated(data, meta));
  }),

  // GET /admin/users/:id
  getUser: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminUserIdParams;
    const user = await adminService.getUser(id);
    res.status(200).json(envelope({ user }));
  }),

  // DELETE /admin/users/:id
  deleteUser: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as AdminUserIdParams;
    await adminService.deleteUser(id);
    res.status(200).json(envelope(null, 'User deleted.'));
  }),

  // GET /admin/stats
  getStats: asyncHandler(async (_req, res) => {
    const stats = await adminService.getStats();
    res.status(200).json(envelope(stats));
  }),
};
