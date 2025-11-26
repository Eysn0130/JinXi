export interface ProcessedFile {
  id: string;
  originalFile: File;
  name: string;
  path: string; // Relative path for files inside folders/zips
  size: number;
  type: string;
  md5: string | null;
  sha256: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number; // 0 to 100
  errorMessage?: string;
}

export interface SummaryStats {
  totalFiles: number;
  totalSize: number;
  processedCount: number;
  extensions: Record<string, number>;
}

export enum FileSource {
  LOCAL = 'LOCAL',
  ZIP_EXTRACTED = 'ZIP_EXTRACTED',
}