export const UPLOAD_CONFIG = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
  maxHighlightLength: 5_000, // characters
  maxHighlightsPerImport: 10_000, // items
  allowedTypesTxt: ['text/plain', 'text/x-txt', ''] as string[],
  allowedTypesJson: ['application/json', 'text/plain', ''] as string[],
} as const;
