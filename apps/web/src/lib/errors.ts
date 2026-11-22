/**
 * Stable application error codes (spec Appendix B).
 * Grow this list as new error cases appear; never remove or renumber.
 */
export const ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  VERIFICATION_TOKEN_INVALID: 'VERIFICATION_TOKEN_INVALID',
  VERIFICATION_TOKEN_EXPIRED: 'VERIFICATION_TOKEN_EXPIRED',
  ARTIST_NOT_VERIFIED: 'ARTIST_NOT_VERIFIED',
  PAYOUT_NOT_CONFIGURED: 'PAYOUT_NOT_CONFIGURED',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  LISTING_NOT_AVAILABLE: 'LISTING_NOT_AVAILABLE',
  EDITION_SOLD_OUT: 'EDITION_SOLD_OUT',
  AUCTION_NOT_LIVE: 'AUCTION_NOT_LIVE',
  AUCTION_ENDED: 'AUCTION_ENDED',
  BID_TOO_LOW: 'BID_TOO_LOW',
  OWN_LISTING_BID: 'OWN_LISTING_BID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PROVIDER_UNSUPPORTED_CURRENCY: 'PAYMENT_PROVIDER_UNSUPPORTED_CURRENCY',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  DOWNLOAD_LIMIT_REACHED: 'DOWNLOAD_LIMIT_REACHED',
  DISPUTE_WINDOW_CLOSED: 'DISPUTE_WINDOW_CLOSED',
  PROTO_MISMATCH: 'PROTO_MISMATCH',
  VR_TOKEN_EXPIRED: 'VR_TOKEN_EXPIRED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, opts?: { status?: number; details?: unknown }) {
    super(message ?? code);
    this.name = 'AppError';
    this.code = code;
    this.status = opts?.status ?? defaultStatusFor(code);
    this.details = opts?.details;
  }
}

function defaultStatusFor(code: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.UNAUTHENTICATED:
      return 401;
    case ERROR_CODES.FORBIDDEN:
      return 403;
    case ERROR_CODES.NOT_FOUND:
      return 404;
    case ERROR_CODES.VALIDATION_FAILED:
      return 400;
    case ERROR_CODES.RATE_LIMITED:
      return 429;
    case ERROR_CODES.IDEMPOTENCY_CONFLICT:
      return 409;
    case ERROR_CODES.EMAIL_ALREADY_REGISTERED:
      return 409;
    case ERROR_CODES.FEATURE_DISABLED:
      return 403;
    default:
      return 400;
  }
}

/**
 * RFC 9457 problem-details JSON body.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  detail?: string;
  instance?: string;
  errors?: unknown;
}

export function toProblem(error: unknown, instance?: string): ProblemDetails {
  if (error instanceof AppError) {
    return {
      type: `https://kaleido.local/errors/${error.code}`,
      title: error.code,
      status: error.status,
      code: error.code,
      detail: error.message,
      instance,
      errors: error.details,
    };
  }
  return {
    type: 'about:blank',
    title: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL' as ErrorCode,
    detail: 'An unexpected error occurred.',
    instance,
  };
}
