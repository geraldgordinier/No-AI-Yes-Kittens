import { useState } from 'react';
import { ShieldCheck, Code2, LayoutDashboard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CodeViewer from './components/CodeViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'code'>('dashboard');

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight leading-none">No AI,<br/>Yes Kitten</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Control Dashboard
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-5 h-5" />
            Extension Code
          </button>
        </nav>

        <div className="p-6 border-t border-slate-200">
          <div className="bg-slate-900 rounded-xl p-4 text-white text-sm">
            <p className="opacity-70 mb-2">Extension Status</p>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xl font-bold">Ready</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-[100%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Control Dashboard'}
              {activeTab === 'code' && 'Extension Code'}
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Chrome Extension Settings
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-600">Active</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 p-10 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'code' && <CodeViewer />}
        </div>
      </main>
    </div>
  );
}
