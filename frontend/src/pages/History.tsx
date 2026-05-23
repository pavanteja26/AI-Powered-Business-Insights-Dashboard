import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (!token || !userDataStr) {
      navigate('/login');
    } else {
      const userData = JSON.parse(userDataStr);
      setUser(userData);
      
      const userHistoryKey = `dashboard_history_${userData.email}`;
      const savedHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
      setHistory(savedHistory);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-bg flex flex-col font-sans relative">
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
      
      <Navbar user={user} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700/50 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Past Analyses</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base mt-2">A history of the datasets you've uploaded.</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-2xl">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-none dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <FileText className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">It's a bit empty here</h3>
            <p className="text-base text-slate-600 dark:text-slate-400 mb-8 max-w-xs mx-auto">Head over to the dashboard and upload a file to get started.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-xl text-base font-medium transition-all shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 shadow-none dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <FileText size={18} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {item.filename}
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-12 line-clamp-2 leading-relaxed">
                    {item.insight}
                  </p>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 pl-12 md:pl-0 mt-2 md:mt-0">
                  <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <Calendar size={14} />
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
