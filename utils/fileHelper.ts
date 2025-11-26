import SparkMD5 from 'spark-md5';
import JSZip from 'jszip';
import { ProcessedFile, FileSource } from '../types';

// Generate a unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Format bytes to human readable string
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Calculate MD5 and SHA-256 for a file
export const calculateHashes = async (
  file: File, 
  onProgress: (progress: number) => void
): Promise<{ md5: string; sha256: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const chunkSize = 2 * 1024 * 1024; // 2MB chunks
      const chunks = Math.ceil(file.size / chunkSize);
      const spark = new SparkMD5.ArrayBuffer();
      const cryptoSubtle = window.crypto.subtle;
      
      // For SHA-256 we need to feed the whole buffer or stream it. 
      // Web Crypto API doesn't support incremental updates easily without streams, 
      // but for "Gold Standard" browser compatibility we often read into memory for small files 
      // or use a library. To keep it robust without heavy libs for SHA256 streaming, 
      // we will use the native API for SHA256 (requires reading file) and SparkMD5 for MD5.
      // Note: For very large files, native SHA-256 might crash memory if read at once. 
      // Since this is a demo, we will read file in chunks for MD5 (visual progress) 
      // and read full file for SHA-256 (limitation of basic Web Crypto use).
      // In a production app, we would use a streaming SHA-256 implementation.

      const fileReader = new FileReader();
      let currentChunk = 0;

      // We will perform MD5 incrementally.
      // For SHA-256, we'll just read the whole fileArrayBuffer at the end if it's reasonable size,
      // or we accept that strict streaming SHA-256 requires a more complex lib implementation 
      // (like 'hash.js' or 'crypto-js') which might be too heavy for this snippet.
      // Let's optimize: We use the chunks for MD5. 
      
      fileReader.onload = async (e) => {
        if (!e.target?.result) return;
        const chunk = e.target.result as ArrayBuffer;
        spark.append(chunk);
        
        currentChunk++;
        const progress = Math.min(100, Math.ceil((currentChunk / chunks) * 100));
        onProgress(progress);

        if (currentChunk < chunks) {
          loadNext();
        } else {
          const md5Hash = spark.end();
          
          // Now Calculate SHA-256
          // Re-reading file for SHA-256 might be slow for huge files, 
          // but ensures we don't hold 2 copies in memory if we clear previous.
          const arrayBuffer = await file.arrayBuffer();
          const hashBuffer = await cryptoSubtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          resolve({ md5: md5Hash, sha256: sha256Hash });
        }
      };

      fileReader.onerror = () => reject(new Error("File read error"));

      const loadNext = () => {
        const start = currentChunk * chunkSize;
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      loadNext();
    } catch (err) {
      reject(err);
    }
  });
};

// Process dropped files, including extracting zips
export const processInputFiles = async (
  files: File[],
  onNewFile: (file: ProcessedFile) => void
): Promise<void> => {
  for (const file of files) {
    // Check if zip
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // Iterate zip contents
        for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
          const entry = zipEntry as any; // Cast to any because TS infers it as unknown
          if (!entry.dir) {
            const blob = await entry.async('blob');
            const extractedFile = new File([blob], entry.name.split('/').pop() || entry.name, {
              type: blob.type
            });
            
            onNewFile({
              id: generateId(),
              originalFile: extractedFile,
              name: entry.name.split('/').pop() || entry.name,
              path: `${file.name}/${relativePath}`,
              size: extractedFile.size,
              type: 'extracted',
              md5: null,
              sha256: null,
              status: 'pending',
              progress: 0
            });
          }
        }
      } catch (e) {
        console.error("Failed to extract zip", e);
        // Fallback: treat zip as a single file
        addSingleFile(file, onNewFile);
      }
    } else {
      // Regular file
      addSingleFile(file, onNewFile);
    }
  }
};

const addSingleFile = (file: File, callback: (f: ProcessedFile) => void) => {
  // Check if webkitRelativePath exists (folder upload)
  const path = (file as any).webkitRelativePath || file.name;
  
  callback({
    id: generateId(),
    originalFile: file,
    name: file.name,
    path: path,
    size: file.size,
    type: file.type || 'unknown',
    md5: null,
    sha256: null,
    status: 'pending',
    progress: 0
  });
};