
import React, { useMemo } from 'react';
import { Users, ArrowUpRight, ArrowDownLeft, Briefcase, User, History, Wallet, CheckCircle2 } from 'lucide-react';
import { AccountingDocument, Payer, Sphere } from '../types';

interface CurrentAccountProps {
  documents: AccountingDocument[];
}

export const CurrentAccount: React.FC<CurrentAccountProps> = ({ documents }) => {
  const accountStats = useMemo(() => {
    // Company owes Manager: Manager paid for Company expense
    const owedToManager = documents
      .filter(d => d.payer === Payer.MANAGER && d.sphere === Sphere.COMPANY)
      .reduce((acc, d) => acc + d.totalAmount, 0);

    // Manager owes Company: Company paid for Manager's personal expense
    const owedByManager = documents
      .filter(d => d.payer === Payer.COMPANY && d.sphere === Sphere.PERSONAL)
      .reduce((acc, d) => acc + d.totalAmount, 0);

    const balance = owedToManager - owedByManager;
    return { owedToManager, owedByManager, balance };
  }, [documents]);

  const relevantDocs = useMemo(() => {
    return documents.filter(d => 
      (d.payer === Payer.MANAGER && d.sphere === Sphere.COMPANY) || 
      (d.payer === Payer.COMPANY && d.sphere === Sphere.PERSONAL)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents]);

  return (
    <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Saldo Conta Corrente Sócio</p>
                 <h3 className="text-6xl font-black tracking-tighter">
                   €{Math.abs(accountStats.balance).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                 </h3>
                 <p className={`mt-4 text-xs font-black uppercase tracking-widest ${accountStats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {accountStats.balance >= 0 ? 'A Empresa deve ao Sócio' : 'O Sócio deve à Empresa'}
                 </p>
              </div>
              <div className="mt-12 flex gap-8">
                 <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex-1">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-1">A Empresa deve</p>
                    <p className="text-xl font-black">€{accountStats.owedToManager.toFixed(2)}</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex-1">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-1">O Sócio deve</p>
                    <p className="text-xl font-black">€{accountStats.owedByManager.toFixed(2)}</p>
                 </div>
              </div>
           </div>
           <Users className="absolute -bottom-10 -right-10 text-white/5" size={280} />
        </div>

        <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm flex flex-col justify-center text-center">
           <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${accountStats.balance >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'}`}>
              {accountStats.balance >= 0 ? <ArrowUpRight size={32}/> : <ArrowDownLeft size={32}/>}
           </div>
           <h4 className="text-xl font-black text-slate-900 mb-2">Estado Atual</h4>
           <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">
              {accountStats.balance >= 0 
                ? "A empresa utilizou capital do sócio para despesas correntes. Recomenda-se o reembolso quando o fluxo de caixa permitir."
                : "Existem despesas pessoais pagas com capital da empresa. Recomenda-se o acerto de contas para evitar desequilíbrios contabilísticos."}
           </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
         <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><History size={22} className="text-indigo-600"/> Histórico de Conta Corrente</h4>
            <div className="px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">{relevantDocs.length} Entradas</div>
         </div>
         <div className="divide-y divide-slate-50">
            {relevantDocs.map(doc => {
              const isManagerPaid = doc.payer === Payer.MANAGER;
              return (
                <div key={doc.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center gap-6 group">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isManagerPaid ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isManagerPaid ? <User size={22}/> : <Briefcase size={22}/>}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-base font-black text-slate-900">{doc.supplier}</span>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isManagerPaid ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {isManagerPaid ? 'Pago pelo Sócio' : 'Pago pela Empresa'}
                         </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         {doc.category} • {new Date(doc.date).toLocaleDateString('pt-PT')} • Esfera {doc.sphere}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className={`text-2xl font-black ${isManagerPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {isManagerPaid ? '+' : '-'}€{doc.totalAmount.toFixed(2)}
                      </p>
                   </div>
                </div>
              );
            })}
            {relevantDocs.length === 0 && (
              <div className="p-32 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <CheckCircle2 size={32}/>
                 </div>
                 <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Contas perfeitamente equilibradas</p>
              </div>
            )}
         </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
               <Wallet size={24}/>
            </div>
            <div>
               <p className="text-sm font-black text-slate-900 uppercase">Resumo Estratégico</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Reembolso sugerido via transferência: €{Math.abs(accountStats.balance).toFixed(2)}
               </p>
            </div>
         </div>
         <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
            Marcar Acerto <CheckCircle2 size={14}/>
         </button>
      </div>
    </div>
  );
};
