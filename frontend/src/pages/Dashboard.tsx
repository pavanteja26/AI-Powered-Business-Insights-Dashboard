import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, Loader2, ArrowRight, BarChart as BarChartIcon,
  LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Lightbulb
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

import api, { getDrilldownData } from '../services/api';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [chartData, setChartData] = useState<any[]>([]);
  const [insight, setInsight] = useState('');

  const [isDrilldownMode, setIsDrilldownMode] = useState(false);
  const [drilldownPath, setDrilldownPath] = useState<string[]>([]);
  const [drilldownTitle, setDrilldownTitle] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const isSpreadsheet = selected.name.endsWith('.csv') || selected.name.endsWith('.xlsx');
    if (!isSpreadsheet) {
      setError('Oops! Please upload an Excel (.xlsx) or CSV (.csv) file.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const processUpload = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setChartData(res.data.chartData || []);
      setInsight(res.data.insight || "We couldn't generate insights for this file.");

      const historyRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        filename: file.name,
        chartData: res.data.chartData,
        insight: res.data.insight,
        dataKeys: { categoryKey: res.data.categoryKey, valueKey: res.data.valueKey }
      };
      const key = `dashboard_history_${user.email}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([historyRecord, ...existing]));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong while reading your file.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setChartData([]);
    setInsight('');
    setError('');
    setIsDrilldownMode(false);
    setDrilldownPath([]);
    setDrilldownTitle('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const loadDrilldownData = async (node?: string) => {
    try {
      setLoading(true);
      const res = await getDrilldownData(node);
      setChartData(res.data.data);
      setDrilldownTitle(res.data.title);
      setInsight(`Viewing details for ${node || 'Global Sales'}. Click on any chart segment to drill down further.`);
      if (!node || node === 'root') {
        setDrilldownPath([]);
      } else {
        const nodeIndex = drilldownPath.indexOf(node);
        if (nodeIndex === -1) {
          setDrilldownPath([...drilldownPath, node]);
        } else {
          setDrilldownPath(drilldownPath.slice(0, nodeIndex + 1));
        }
      }
      setIsDrilldownMode(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load drill-down data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (data: any) => {
    if (isDrilldownMode && data && data.name) {
      loadDrilldownData(data.name);
    }
  };

  if (!user) return null;

  // Theme-aware chart colors
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)';
  const tooltipBorder = isDark ? 'rgba(71,85,105,0.5)' : 'rgba(226,232,240,1)';
  const tooltipLabel = isDark ? '#94a3b8' : '#64748b';
  const tooltipValue = isDark ? '#f1f5f9' : '#0f172a';
  const dotFill = isDark ? '#1e293b' : '#ffffff';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}` }} className="rounded-lg p-3 shadow-lg">
          <p style={{ color: tooltipLabel }} className="text-xs font-medium mb-1">{label}</p>
          <p style={{ color: tooltipValue }} className="text-sm font-semibold flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: payload[0].color || payload[0].fill }}
            />
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col font-sans relative">
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

      <Navbar user={user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {chartData.length === 0 ? (
          <div className="mt-16 max-w-xl mx-auto">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                Let's look at your data
              </h1>
              <p className="text-slate-500 dark:text-slate-300 text-lg">
                Upload a spreadsheet, and we'll help you understand what the numbers are saying.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-200 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="glass-panel p-8 rounded-2xl shadow-xl">
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl p-10 transition-all cursor-pointer text-center"
                onClick={() => fileRef.current?.click()}
              >
                <UploadCloud className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                  {file ? file.name : 'Click to select a file'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">We accept .csv and .xlsx files</p>
                <input type="file" ref={fileRef} onChange={handleFileChange} accept=".csv, .xlsx, .xls" className="hidden" />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => loadDrilldownData('root')}
                  disabled={loading}
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 border border-blue-300 dark:border-blue-500/30 transition-all w-full sm:w-auto disabled:opacity-50"
                >
                  Load Demo Drill-down Data
                </button>
                <button
                  onClick={processUpload}
                  disabled={!file || loading}
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin mr-2" size={18} />Reading data...</>
                  ) : (
                    <>Analyze Data <ArrowRight className="ml-2" size={16} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 dark:border-slate-700/50 pb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDrilldownMode ? drilldownTitle : "Here's what we found"}
                </h1>
                {!isDrilldownMode && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Based on the data in <span className="font-medium text-slate-700 dark:text-slate-200">{file?.name}</span>
                  </p>
                )}

                {isDrilldownMode && (
                  <nav className="flex items-center space-x-1 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <button onClick={() => loadDrilldownData('root')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                      Global
                    </button>
                    {drilldownPath.map((node, idx) => (
                      <React.Fragment key={node}>
                        <ChevronRight size={14} className="mx-1" />
                        <button
                          onClick={() => {
                            const newPath = drilldownPath.slice(0, idx);
                            setDrilldownPath(newPath);
                            loadDrilldownData(node);
                          }}
                          className={`transition-colors font-medium ${idx === drilldownPath.length - 1 ? 'text-slate-900 dark:text-white' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
                        >
                          {node}
                        </button>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
              </div>
              <button
                onClick={resetForm}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 px-5 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm"
              >
                Upload another file
              </button>
            </div>

            {/* Insight Panel */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Lightbulb size={20} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Key Takeaways</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">{insight}</p>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Bar Chart */}
              <div className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all group">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2">
                  <BarChartIcon size={18} className="text-blue-500 dark:text-blue-400" />
                  Distribution Overview
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} onClick={handleChartClick} cursor={isDrilldownMode ? 'pointer' : 'default'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart */}
              <div className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all group">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500 dark:text-emerald-400" />
                  Volume Area
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorUv)" fillOpacity={0.2} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all group">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2">
                  <LineChartIcon size={18} className="text-amber-500 dark:text-amber-400" />
                  Trend Line
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1 }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: dotFill, stroke: '#f59e0b', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: isDark ? '#fff' : '#0f172a', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all group">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-purple-500 dark:text-purple-400" />
                  Composition
                </h3>
                <div className="h-72 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.slice(0, 5)}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: isDark ? '#475569' : '#94a3b8', strokeWidth: 1 }}
                      >
                        {chartData.slice(0, 5).map((_, index) => (
                          <Cell
                            key={`slice-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className={`transition-opacity ${isDrilldownMode ? 'cursor-pointer hover:opacity-80' : ''}`}
                            onClick={() => handleChartClick(chartData[index])}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={30}
                        iconType="circle"
                        formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-sm ml-1">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
