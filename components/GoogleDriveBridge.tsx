
import React, { useState } from 'react';
import { HardDrive, CheckCircle2, Cloud, LogOut, Loader2, Info, ShieldCheck, Database, Smartphone, Monitor, ExternalLink, Wifi, BookOpen, ChevronRight, FileJson, Sparkles, AlertTriangle } from 'lucide-react';
import { GoogleDriveConfig } from '../types';

interface GoogleDriveBridgeProps {
  config: GoogleDriveConfig;
  onUpdate: (config: GoogleDriveConfig) => void;
}

export const GoogleDriveBridge: React.FC<GoogleDriveBridgeProps> = ({ config, onUpdate }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const isIAEnabled = !!process.env.API_KEY && process.env.API_KEY !== 'undefined';
  
  // O seu Client ID oficial
  const GOOGLE_CLIENT_ID = '289040581308-90dn58t81jcg0n6a612ubaf0ccugsicv.apps.googleusercontent.com';

  const handleConnect = () => {
    setIsConnecting(true);
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (response: any) => {
          if (response.access_token) {
            onUpdate({
              isEnabled: true,
              accessToken: response.access_token,
              expiresAt: Date.now() + (response.expires_in * 1000),
              userEmail: 'Ecossistema Cloud Ativo'
            });
          }
          setIsConnecting(false);
        }
      });
      client.requestAccessToken();
    } catch (e) {
      console.error("Google Auth failed", e);
      setIsConnecting(false);
      alert("Falha na ligação. Verifique se o URL da app está autorizado no Google Cloud Console (Authorized JavaScript Origins).");
    }
  };

  const handleDisconnect = () => {
    onUpdate({ isEnabled: false, accessToken: '', expiresAt: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className={`p-8 rounded-[40px] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${isIAEnabled ? 'bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-100' : 'bg-white border-rose-100'}`}>
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isIAEnabled ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'}`}>
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isIAEnabled ? 'text-white' : 'text-slate-900'}`}>
              Motor IA: {isIAEnabled ? 'Gemini 3 Flash Ativo' : 'IA Desativada'}
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isIAEnabled ? 'text-indigo-100' : 'text-slate-400'}`}>
              {isIAEnabled ? 'Extração automática de faturas disponível' : 'Falta configurar a API_KEY nas variáveis de ambiente do Vercel'}
            </p>
          </div>
        </div>
        {!isIAEnabled && (
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
          >
            Obter API Key <ExternalLink size={14}/>
          </a>
        )}
      </div>

      <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-16 opacity-5 text-indigo-600 rotate-12">
          <Cloud size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-200">
              <Database size={44} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Google Sync</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2 flex items-center gap-2">
                <Smartphone size={14} className="text-indigo-600"/> Sincronização em Tempo Real
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="flex items-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <BookOpen size={18}/> {showSetupGuide ? 'Fechar Ajuda' : 'URLs Autorizados?'}
          </button>
        </div>

        {showSetupGuide && (
          <div className="mb-16 p-10 bg-slate-50 rounded-[40px] border border-slate-200 space-y-10 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">!</div>
              Configuração Obrigatória no Google
            </h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Para o botão "Ligar" funcionar, deve ir ao Google Cloud Console e adicionar este domínio à lista de <b>Authorized JavaScript Origins</b>. Se não o fizer, o Google bloqueará a ligação por segurança.
            </p>
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] font-bold text-amber-800 leading-relaxed">
              DICA: Não se esqueça de adicionar tanto o link do Vercel como o <code className="bg-white px-1 font-mono">http://localhost:5173</code>.
            </div>
          </div>
        )}

        {!config.isEnabled ? (
          <div className="space-y-10 max-w-2xl relative z-10">
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Conecte a sua conta para sincronizar dados entre o Excel no PC e o BalanceMaster no telemóvel via nuvem segura.
            </p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-sm flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? <Loader2 className="animate-spin" size={22} /> : <Cloud size={22} />}
              Ligar ao Google Drive
            </button>
          </div>
        ) : (
          <div className="space-y-10 relative z-10">
            <div className="p-10 bg-gradient-to-r from-indigo-50 to-white rounded-[40px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md border border-indigo-50">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-indigo-900">Sincronização Ativa</p>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Ligado via Google OAuth</p>
                </div>
              </div>
              <button 
                onClick={handleDisconnect}
                className="px-8 py-4 bg-white border border-rose-100 text-[11px] font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 transition-all rounded-2xl shadow-sm"
              >
                Interromper Conexão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
