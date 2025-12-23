// Export/Import type definitions for data management

import type {
  Activity, NewsItem, Announcement, Sponsor,
} from './builder-types';
import type {
  User, Submission, AuditLog, PushSubscription, NotificationHistoryEntry,
} from './db/schema';

// Content type identifiers
export type BuilderContentType = 'nieuws' | 'activiteit' | 'aankondiging' | 'sponsor';
export type DatabaseContentType = 'users' | 'submissions' | 'auditLogs' | 'pushSubscriptions' | 'notificationHistory';
export type ContentType = BuilderContentType | DatabaseContentType;

// Content types that can only be exported (not imported)
export const exportOnlyTypes: ContentType[] = ['auditLogs', 'notificationHistory'];

// Type mapping for content
export type ContentTypeMap = {
  nieuws: NewsItem;
  activiteit: Activity;
  aankondiging: Announcement;
  sponsor: Sponsor;
  users: Omit<User, 'auth0Id'>; // Exclude sensitive field
  submissions: Submission;
  auditLogs: AuditLog;
  pushSubscriptions: PushSubscription;
  notificationHistory: NotificationHistoryEntry;
};

// Export metadata
export type ExportMetadata = {
  version: '1.0';
  exportDate: string; // ISO 8601
  contentType: ContentType;
  itemCount: number;
  source: 'builder' | 'database';
};

// Export data structure
export type ExportData<T> = {
  metadata: ExportMetadata;
  items: T[];
};

// Import validation result
export type ImportValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    new: number;
    existing: number;
    conflicts: ConflictItem[];
  };
};

// Conflict item for duplicate detection
export type ConflictItem = {
  id: string;
  identifier: string; // Display name/title
  existingId: string;
};

// Import result
export type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{id: string; error: string}>;
};

// Import options
export type ImportOptions = {
  conflictStrategy: 'skip' | 'overwrite';
  selectedIds?: string[]; // Optional: only import specific items
};

// Content type display info
export type ContentTypeInfo = {
  key: ContentType;
  label: string;
  labelPlural: string;
  source: 'builder' | 'database';
  canImport: boolean;
};

export const contentTypeInfo: ContentTypeInfo[] = [
  {
    key: 'nieuws', label: 'Nieuwsbericht', labelPlural: 'Nieuwsberichten', source: 'builder', canImport: true,
  },
  {
    key: 'activiteit', label: 'Activiteit', labelPlural: 'Activiteiten', source: 'builder', canImport: true,
  },
  {
    key: 'aankondiging', label: 'Aankondiging', labelPlural: 'Aankondigingen', source: 'builder', canImport: true,
  },
  {
    key: 'sponsor', label: 'Sponsor', labelPlural: 'Sponsors', source: 'builder', canImport: true,
  },
  {
    key: 'users', label: 'Gebruiker', labelPlural: 'Gebruikers', source: 'database', canImport: true,
  },
  {
    key: 'submissions', label: 'Bericht', labelPlural: 'Berichten', source: 'database', canImport: true,
  },
  {
    key: 'auditLogs', label: 'Audit Log', labelPlural: 'Audit Logs', source: 'database', canImport: false,
  },
  {
    key: 'pushSubscriptions', label: 'Push Subscription', labelPlural: 'Push Subscriptions', source: 'database', canImport: true,
  },
  {
    key: 'notificationHistory', label: 'Notificatie', labelPlural: 'Notificatie Historie', source: 'database', canImport: false,
  },
];

// Helper to get content type info
export function getContentTypeInfo(type: ContentType): ContentTypeInfo | undefined {
  return contentTypeInfo.find(info => info.key === type);
}

// Validate export data structure
export function isValidExportData(data: unknown): data is ExportData<unknown> {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const exportData = data as Record<string, unknown>;

  // Check metadata
  if (!exportData.metadata || typeof exportData.metadata !== 'object') {
    return false;
  }

  const metadata = exportData.metadata as Record<string, unknown>;
  if (metadata.version !== '1.0') {
    return false;
  }

  if (typeof metadata.exportDate !== 'string') {
    return false;
  }

  if (typeof metadata.contentType !== 'string') {
    return false;
  }

  if (typeof metadata.itemCount !== 'number') {
    return false;
  }

  if (metadata.source !== 'builder' && metadata.source !== 'database') {
    return false;
  }

  // Check items array
  if (!Array.isArray(exportData.items)) {
    return false;
  }

  return true;
}

// Generate export filename
export function generateExportFilename(contentType: ContentType): string {
  const date = new Date().toISOString().split('T')[0];
  return `export-${contentType}-${date}.json`;
}
