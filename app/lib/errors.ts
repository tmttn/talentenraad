/**
 * Custom Error Classes
 *
 * Use these error classes for consistent error handling across the application.
 * These integrate well with Next.js error boundaries and Sentry.
 */

/**
 * Application error with HTTP status code
 */
export class AppError extends Error {
	readonly statusCode: number;
	readonly isOperational: boolean;

	constructor(message: string, statusCode = 500, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.name = 'AppError';

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
	constructor(message = 'De gevraagde resource is niet gevonden') {
		super(message, 404);
		this.name = 'NotFoundError';
	}
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
	constructor(message = 'Je moet eerst inloggen') {
		super(message, 401);
		this.name = 'UnauthorizedError';
	}
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
	constructor(message = 'Je hebt geen toegang tot deze resource') {
		super(message, 403);
		this.name = 'ForbiddenError';
	}
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
	readonly errors: Record<string, string>;

	constructor(message = 'De ingevoerde gegevens zijn ongeldig', errors: Record<string, string> = {}) {
		super(message, 400);
		this.name = 'ValidationError';
		this.errors = errors;
	}
}

/**
 * External Service Error (502)
 */
export class ExternalServiceError extends AppError {
	readonly service: string;

	constructor(service: string, message?: string) {
		super(message ?? `Er is een probleem met de externe service: ${service}`, 502);
		this.name = 'ExternalServiceError';
		this.service = service;
	}
}

/**
 * Check if an error is an operational error (expected errors we can handle gracefully)
 */
export function isOperationalError(error: unknown): error is AppError {
	return error instanceof AppError && error.isOperational;
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error: unknown): number {
	if (error instanceof AppError) {
		return error.statusCode;
	}

	return 500;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof AppError) {
		return error.message;
	}

	if (error instanceof Error) {
		// Don't expose internal error messages in production
		if (process.env.NODE_ENV === 'production') {
			return 'Er is een onverwachte fout opgetreden';
		}

		return error.message;
	}

	return 'Er is een onverwachte fout opgetreden';
}
