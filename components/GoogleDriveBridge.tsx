
import React, { useState } from 'react';
import { Cloud, CheckCircle2, Loader2, BookOpen, Copy, Check, Settings, FileText, Briefcase, User, ShieldAlert, ExternalLink, Key } from 'lucide-react';
import { GoogleDriveConfig } from '../types';

interface GoogleDriveBridgeProps {
  config: GoogleDriveConfig;
  onUpdate: (config: GoogleDriveConfig) => void;
}

export const GoogleDriveBridge: React.FC<GoogleDriveBridgeProps> = ({ config, onUpdate }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!config.clientId);
  const [copied, setCopied] = useState(false);

  const currentOrigin = window.location.origin;

  const handleConnect = () => {
    if (!config.clientId) {
      alert("Por favor, insira o seu Client ID nas Definições Avançadas primeiro.");
      setShowAdvanced(true);
      return;
    }

    setIsConnecting(true);
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: config.clientId.trim(),
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.access_token) {
            onUpdate({
              ...config,
              isEnabled: true,
              accessToken: response.access_token,
              expiresAt: Date.now() + (response.expires_in * 1000)
            });
          }
          setIsConnecting(false);
        },
        error_callback: (err: any) => {
          console.error("Auth Error:", err);
          setIsConnecting(false);
          alert("Erro na autenticação. Verifique o Client ID e as Origins no Google Console.");
        }
      });
      client.requestAccessToken();
    } catch (e) {
      setIsConnecting(false);
      alert("Falha ao iniciar o cliente Google.");
    }
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-6">
      <div className="bg-white rounded-[48px] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-200">
              <Cloud size={44} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Google Data Source</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">Conecte os seus ficheiros Excel/JSON</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${showAdvanced ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
          >
            <Settings size={18}/> Definições
          </button>
        </div>

        {showAdvanced && (
          <div className="mb-16 space-y-10 p-10 bg-slate-50 rounded-[40px] border border-slate-200 animate-in slide-in-from-top-4">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Key size={16} className="text-indigo-600"/> 1. Credenciais do Google
              </h4>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Client ID (Obtido no Google Cloud Console)</label>
                <input 
                  type="text"
                  value={config.clientId || ''}
                  onChange={e => onUpdate({...config, clientId: e.target.value})}
                  placeholder="000000000000-abc.apps.googleusercontent.com"
                  className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl font-mono text-xs outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700">Origin Necessária: <code className="bg-white px-2 py-1 rounded ml-2">{currentOrigin}</code></span>
                  <button onClick={copyOrigin} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                    {copied ? <Check size={16}/> : <Copy size={16}/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-10">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-indigo-600"/> 2. IDs dos Ficheiros (Data)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                    <Briefcase size={12}/> Ficheiro Empresa (ID)
                  </label>
                  <input 
                    type="text"
                    value={config.businessFileId || ''}
                    onChange={e => onUpdate({...config, businessFileId: e.target.value})}
                    placeholder="Cole o ID do ficheiro do Drive"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                    <User size={12}/> Ficheiro Pessoal (ID)
                  </label>
                  <input 
                    type="text"
                    value={config.personalFileId || ''}
                    onChange={e => onUpdate({...config, personalFileId: e.target.value})}
                    placeholder="Cole o ID do ficheiro do Drive"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Dica: O ID está no URL do ficheiro: drive.google.com/file/d/<b>ESTE_CODIGO</b>/view
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-10 text-center">
          {!config.isEnabled ? (
            <div className="space-y-8">
              <p className="text-slate-500 font-medium max-w-md">
                Depois de configurar os IDs acima, clique abaixo para autorizar o acesso aos seus ficheiros.
              </p>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-sm flex items-center gap-4 shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {isConnecting ? <Loader2 className="animate-spin" size={22} /> : <Cloud size={22} />}
                Autorizar Ligação Cloud
              </button>
            </div>
          ) : (
            <div className="w-full p-10 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-emerald-900">Ligação Estabelecida</p>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pronto para ler dados</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdate({...config, isEnabled: false, accessToken: ''})}
                className="px-8 py-4 bg-white border border-rose-100 text-[11px] font-black text-rose-600 uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all"
              >
                Desligar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[48px] text-white flex items-center gap-8 shadow-2xl">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert className="text-indigo-400" size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-tight">Segurança Total</p>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Esta aplicação não guarda o seu Client ID em nenhum servidor. Tudo é processado localmente no seu browser. A Google apenas partilha os ficheiros que você autorizar via IDs específicos.
          </p>
        </div>
      </div>
    </div>
  );
};
