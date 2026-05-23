import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Shield, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-bg flex flex-col font-sans relative">
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

      <Navbar user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700/50 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Manage your personal information and security settings.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 font-medium rounded-xl transition-colors text-sm ${
              activeTab === 'profile'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 font-medium rounded-xl transition-colors text-sm ${
              activeTab === 'settings'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="p-8 sm:p-10">
            {activeTab === 'profile' ? (
              <>
                {/* Avatar + Name */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10 text-center sm:text-left">
                  <div className="relative group cursor-pointer">
                    <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 overflow-hidden shadow-md dark:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer text-xs font-semibold">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="pt-2">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{user.name}</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-500/30">
                      Standard Member
                    </span>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon size={18} className="text-blue-500 dark:text-blue-400" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</p>
                    </div>
                    <p className="text-base font-semibold text-slate-800 dark:text-white pl-8">{user.name}</p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail size={18} className="text-purple-500 dark:text-purple-400" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</p>
                    </div>
                    <p className="text-base font-semibold text-slate-800 dark:text-white pl-8">{user.email}</p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Shield size={18} className="text-emerald-500 dark:text-emerald-400" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Password</p>
                      </div>
                      <p className="text-sm text-slate-400 dark:text-slate-500 pl-8">You can change your password at any time.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-sm">
                      Change Password
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Email Notifications', desc: 'Receive analysis reports directly in your inbox.' },
                      { label: 'In-App Alerts', desc: 'Show a notification dot when tasks complete.' },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{item.label}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" defaultChecked />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
