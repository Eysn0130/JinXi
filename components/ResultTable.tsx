import React, { useMemo, useState } from 'react';
import { ProcessedFile } from '../types';
import { formatBytes } from '../utils/fileHelper';
import { FileIcon, Loader2, CheckCircle, AlertCircle, FolderOpen, Copy } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ResultTableProps {
  files: ProcessedFile[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ files }) => {
  const [filter, setFilter] = useState('');

  const filteredFiles = useMemo(() => {
    if (!filter) return files;
    const lower = filter.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(lower) || f.path.toLowerCase().includes(lower));
  }, [files, filter]);

  const handleExport = () => {
    if (files.length === 0) return;
    
    const data = files.map(f => ({
      "文件路径": f.path,
      "文件名称": f.name,
      "文件大小": formatBytes(f.size),
      "大小(Bytes)": f.size,
      "MD5校验值": f.md5 || "计算中...",
      "SHA-256哈希值": f.sha256 || "计算中...",
      "状态": f.status === 'done' ? '完成' : f.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "校验结果");
    
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `金析为证_校验报告_${date}.xlsx`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <FolderOpen size={18} className="text-brand-500" />
          证据文件列表 <span className="text-slate-400 font-normal">({files.length})</span>
        </h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="搜索文件名..." 
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button 
            onClick={handleExport}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            导出 Excel 报告
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/4">文件名 / 路径</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-24">大小</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/5">MD5</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/4">SHA-256</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-24">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-3 px-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-slate-100 rounded text-slate-500">
                      <FileIcon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 break-all">{file.name}</div>
                      <div className="text-xs text-slate-400 break-all mt-0.5">{file.path}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 align-top whitespace-nowrap">
                  {formatBytes(file.size)}
                </td>
                <td className="py-3 px-4 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded break-all">
                      {file.md5 || '---'}
                    </code>
                    {file.md5 && (
                      <button onClick={() => copyToClipboard(file.md5!)} className="text-slate-300 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded break-all">
                      {file.sha256 || '---'}
                    </code>
                    {file.sha256 && (
                      <button onClick={() => copyToClipboard(file.sha256!)} className="text-slate-300 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right align-top">
                   {file.status === 'pending' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">等待</span>}
                   {file.status === 'processing' && (
                     <div className="flex flex-col items-end gap-1">
                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                         <Loader2 size={12} className="animate-spin mr-1" /> {file.progress}%
                       </span>
                     </div>
                   )}
                   {file.status === 'done' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle size={12} className="mr-1"/> 完成</span>}
                   {file.status === 'error' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><AlertCircle size={12} className="mr-1"/> 错误</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};