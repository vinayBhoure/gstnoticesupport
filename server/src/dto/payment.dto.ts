// Response shapes for the payment endpoints (api_contract.md §5).
// Never exposes razorpay_payment_id verification details or internal record fields.

export type InitiateOrderDTO = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  callbackUrl: string;
};

export type VerifyOutcome = 'success' | 'failed' | 'inconclusive' | 'tampered';

export type VerifyResultDTO = {
  outcome: VerifyOutcome;
  bookingId?: string;
};
