export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "INVALID_TRANSITION"
  | "CONFLICT";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function forbidden(message = "You do not have permission to perform this action."): AppError {
  return new AppError("FORBIDDEN", message);
}

export function notFound(message = "The requested record was not found."): AppError {
  return new AppError("NOT_FOUND", message);
}

export function validationFailed(message: string): AppError {
  return new AppError("VALIDATION_FAILED", message);
}

export function invalidTransition(message: string): AppError {
  return new AppError("INVALID_TRANSITION", message);
}

export function conflict(message = "This record was modified by someone else. Refresh and try again."): AppError {
  return new AppError("CONFLICT", message);
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export function toActionResult(error: unknown): ActionResult {
  if (error instanceof AppError) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "An unexpected error occurred. Please try again." };
}
