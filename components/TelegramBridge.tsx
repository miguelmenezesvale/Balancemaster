
import React, { useState, useEffect } from 'react';
import { Send, Bot, ShieldCheck, HelpCircle, CheckCircle2, AlertCircle, MessageSquare, Save, Check, Cloud, Info, ExternalLink, Loader2 } from 'lucide-react';
import { TelegramConfig } from '../types';

interface TelegramBridgeProps {
  config: TelegramConfig;
  onUpdate: (config: TelegramConfig) => void;
}

export const TelegramBridge: React.FC<TelegramBridgeProps> = ({ config, onUpdate }) => {
  const [tempToken, setTempToken] = useState(config.botToken);
  const [isSaved, setIsSaved] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setTempToken(config.botToken);
  }, [config.botToken]);

  const toggleStatus = () => {
    onUpdate({ ...config, isEnabled: !config.isEnabled, botToken: tempToken });
  };

  const toggleBackup = () => {
    onUpdate({ ...config, backupEnabled: !config.backupEnabled });
  };

  const saveToken = () => {
    onUpdate({ ...config, botToken: tempToken });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const captureChatId = async () => {
    if (!tempToken) return;
    setIsCapturing(true);
    try {
      const resp = await fetch(`https://api.telegram.org/bot${tempToken}/getUpdates?limit=1&offset=-1`);
      const data = await resp.json();
      if (data.ok && data.result.length > 0) {
        const chatId = data.result[0].message.chat.id.toString();
        onUpdate({ ...config, backupChatId: chatId, botToken: tempToken });
      } else {
        alert("Nenhuma mensagem encontrada. Envie um 'Olá' ou uma foto para o seu bot no Telegram e tente novamente.");
      }
    } catch (e) {
      alert("Erro ao conectar com o Telegram. Verifique o Token.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-600">
          <MessageSquare size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
              <Bot size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Telegram Inbox</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Envie fotos para o seu Bot e a App faz o resto</p>
            </div>
          </div>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all"
          >
            <HelpCircle size={14} /> Como configurar?
          </button>
        </div>

        {showHelp && (
          <div className="mb-12 p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Guia Rápido de Configuração</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">Crie um bot no <b>@BotFather</b> no Telegram e receba o <b>API Token</b>.</p>
              </div>
              <div className="space-y-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">Clique no link do seu bot e envie o comando <b>/start</b>.</p>
              </div>
              <div className="space-y-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">Cole o Token aqui, <b>Ative</b> e envie uma foto de uma fatura para o Bot!</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Telegram Bot Token (da @BotFather)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="password"
                value={tempToken}
                onChange={(e) => {
                  setTempToken(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Ex: 123456789:ABCDEF..."
                className="flex-1 px-6 py-5 bg-slate-50 border-none rounded-[24px] font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
              <button 
                onClick={saveToken}
                className={`flex items-center justify-center gap-2 px-8 py-5 rounded-[24px] font-black text-xs transition-all active:scale-95 ${isSaved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {isSaved ? <Check size={18} /> : <Save size={18} />}
                {isSaved ? 'Guardado' : 'Guardar Token'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col justify-between gap-6 border border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-black text-slate-900 flex items-center gap-2">Receção de Faturas</p>
                  <div className={`w-3 h-3 rounded-full ${config.isEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">O FaturaFlow vai vigiar o seu Bot por novas fotos enquanto a app estiver aberta.</p>
              </div>
              <button 
                onClick={toggleStatus}
                disabled={!tempToken}
                className={`w-full px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${config.isEnabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
              >
                {config.isEnabled ? 'Desativar Escuta' : 'Ativar Escuta'}
              </button>
            </div>

            <div className="p-8 bg-indigo-50/50 rounded-[32px] flex flex-col justify-between gap-6 border border-indigo-100">
              <div>
                <p className="text-sm font-black text-indigo-900 flex items-center gap-2">
                  <Cloud size={18} className={config.backupEnabled ? 'text-indigo-600' : 'text-slate-300'} />
                  Backup Automático
                </p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1 leading-relaxed">Cópia de segurança enviada para o seu Chat ID sempre que lança uma fatura.</p>
              </div>
              <div className="flex gap-2">
                {!config.backupChatId ? (
                  <button 
                    onClick={captureChatId}
                    disabled={!tempToken || isCapturing}
                    className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isCapturing ? <Loader2 className="animate-spin" size={14} /> : null}
                    {isCapturing ? 'A Capturar ID...' : 'Configurar Backup'}
                  </button>
                ) : (
                  <button 
                    onClick={toggleBackup}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${config.backupEnabled ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}
                  >
                    {config.backupEnabled ? 'Backup Ativo' : 'Backup Pausado'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-slate-900 rounded-[32px] text-white flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Info className="text-indigo-400" size={24} />
          <p className="text-[10px] font-medium text-slate-300 leading-relaxed">
            <b>Nota:</b> Como esta é uma app 100% local e segura, as fotos do Telegram só são importadas quando tem o FaturaFlow aberto no seu browser.
          </p>
        </div>
      </div>
    </div>
  );
};
