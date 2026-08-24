const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'otp',
  'otpCode',
  'otpHash',
  'token',
  'accessToken',
  'refreshToken',
  'refreshTokenHash',
  'refreshHash',
  'resetToken',
  'resetTokenHash',
  'secret',
]);

function sanitize(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key) ? '[REDACTED]' : sanitize(item, seen),
    ])
  );
}

function write(level, event, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitize(context),
  };
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

export const logger = {
  info: (event, context) => write('info', event, context),
  warn: (event, context) => write('warn', event, context),
  error: (event, context) => write('error', event, context),
};

export { sanitize as sanitizeLogContext };
