
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Briefcase, User, UploadCloud, BarChart3, TrendingUp, Wallet, Target, Activity, Calendar, ArrowRightLeft, FileText } from 'lucide-react';
import { AccountingDocument, Sphere, Budget, Payer } from '../types';

interface DashboardProps {
  documents: AccountingDocument[];
  budgets: Budget[];
  onImport: (docs: AccountingDocument[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ documents, budgets, onImport }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const d = new Date(doc.date);
      const matchesMonth = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      const matchesSearch = doc.supplier.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [documents, selectedMonth, selectedYear, searchQuery]);

  const stats = useMemo(() => {
    const company = filteredDocs.filter(d => d.sphere === Sphere.COMPANY).reduce((acc, d) => acc + d.totalAmount, 0);
    const personal = filteredDocs.filter(d => d.sphere === Sphere.PERSONAL).reduce((acc, d) => acc + d.totalAmount, 0);
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const managerPaid = filteredDocs.filter(d => d.payer === Payer.MANAGER && d.sphere === Sphere.COMPANY).reduce((acc, d) => acc + d.totalAmount, 0);
    return { company, personal, total: company + personal, totalBudget, managerPaid };
  }, [filteredDocs, budgets]);

  const budgetPerformance = useMemo(() => {
    return budgets.map(budget => {
      const spent = filteredDocs
        .filter(d => d.category === budget.category && d.sphere === budget.sphere)
        .reduce((acc, d) => acc + d.totalAmount, 0);
      return { ...budget, spent };
    });
  }, [filteredDocs, budgets]);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          const imported = Array.isArray(content) ? content : (content.documents || []);
          onImport(imported);
        } catch (err) { alert("Formato Inválido."); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="bg-white p-2 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-2 flex-1">
          <button onClick={() => setSelectedMonth(m => m === 0 ? 11 : m - 1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft size={20}/></button>
          <div className="flex-1 text-center font-black text-xs uppercase tracking-widest text-slate-900">{months[selectedMonth]} {selectedYear}</div>
          <button onClick={() => setSelectedMonth(m => m === 11 ? 0 : m + 1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all"><ChevronRight size={20}/></button>
        </div>
        <div className="relative flex-[2]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input 
            type="text" 
            placeholder="Procurar fornecedor ou categoria..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[28px] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <button onClick={handleImport} className="bg-white text-slate-400 px-8 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
          <UploadCloud size={18}/> Importar JSON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-50 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Empresa</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">€{stats.company.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-50 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Pessoal</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">€{stats.personal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-2">Conta Corrente Sócio</p>
          <h3 className="text-3xl font-black text-indigo-900 tracking-tighter">€{stats.managerPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative group hover:-translate-y-1 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-2">Consumo Total</p>
          <h3 className="text-3xl font-black tracking-tighter">€{stats.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
               <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Target size={22} className="text-indigo-600"/> Budget Intelligence</h4>
            </div>
            <div className="space-y-8">
               {budgetPerformance.length > 0 ? budgetPerformance.map(bp => {
                 const percentage = Math.min((bp.spent / bp.amount) * 100, 100);
                 const isHigh = percentage > 85;
                 return (
                   <div key={bp.id} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black text-slate-700 tracking-tight uppercase">{bp.category}</span>
                        <div className="text-right">
                           <span className={`text-sm font-black ${isHigh ? 'text-rose-500' : 'text-slate-900'}`}>€{bp.spent.toFixed(0)}</span>
                           <span className="text-[10px] font-bold text-slate-300"> / €{bp.amount}</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-700 ${isHigh ? 'bg-rose-500' : bp.sphere === Sphere.COMPANY ? 'bg-indigo-600' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                   </div>
                 )
               }) : (
                 <div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-50 rounded-3xl">
                    Sem orçamentos definidos para este mês
                 </div>
               )}
            </div>
         </div>

         <div className="bg-white rounded-[48px] p-10 border border-slate-100 flex flex-col relative overflow-hidden">
            <h4 className="text-lg font-black mb-6 uppercase tracking-widest flex items-center gap-2"><History className="text-indigo-600" size={20}/> Últimos Movimentos</h4>
            <div className="space-y-6 flex-1">
               {filteredDocs.length > 0 ? filteredDocs.slice(0, 6).map(doc => (
                 <div key={doc.id} className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.sphere === Sphere.COMPANY ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-500'}`}>
                       {doc.sphere === Sphere.COMPANY ? <Briefcase size={18}/> : <User size={18}/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-black text-slate-900 truncate">{doc.supplier}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{doc.category}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">€{doc.totalAmount.toFixed(2)}</p>
                    </div>
                 </div>
               )) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
                    <FileText size={48} className="mb-4 opacity-20"/>
                    <p className="text-[9px] font-black uppercase tracking-widest">Sem registos</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const History = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
