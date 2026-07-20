/** Keep in sync with backend.models.CSV_MAX_CHARS */
export const CSV_MAX_CHARS = 15_000_000;

export function formatCsvSize(chars: number): string {
  if (chars < 1024) return `${chars} characters`;
  const kb = chars / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function assertCsvWithinLimit(csv: string, fileName?: string): void {
  if (csv.length <= CSV_MAX_CHARS) return;
  const label = fileName ? `"${fileName}"` : 'This CSV';
  throw new Error(
    `${label} is too large (${formatCsvSize(csv.length)}). Maximum size is ${formatCsvSize(CSV_MAX_CHARS)}. ` +
      'Create the form from a smaller sample, or create the form first then use Records → Import CSV.',
  );
}

export function readCsvFile(file: File): Promise<string> {
  if (file.size > CSV_MAX_CHARS) {
    return Promise.reject(
      new Error(
        `"${file.name}" is too large (${formatCsvSize(file.size)}). Maximum size is ${formatCsvSize(CSV_MAX_CHARS)}.`,
      ),
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      try {
        assertCsvWithinLimit(text, file.name);
      } catch (err) {
        reject(err);
        return;
      }
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export const CSV_IMPORT_STORAGE_PREFIX = 'csv-import:';

export interface StagedCsvImport {
  csv: string;
  headerRow: number;
}

export function stageCsvForImport(projectId: string, payload: StagedCsvImport): void {
  try {
    sessionStorage.setItem(`${CSV_IMPORT_STORAGE_PREFIX}${projectId}`, JSON.stringify(payload));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to stage CSV';
    throw new Error(
      `${message}. The CSV may be too large to import automatically after publish — publish first, then use Records → Import CSV.`,
    );
  }
}

export function getStagedCsvImport(projectId: string): StagedCsvImport | null {
  const raw = sessionStorage.getItem(`${CSV_IMPORT_STORAGE_PREFIX}${projectId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StagedCsvImport;
    if (parsed?.csv) {
      return { csv: parsed.csv, headerRow: parsed.headerRow > 0 ? parsed.headerRow : 1 };
    }
  } catch {
    return { csv: raw, headerRow: 1 };
  }
  return null;
}

export function clearStagedCsvImport(projectId: string): void {
  sessionStorage.removeItem(`${CSV_IMPORT_STORAGE_PREFIX}${projectId}`);
}
