import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ResultTable } from './components/ResultTable';
import { Dashboard } from './components/Dashboard';
import { GuidePage } from './components/GuidePage';
import { ProcessedFile, SummaryStats } from './types';
import { processInputFiles, calculateHashes } from './utils/fileHelper';
import { UploadCloud, FolderUp, FileUp, X, Hand, ShieldCheck, Download, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [page, setPage] = useState<'home' | 'guide'>('home');
  const processingQueue = useRef<string[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // --- Stats Calculation ---
  const stats: SummaryStats = React.useMemo(() => {
    const s: SummaryStats = {
      totalFiles: files.length,
      totalSize: 0,
      processedCount: 0,
      extensions: {}
    };
    files.forEach(f => {
      s.totalSize += f.size;
      if (f.status === 'done') s.processedCount++;
      const ext = f.name.split('.').pop() || 'unknown';
      s.extensions[ext] = (s.extensions[ext] || 0) + 1;
    });
    return s;
  }, [files]);

  // --- Queue Processing System ---
  // A simple queue to process files one by one (or max 2 parallel) to prevent freezing
  useEffect(() => {
    const processQueue = async () => {
      if (processingQueue.current.length === 0) {
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      const currentId = processingQueue.current[0];
      const fileObj = files.find(f => f.id === currentId);

      if (!fileObj || fileObj.status !== 'pending') {
         processingQueue.current.shift(); // Remove invalid or already processed
         processQueue();
         return;
      }

      // Update status to processing
      setFiles(prev => prev.map(f => f.id === currentId ? { ...f, status: 'processing' } : f));

      try {
        const { md5, sha256 } = await calculateHashes(fileObj.originalFile, (progress) => {
           setFiles(prev => prev.map(f => f.id === currentId ? { ...f, progress } : f));
        });
        
        setFiles(prev => prev.map(f => f.id === currentId ? { 
          ...f, 
          status: 'done', 
          md5, 
          sha256, 
          progress: 100 
        } : f));
      } catch (error) {
        console.error("Processing error", error);
        setFiles(prev => prev.map(f => f.id === currentId ? { ...f, status: 'error' } : f));
      } finally {
        processingQueue.current.shift();
        // Use timeout to allow UI render cycle
        setTimeout(processQueue, 50);
      }
    };

    if (!isProcessing && processingQueue.current.length > 0) {
      processQueue();
    }
  }, [files, isProcessing]); // Depend on files state update to trigger next check if queue not empty

  // --- Handlers ---
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const newFileEntries: ProcessedFile[] = [];
    
    await processInputFiles(newFiles, (processedFile) => {
      newFileEntries.push(processedFile);
    });

    setFiles(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newFileEntries.filter(f => !existingIds.has(f.id));
      
      // Add new IDs to queue
      uniqueNew.forEach(f => processingQueue.current.push(f.id));
      
      return [...prev, ...uniqueNew];
    });
  }, []);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
    // Reset value to allow re-uploading same file
    e.target.value = '';
  };

  const clearAll = () => {
    setFiles([]);
    processingQueue.current = [];
    setIsProcessing(false);
  };

  const goToGuidePage = () => {
    setPage('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setPage('home');
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        onGuideClick={page === 'guide' ? goHome : goToGuidePage}
        guideLabel={page === 'guide' ? '返回首页' : '操作指引'}
      />

      {page === 'guide' ? (
        <GuidePage onBack={goHome} />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Intro Section */}
          <div className="text-center max-w-2xl mx-auto mb-8 px-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3 leading-tight">
              电子数据哈希审计
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              支持拖拽文件夹、ZIP 压缩包及批量文件。
              <br className="hidden sm:inline" />
              本地离线计算，确保数据绝对安全，严守司法鉴定标准。
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={clsx(
              "relative rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out p-8 sm:p-12 text-center group cursor-pointer overflow-hidden",
              dragActive
                ? "border-brand-500 bg-brand-50/50 scale-[1.01] shadow-xl shadow-brand-100"
                : "border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50/50 hover:shadow-lg"
            )}
            onDragEnter={onDragEnter}
            onDragOver={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
              <div className={clsx(
                "p-4 rounded-full transition-colors duration-300",
                dragActive ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500"
              )}>
                <UploadCloud size={42} strokeWidth={1.5} />
              </div>

              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-semibold text-slate-700">
                  点击上传 或 拖拽文件至此处
                </p>
                <p className="text-sm text-slate-500">
                  支持任意格式文件，自动解析 ZIP 压缩包内容
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 w-full sm:w-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                >
                  <FileUp className="mr-2 h-4 w-4 text-slate-500" />
                  选择文件
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                >
                  <FolderUp className="mr-2 h-4 w-4 text-slate-500" />
                  选择文件夹
                </button>
              </div>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFileInput}
              {...{ webkitdirectory: "", directory: "" } as any}
              className="hidden"
            />
          </div>

          {/* Dashboard & Results */}
          {files.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-0 mb-4">
                <button
                  onClick={clearAll}
                  className="self-end sm:self-auto text-sm text-red-500 hover:text-red-700 flex items-center font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  <X size={16} className="mr-1" /> 清空列表
                </button>
              </div>

              <Dashboard stats={stats} />
              <ResultTable files={files} />
            </div>
          )}

        </main>
      )}

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2025 金析为证 · 电子证据实验室. All rights reserved.</p>
          <p className="mt-2 text-xs">本工具所有计算均在浏览器本地完成，严守数据隐私。</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
