import { NextResponse } from 'next/server';
import { toAppError } from '@/lib/errors';

export function success(data = {}, status = 200, init = {}) {
  return NextResponse.json({ success: true, data }, { status, ...init });
}

export function failure(error, init = {}) {
  const appError = toAppError(error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
    },
    { status: appError.status, ...init }
  );
}
