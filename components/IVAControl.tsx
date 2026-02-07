
import React, { useMemo, useState } from 'react';
import { Scale, Calendar, Calculator, Info, PieChart, TrendingDown, Target } from 'lucide-react';
import { AccountingDocument, DocType } from '../types';

interface IVAControlProps {
  documents: AccountingDocument[];
}

export const IVAControl: React.FC<IVAControlProps> = ({ documents }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const vatStats = useMemo(() => {
    const yearDocs = documents.filter(doc => {
      const d = new Date(doc.date);
      return d.getFullYear() === selectedYear && doc.docType === DocType.INVOICE;
    });

    const totalPaid = yearDocs.reduce((acc, doc) => acc + (doc.vatAmount || 0), 0);
    const recoverable = yearDocs.reduce((acc, doc) => acc + ((doc.vatAmount || 0) * ((doc.vatDeductibility || 0) / 100)), 0);
    const wasted = totalPaid - recoverable;

    return { totalPaid, recoverable, wasted };
  }, [documents, selectedYear]);

  const quarterlyData = useMemo(() => {
    return [
      { name: 'T1', months: [0, 1, 2] },
      { name: 'T2', months: [3, 4, 5] },
      { name: 'T3', months: [6, 7, 8] },
      { name: 'T4', months: [9, 10, 11] }
    ].map(q => {
      const qDocs = documents.filter(doc => {
        const d = new Date(doc.date);
        return d.getFullYear() === selectedYear && q.months.includes(d.getMonth()) && doc.docType === DocType.INVOICE;
      });
      const qRec = qDocs.reduce((acc, doc) => acc + ((doc.vatAmount || 0) * ((doc.vatDeductibility || 0) / 100)), 0);
      return { ...q, value: qRec };
    });
  }, [documents, selectedYear]);

  return (
    <div className="space-y-10 pb-24">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="text-indigo-600" size={24} />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ciclo Fiscal {selectedYear}</h2>
        </div>
        <div className="flex gap-2">
          {[2024, 2025].map(y => (
            <button key={y} onClick={() => setSelectedYear(y)} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${selectedYear === y ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{y}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-2 flex items-center gap-2"><PieChart size={12}/> IVA Total Pago</p>
           <h3 className="text-4xl font-black tracking-tighter">€{vatStats.totalPaid.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
           <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Valor bruto em faturas</div>
        </div>
        
        <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mb-2 flex items-center gap-2"><Target size={12}/> IVA Recuperável</p>
           <h3 className="text-4xl font-black tracking-tighter">€{vatStats.recoverable.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
           <div className="mt-4 text-[9px] font-bold text-emerald-100 uppercase tracking-widest">A deduzir ao Estado</div>
           <Scale className="absolute -bottom-6 -right-6 opacity-10" size={120}/>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-rose-100 relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400 mb-2 flex items-center gap-2"><TrendingDown size={12}/> IVA Desperdiçado</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">€{vatStats.wasted.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
           <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dedução 0% ou Parcial</div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between mb-10">
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Calculator size={22} className="text-indigo-600"/> Projeção por Trimestre</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {quarterlyData.map(q => (
              <div key={q.name} className="relative p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">{q.name}</span>
                 <p className="text-2xl font-black text-slate-900">€{q.value.toFixed(2)}</p>
                 <div className="mt-4 h-1.5 w-full bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(q.value / (vatStats.recoverable || 1)) * 100}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 flex items-center gap-6">
         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg"><Info size={24}/></div>
         <div>
            <p className="text-xs font-bold text-indigo-900 leading-relaxed uppercase tracking-tight">Otimização Fiscal</p>
            <p className="text-[10px] font-medium text-indigo-700 leading-relaxed mt-1">
              O IVA desperdiçado representa custos sem benefício fiscal. Verifique se as categorias (Ex: Refeições 0%) estão corretamente configuradas no seu Excel para maximizar a recuperação.
            </p>
         </div>
      </div>
    </div>
  );
};
