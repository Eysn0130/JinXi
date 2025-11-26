import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SummaryStats } from '../types';
import { formatBytes } from '../utils/fileHelper';
import { HardDrive, CheckCircle2, FileType } from 'lucide-react';

interface DashboardProps {
  stats: SummaryStats;
}

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // Transform extensions map to array for Recharts
  const data = Object.entries(stats.extensions)
    .map(([name, value]) => ({ name: name.toUpperCase() || 'OTHER', value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">文件总数</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.totalFiles}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileType size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">总大小</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{formatBytes(stats.totalSize)}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <HardDrive size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">已校验</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.processedCount}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div 
               className="bg-green-500 h-full rounded-full transition-all duration-500" 
               style={{ width: `${stats.totalFiles > 0 ? (stats.processedCount / stats.totalFiles) * 100 : 0}%` }}
             ></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">文件类型分布</h4>
        <div className="flex-1 min-h-[160px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#64748b', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};