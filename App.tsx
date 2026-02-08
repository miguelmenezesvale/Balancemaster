
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { IVAControl } from './components/IVAControl';
import { BudgetsControl } from './components/BudgetsControl';
import { CurrentAccount } from './components/CurrentAccount';
import { GoogleDriveBridge } from './components/GoogleDriveBridge';
import { InvoiceForm } from './components/InvoiceForm';
import { AccountingDocument, GoogleDriveConfig, Sphere, Budget, Category } from './types';
import { Layout, Scale, Share2, Loader2, RefreshCw, BarChart3, Wallet, Users, CheckCircle2, Wifi, WifiOff, Plus, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'budgets' | 'iva' | 'connections' | 'account'>('dashboard');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Refeições' },
    { id: '2', name: 'Marketing' },
    { id: '3', name: 'Software/SaaS' },
    { id: '4', name: 'Combustível' },
    { id: '5', name: 'Logística' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [gdConfig, setGdConfig] = useState<GoogleDriveConfig>(() => {
    const saved = localStorage.getItem('balancemaster_gd_v2');
    return saved ? JSON.parse(saved) : { isEnabled: false, accessToken: '', expiresAt: 0 };
  });
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success' | 'error'} | null>(null);

  const notify = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchFileData = async (fileId: string, token: string) => {
    try {
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("File fetch failed");
      return await resp.json();
    } catch (e) {
      console.error(`Error fetching file ${fileId}`, e);
      return null;
    }
  };

  const fetchFromCloud = useCallback(async (configOverride?: GoogleDriveConfig) => {
    const config = configOverride || gdConfig;
    if (!config.isEnabled || !config.accessToken || isSyncing) return;
    
    setIsSyncing(true);
    try {
      let combinedDocs: AccountingDocument[] = [];
      let combinedBudgets: Budget[] = [];

      // Carregar Ficheiro Empresa
      if (config.businessFileId) {
        const data = await fetchFileData(config.businessFileId, config.accessToken);
        if (data) {
          if (data.documents) combinedDocs = [...combinedDocs, ...data.documents];
          if (data.budgets) combinedBudgets = [...combinedBudgets, ...data.budgets];
        }
      }

      // Carregar Ficheiro Pessoal
      if (config.personalFileId) {
        const data = await fetchFileData(config.personalFileId, config.accessToken);
        if (data) {
          if (data.documents) combinedDocs = [...combinedDocs, ...data.documents];
          if (data.budgets) combinedBudgets = [...combinedBudgets, ...data.budgets];
        }
      }

      if (combinedDocs.length > 0 || combinedBudgets.length > 0) {
        setDocuments(combinedDocs);
        setBudgets(combinedBudgets);
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem('balancemaster_last_sync', now.toString());
        notify("Dados sincronizados com sucesso", "success");
      } else {
        notify("Nenhum dado encontrado nos ficheiros indicados", "info");
      }
    } catch (e) {
      notify("Erro na ligação à Cloud", "error");
    } finally {
      setIsSyncing(false);
    }
  }, [gdConfig, isSyncing]);

  useEffect(() => {
    const savedDocs = localStorage.getItem('balancemaster_data');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    
    const savedBudgets = localStorage.getItem('balancemaster_budgets');
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

    if (gdConfig.isEnabled && gdConfig.accessToken) {
      fetchFromCloud();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('balancemaster_data', JSON.stringify(documents));
    localStorage.setItem('balancemaster_budgets', JSON.stringify(budgets));
    localStorage.setItem('balancemaster_gd_v2', JSON.stringify(gdConfig));
  }, [documents, budgets, gdConfig]);

  const handleAddDocument = (newDoc: Omit<AccountingDocument, 'id' | 'timestamp' | 'drivePath'>) => {
    const docWithId: AccountingDocument = {
      ...newDoc,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      drivePath: '',
    };
    setDocuments(prev => [docWithId, ...prev]);
    setIsAddingDoc(false);
    notify("Registo local criado", "success");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden text-slate-900">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-[28px] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-6 border border-white/20 backdrop-blur-xl ${
          notification.type === 'success' ? 'bg-indigo-600 text-white' : notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {notification.type === 'info' ? <Loader2 className="animate-spin" size={18} /> : notification.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18} />}
          <span className="text-sm font-black tracking-tight">{notification.message}</span>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-80 bg-white flex-col p-10 fixed inset-y-0 left-0 z-50 border-r border-slate-100">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 text-white rotate-3">
            <BarChart3 size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">BalanceMaster</span>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-slate-900 text-white font-black shadow-2xl' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Layout size={20} /><span>Dashboard</span></button>
          <button onClick={() => setView('budgets')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'budgets' ? 'bg-slate-900 text-white font-black shadow-2xl' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Wallet size={20} /><span>Budgets</span></button>
          <button onClick={() => setView('account')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'account' ? 'bg-slate-900 text-white font-black shadow-2xl' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Users size={20} /><span>Conta Sócio</span></button>
          <button onClick={() => setView('iva')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'iva' ? 'bg-slate-900 text-white font-black shadow-2xl' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Scale size={20} /><span>Fiscalidade</span></button>
          <div className="pt-8 mt-8 border-t border-slate-50">
            <button onClick={() => setView('connections')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'connections' ? 'bg-indigo-600 text-white font-black shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Share2 size={20} /><span>Google Sync</span></button>
          </div>
        </nav>

        {gdConfig.isEnabled && (
          <div className="mt-auto bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            <button 
              onClick={() => fetchFromCloud()} 
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white text-indigo-700 font-black text-[11px] uppercase tracking-widest hover:shadow-md transition-all border border-indigo-100 disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              Refresh Cloud
            </button>
            {lastSyncTime && (
              <p className="text-[9px] text-center mt-3 font-bold text-slate-400 uppercase tracking-widest">Sinc: {new Date(lastSyncTime).toLocaleTimeString()}</p>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 md:ml-80 p-6 md:p-12 lg:p-16 min-h-screen overflow-y-auto pb-32 md:pb-16 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          {!isAddingDoc && (
            <header className="mb-12 flex justify-between items-end">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 ${gdConfig.isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {gdConfig.isEnabled ? <Wifi size={10}/> : <WifiOff size={10}/>}
                       {gdConfig.isEnabled ? 'Cloud Linked' : 'Offline Mode'}
                     </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                     {view === 'dashboard' ? 'Dashboard' : view === 'iva' ? 'Fiscalidade' : view === 'budgets' ? 'Budgets' : view === 'account' ? 'Sócio' : 'Conetividade'}
                  </h1>
               </div>
               <button onClick={() => setIsAddingDoc(true)} className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200/50">
                 <Plus size={18}/> Lançar Manual
               </button>
            </header>
          )}

          <div className="animate-in fade-in duration-700">
            {isAddingDoc ? (
              <InvoiceForm categories={categories} onSave={handleAddDocument} onCancel={() => setIsAddingDoc(false)} />
            ) : (
              <>
                {view === 'dashboard' && <Dashboard documents={documents} budgets={budgets} onImport={(imported) => setDocuments(prev => [...imported, ...prev])} />}
                {view === 'budgets' && <BudgetsControl budgets={budgets} onUpdate={setBudgets} />}
                {view === 'account' && <CurrentAccount documents={documents} />}
                {view === 'iva' && <IVAControl documents={documents.filter(d => d.sphere === Sphere.COMPANY)} />}
                {view === 'connections' && <GoogleDriveBridge config={gdConfig} onUpdate={(newConfig) => {
                  setGdConfig(newConfig);
                  if (newConfig.isEnabled && newConfig.accessToken) fetchFromCloud(newConfig);
                }} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-slate-100 flex justify-around p-5 pb-10 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
        <button onClick={() => setView('dashboard')} className={`p-4 rounded-[20px] ${view === 'dashboard' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}><Layout size={22}/></button>
        <button onClick={() => setView('budgets')} className={`p-4 rounded-[20px] ${view === 'budgets' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}><Wallet size={22}/></button>
        <div className="relative -top-8">
           <button onClick={() => setIsAddingDoc(true)} className="bg-indigo-600 text-white p-6 rounded-full shadow-2xl animate-bounce"><Plus size={32}/></button>
        </div>
        <button onClick={() => setView('account')} className={`p-4 rounded-[20px] ${view === 'account' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}><Users size={22}/></button>
        <button onClick={() => setView('connections')} className={`p-4 rounded-[20px] ${view === 'connections' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}><Share2 size={22}/></button>
      </nav>
    </div>
  );
};

export default App;
