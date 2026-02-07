
import React, { useState } from 'react';
import { Target, Plus, Trash2, Briefcase, User, Wallet, Info } from 'lucide-react';
import { Budget, Sphere } from '../types';

interface BudgetsControlProps {
  budgets: Budget[];
  onUpdate: (budgets: Budget[]) => void;
}

export const BudgetsControl: React.FC<BudgetsControlProps> = ({ budgets, onUpdate }) => {
  const [newBudget, setNewBudget] = useState({ category: '', amount: '', sphere: Sphere.COMPANY });

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      onUpdate([...budgets, { id: crypto.randomUUID(), category: newBudget.category, amount: Number(newBudget.amount), sphere: newBudget.sphere }]);
      setNewBudget({ category: '', amount: '', sphere: Sphere.COMPANY });
    }
  };

  const removeBudget = (id: string) => {
    onUpdate(budgets.filter(b => b.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Creation Card */}
      <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <Target className="text-indigo-600" size={26}/> Definir Novo Limite
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
           <div className="md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Esfera</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl">
                 <button onClick={() => setNewBudget({...newBudget, sphere: Sphere.COMPANY})} className={`flex-1 p-2 rounded-xl transition-all ${newBudget.sphere === Sphere.COMPANY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Briefcase size={16} className="mx-auto"/></button>
                 <button onClick={() => setNewBudget({...newBudget, sphere: Sphere.PERSONAL})} className={`flex-1 p-2 rounded-xl transition-all ${newBudget.sphere === Sphere.PERSONAL ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400'}`}><User size={16} className="mx-auto"/></button>
              </div>
           </div>
           <div className="md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Categoria</label>
              <input type="text" value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})} placeholder="Ex: Gasóleo" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-600/10"/>
           </div>
           <div className="md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Valor (€)</label>
              <input type="number" value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})} placeholder="500" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-600/10"/>
           </div>
           <button onClick={addBudget} className="bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2">
              <Plus size={18}/> Criar Budget
           </button>
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Wallet size={22} className="text-emerald-500"/> Orçamentos Ativos</h4>
         </div>
         <div className="divide-y divide-slate-50">
            {budgets.map(b => (
              <div key={b.id} className="p-8 flex items-center justify-between group">
                 <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.sphere === Sphere.COMPANY ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-500'}`}>
                       {b.sphere === Sphere.COMPANY ? <Briefcase size={20}/> : <User size={20}/>}
                    </div>
                    <div>
                       <p className="text-lg font-black text-slate-900">{b.category}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esfera {b.sphere}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-2xl font-black text-slate-900">€{b.amount}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mensal</p>
                    </div>
                    <button onClick={() => removeBudget(b.id)} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 p-2"><Trash2 size={20}/></button>
                 </div>
              </div>
            ))}
            {budgets.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-black uppercase text-xs">Ainda não definiu orçamentos de controlo</div>
            )}
         </div>
      </div>

      <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex items-center gap-6 shadow-2xl">
         <Info size={32} className="opacity-40 shrink-0"/>
         <p className="text-xs font-medium leading-relaxed">
            <b>Dica de Gestão:</b> Os orçamentos são transversais. Se tiver faturas no Google Drive com as categorias aqui definidas, a barra de progresso no Dashboard atualizar-se-á automaticamente.
         </p>
      </div>
    </div>
  );
};
