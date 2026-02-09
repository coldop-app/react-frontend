/**
 * Backend error response shapes we might receive
 */
interface ApiErrorBody {
  message?: string;
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path?: string; message?: string }>;
  };
}

const GENERIC_VALIDATION_PHRASES = [
  'request validation failed',
  'validation failed',
  'invalid',
  'validation error',
];

function isGenericMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return GENERIC_VALIDATION_PHRASES.some((p) => lower.includes(p)) || lower === 'type';
}

function isAxiosGenericMessage(msg: string): boolean {
  return (
    /^Request failed with status code \d{3}$/.test(msg) ||
    msg === 'Network Error' ||
    /^timeout of /.test(msg)
  );
}

/**
 * Build a user-friendly message from validation details (e.g. "storeCharge: Must be a number").
 */
function messageFromDetails(details: Array<{ path?: string; message?: string }>): string {
  if (!Array.isArray(details) || details.length === 0) return '';
  const parts = details
    .slice(0, 5)
    .map((d) => (d.path && d.message ? `${d.path}: ${d.message}` : d.message || ''))
    .filter(Boolean);
  return parts.join('. ') || '';
}

/**
 * Get a clear, user-facing error message from an API error.
 * Prefers backend error.message and validation details over generic "validation failed" or "type".
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error == null) return fallback;

  const err = error as {
    response?: { data?: ApiErrorBody };
    message?: string;
  };
  const data = err.response?.data;

  if (data?.error?.message) {
    const main = data.error.message.trim();
    const details = data.error.details;
    if (details && Array.isArray(details) && details.length > 0) {
      const fromDetails = messageFromDetails(details);
      if (fromDetails) return fromDetails;
    }
    if (main && !isGenericMessage(main)) return main;
    if (details && Array.isArray(details) && details.length > 0) return messageFromDetails(details);
    if (main) return main;
  }

  if (data?.message && typeof data.message === 'string') {
    const msg = data.message.trim();
    if (msg && !isGenericMessage(msg)) return msg;
    if (msg) return msg;
  }

  const axiosMessage = err.message;
  if (axiosMessage && typeof axiosMessage === 'string' && !isAxiosGenericMessage(axiosMessage)) {
    return axiosMessage.trim();
  }

  return fallback;
}
