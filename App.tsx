
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { IVAControl } from './components/IVAControl';
import { BudgetsControl } from './components/BudgetsControl';
import { CurrentAccount } from './components/CurrentAccount';
import { GoogleDriveBridge } from './components/GoogleDriveBridge';
import { InvoiceForm } from './components/InvoiceForm';
import { AccountingDocument, GoogleDriveConfig, Sphere, Budget, Category } from './types';
import { Layout, Scale, Share2, Bell, Loader2, RefreshCw, BarChart3, Wallet, Users, CheckCircle2, Wifi, WifiOff, Plus } from 'lucide-react';

const DB_FILENAME = 'balancemaster_control_db.json';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'budgets' | 'iva' | 'connections' | 'account'>('dashboard');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Refeições' },
    { id: '2', name: 'Marketing' },
    { id: '3', name: 'Software/SaaS' },
    { id: '4', name: 'Combustível' },
    { id: '5', name: 'Logística' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [gdConfig, setGdConfig] = useState<GoogleDriveConfig>(() => {
    const saved = localStorage.getItem('balancemaster_gd');
    return saved ? JSON.parse(saved) : { isEnabled: false, accessToken: '', expiresAt: 0 };
  });
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success' | 'error'} | null>(null);

  const notify = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const saveToCloud = useCallback(async (currentDocs: AccountingDocument[], currentBudgets: Budget[]) => {
    if (!gdConfig.isEnabled || !gdConfig.accessToken) return;

    try {
      setIsSyncing(true);
      // 1. Procurar se o ficheiro já existe
      const listResp = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${DB_FILENAME}'&fields=files(id)`, {
        headers: { Authorization: `Bearer ${gdConfig.accessToken}` }
      });
      const listData = await listResp.json();
      const fileId = listData.files?.[0]?.id;

      const body = JSON.stringify({ documents: currentDocs, budgets: currentBudgets, lastUpdate: Date.now() });
      const metadata = { name: DB_FILENAME, mimeType: 'application/json' };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([body], { type: 'application/json' }));

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (fileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
      }

      const uploadResp = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${gdConfig.accessToken}` },
        body: form
      });

      if (uploadResp.ok) {
        setLastSyncTime(Date.now());
        localStorage.setItem('balancemaster_last_sync', Date.now().toString());
      }
    } catch (e) {
      console.error("Cloud save error", e);
    } finally {
      setIsSyncing(false);
    }
  }, [gdConfig]);

  const fetchFromCloud = useCallback(async (configOverride?: GoogleDriveConfig) => {
    const config = configOverride || gdConfig;
    if (!config.isEnabled || !config.accessToken || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const listResp = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${DB_FILENAME}'&fields=files(id)`, {
        headers: { Authorization: `Bearer ${config.accessToken}` }
      });
      const listData = await listResp.json();
      const fileId = listData.files?.[0]?.id;

      if (fileId) {
        const fileResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${config.accessToken}` }
        });
        const cloudData = await fileResp.json();
        
        if (cloudData.documents) setDocuments(cloudData.documents);
        if (cloudData.budgets) setBudgets(cloudData.budgets);
        
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem('balancemaster_last_sync', now.toString());
        notify("Dados sincronizados com a Cloud", "success");
      }
    } catch (e) {
      notify("Erro ao ler da Cloud", "error");
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
    localStorage.setItem('balancemaster_gd', JSON.stringify(gdConfig));
  }, [documents, budgets, gdConfig]);

  const handleAddDocument = (newDoc: Omit<AccountingDocument, 'id' | 'timestamp' | 'drivePath'>) => {
    const docWithId: AccountingDocument = {
      ...newDoc,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      drivePath: '',
    };
    const updatedDocs = [docWithId, ...documents];
    setDocuments(updatedDocs);
    setIsAddingDoc(false);
    notify("Fatura lançada com sucesso", "success");
    saveToCloud(updatedDocs, budgets);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden text-slate-900">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-[28px] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-6 border border-white/20 backdrop-blur-xl ${
          notification.type === 'success' ? 'bg-indigo-600 text-white' : notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {notification.type === 'info' ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
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
          <button onClick={() => {setView('dashboard'); setIsAddingDoc(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' && !isAddingDoc ? 'bg-slate-900 text-white font-black shadow-2xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Layout size={20} /><span>Dashboard</span></button>
          <button onClick={() => {setView('budgets'); setIsAddingDoc(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'budgets' ? 'bg-slate-900 text-white font-black shadow-2xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Wallet size={20} /><span>Budgets</span></button>
          <button onClick={() => {setView('account'); setIsAddingDoc(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'account' ? 'bg-slate-900 text-white font-black shadow-2xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Users size={20} /><span>Conta Sócio</span></button>
          <button onClick={() => {setView('iva'); setIsAddingDoc(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'iva' ? 'bg-slate-900 text-white font-black shadow-2xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Scale size={20} /><span>Fiscalidade</span></button>
          <div className="pt-8 mt-8 border-t border-slate-50">
            <button onClick={() => {setView('connections'); setIsAddingDoc(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'connections' ? 'bg-indigo-600 text-white font-black shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 font-bold'}`}><Share2 size={20} /><span>Google Sync</span></button>
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
              Forçar Refresh
            </button>
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
                       {gdConfig.isEnabled ? 'Cloud Ready' : 'Local Only'}
                     </div>
                     {isSyncing && <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest animate-pulse flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Sincronizando...</span>}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                     {view === 'dashboard' ? 'Dashboard' : view === 'iva' ? 'Fiscalidade' : view === 'budgets' ? 'Budgets' : view === 'account' ? 'Sócio' : 'Conetividade'}
                  </h1>
               </div>
               <button 
                onClick={() => setIsAddingDoc(true)}
                className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200/50"
               >
                 <Plus size={18}/> Lançar Fatura
               </button>
            </header>
          )}

          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            {isAddingDoc ? (
              <InvoiceForm categories={categories} onSave={handleAddDocument} onCancel={() => setIsAddingDoc(false)} />
            ) : (
              <>
                {view === 'dashboard' && <Dashboard documents={documents} budgets={budgets} onImport={(imported: AccountingDocument[]) => {
                    const newDocs = [...imported, ...documents];
                    setDocuments(newDocs);
                    saveToCloud(newDocs, budgets);
                }} />}
                {view === 'budgets' && <BudgetsControl budgets={budgets} onUpdate={(b) => {setBudgets(b); saveToCloud(documents, b);}} />}
                {view === 'account' && <CurrentAccount documents={documents} />}
                {view === 'iva' && <IVAControl documents={documents.filter(d => d.sphere === Sphere.COMPANY)} />}
                {view === 'connections' && <GoogleDriveBridge config={gdConfig} onUpdate={(newConfig: GoogleDriveConfig) => {
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
        <button onClick={() => {setView('dashboard'); setIsAddingDoc(false);}} className={`p-4 rounded-[20px] transition-all ${view === 'dashboard' && !isAddingDoc ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-400'}`}><Layout size={22}/></button>
        <button onClick={() => {setView('budgets'); setIsAddingDoc(false);}} className={`p-4 rounded-[20px] transition-all ${view === 'budgets' ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-400'}`}><Wallet size={22}/></button>
        <div className="relative -top-8">
           <button onClick={() => setIsAddingDoc(true)} className="bg-indigo-600 text-white p-6 rounded-full shadow-2xl shadow-indigo-300 animate-bounce transition-all"><Plus size={32}/></button>
        </div>
        <button onClick={() => {setView('account'); setIsAddingDoc(false);}} className={`p-4 rounded-[20px] transition-all ${view === 'account' ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-400'}`}><Users size={22}/></button>
        <button onClick={() => {setView('connections'); setIsAddingDoc(false);}} className={`p-4 rounded-[20px] transition-all ${view === 'connections' ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-400'}`}><Share2 size={22}/></button>
      </nav>
    </div>
  );
};

export default App;
