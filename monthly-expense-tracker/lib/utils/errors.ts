export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Unexpected error'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function getErrorStatus(error: unknown, fallback = 400): number {
  if (error instanceof AppError) {
    return error.status;
  }
  return fallback;
}
