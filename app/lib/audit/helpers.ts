import type {AuditActionType} from '@lib/db';

/**
 * Compute a diff between two objects for audit logging.
 * Only includes fields that changed.
 */
export function computeDataDiff(
	before: Record<string, unknown> | null | undefined,
	after: Record<string, unknown> | null | undefined,
): {
	before: Record<string, unknown> | null;
	after: Record<string, unknown> | null;
} {
	if (!before && !after) {
		return {before: null, after: null};
	}

	if (!before) {
		return {before: null, after: after ?? null};
	}

	if (!after) {
		return {before: before ?? null, after: null};
	}

	// Find changed fields only
	const changedBefore: Record<string, unknown> = {};
	const changedAfter: Record<string, unknown> = {};

	const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

	for (const key of allKeys) {
		const beforeValue = before[key];
		const afterValue = after[key];

		// Skip if values are equal (deep comparison for objects)
		if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
			continue;
		}

		changedBefore[key] = beforeValue;
		changedAfter[key] = afterValue;
	}

	return {
		before: Object.keys(changedBefore).length > 0 ? changedBefore : null,
		after: Object.keys(changedAfter).length > 0 ? changedAfter : null,
	};
}

/**
 * Sanitize sensitive data before logging.
 * Removes passwords, tokens, etc.
 */
export function sanitizeForAudit(
	data: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
	if (!data) return null;

	const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'api_key'];
	const sanitized = {...data};

	for (const key of Object.keys(sanitized)) {
		const lowerKey = key.toLowerCase();
		if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
			sanitized[key] = '[REDACTED]';
		}
	}

	return sanitized;
}

/**
 * Map HTTP methods to audit action types.
 */
export function methodToActionType(method: string): AuditActionType {
	switch (method.toUpperCase()) {
		case 'POST': {
			return 'create';
		}

		case 'PUT': {
			return 'update';
		}

		case 'PATCH': {
			return 'update';
		}

		case 'DELETE': {
			return 'delete';
		}

		default: {
			return 'read';
		}
	}
}
