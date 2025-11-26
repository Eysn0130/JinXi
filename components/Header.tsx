import React from 'react';
import { ShieldCheck, FileSearch } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">金析为证</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">电子证据完整性校验系统</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
          <div className="hidden md:flex items-center space-x-1 hover:text-brand-600 cursor-pointer transition-colors">
            <FileSearch size={16} />
            <span>操作指引</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 border border-slate-200">
            V 2.5.0 Professional
          </div>
        </div>
      </div>
    </header>
  );
};