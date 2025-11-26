import React from 'react';
import { ArrowLeft, UploadCloud, Layers, ShieldCheck, Download, FileSearch, ClipboardCheck, FileSpreadsheet, AlertCircle, Undo2 } from 'lucide-react';

interface GuidePageProps {
  onBack: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onBack }) => {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">操作指引</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">电子证据哈希审计 · 全流程</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
            按照下列步骤完成证据文件的导入、排队处理、哈希校验与报告导出。本指引为独立页面，可随时从顶部导航返回首页。
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-brand-700 font-semibold text-base">
            <UploadCloud size={18} />
            导入与预处理
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>点击“选择文件”导入单个或多个文件，或使用“选择文件夹”批量导入。</li>
            <li>也可直接拖拽文件夹、ZIP 压缩包或任意文件至上传区域，系统会自动展开 ZIP 并去重。</li>
            <li>每个文件会生成唯一 ID，确保后续操作稳定且不会重复计算。</li>
          </ol>
        </div>

        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-brand-700 font-semibold text-base">
            <Layers size={18} />
            队列调度与状态
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>上传后自动进入队列，系统串行处理避免浏览器卡顿。</li>
            <li>进度条显示 0–100%，并有“等待 / 处理中 / 完成 / 错误”状态标识。</li>
            <li>如需重新开始，点击“清空列表”即可清空队列与结果。</li>
          </ol>
        </div>

        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-brand-700 font-semibold text-base">
            <ShieldCheck size={18} />
            哈希校验
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>处理完成后可在结果表中查看 MD5 与 SHA-256 值。</li>
            <li>点击复制按钮即可快速复制单个哈希；支持搜索文件名或路径。</li>
            <li>所有计算均在本地浏览器完成，不上传服务器，保障隐私与合规。</li>
          </ol>
        </div>

        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-brand-700 font-semibold text-base">
            <Download size={18} />
            导出与保存
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>点击“导出 Excel 报告”生成包含哈希值和文件信息的表格。</li>
            <li>顶部统计卡片展示文件数量、累计体积与扩展名分布，便于核对。</li>
            <li>如需多次导出，可在处理结束后重复点击，无需重新计算。</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-700 font-semibold text-base">
          <FileSearch size={18} />
          常见问题与排查
        </div>
        <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-none">
          <li className="flex items-start gap-2"><ClipboardCheck className="mt-0.5" size={16} />复制后粘贴为空？请确认浏览器已允许剪贴板权限，再次点击复制按钮。</li>
          <li className="flex items-start gap-2"><FileSpreadsheet className="mt-0.5" size={16} />导出报表无法打开？请确保本地已安装支持 XLSX 的表格软件或上传至在线表格查看。</li>
          <li className="flex items-start gap-2"><AlertCircle className="mt-0.5" size={16} />进度停滞？尝试关闭占用 CPU 的后台标签页，或分批次导入文件再试。</li>
          <li className="flex items-start gap-2"><Undo2 className="mt-0.5" size={16} />需要重新上传？使用“清空列表”后重新拖拽或选择文件即可。</li>
        </ul>
      </div>
    </main>
  );
};
