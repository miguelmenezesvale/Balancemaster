
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle2, RefreshCcw, FolderClosed, Briefcase, User, Save } from 'lucide-react';
import { Payer, AccountingDocument, Category, DocType, Sphere } from '../types';
import { extractDocumentData } from '../services/geminiService';

interface InvoiceFormProps {
  categories: Category[];
  initialData?: AccountingDocument;
  onSave: (doc: Omit<AccountingDocument, 'id' | 'timestamp' | 'drivePath'>) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ categories, initialData, onSave, onCancel }) => {
  const [sphere, setSphere] = useState<Sphere>(initialData?.sphere || Sphere.COMPANY);
  const [docType, setDocType] = useState<DocType>(initialData?.docType || DocType.INVOICE);
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>(initialData ? 'review' : 'upload');
  const [fileData, setFileData] = useState<string | null>(initialData?.fileData || null);
  
  const [formData, setFormData] = useState<Partial<AccountingDocument>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    supplier: initialData?.supplier || '',
    totalAmount: initialData?.totalAmount || 0,
    vatAmount: initialData?.vatAmount || 0,
    vatDeductibility: initialData?.vatDeductibility || 100,
    category: initialData?.category || '',
    payer: initialData?.payer || Payer.COMPANY,
    fileName: initialData?.fileName || ''
  });

  const processFile = async (file: File) => {
    setStep('processing');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setFileData(base64);
      try {
        const extracted = await extractDocumentData(base64, file.type, categories.map(c => c.name), docType);
        setFormData(prev => ({ ...prev, ...extracted, fileName: file.name }));
        setStep('review');
      } catch (err) { setStep('review'); }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      docType,
      sphere,
      date: formData.date || '',
      supplier: formData.supplier || 'Documento',
      totalAmount: Number(formData.totalAmount || 0),
      vatAmount: sphere === Sphere.COMPANY ? Number(formData.vatAmount || 0) : 0,
      vatDeductibility: sphere === Sphere.COMPANY ? Number(formData.vatDeductibility || 100) : 0,
      category: formData.category || 'Geral',
      payer: formData.payer || Payer.COMPANY,
      fileName: formData.fileName || 'manual.pdf',
      fileData: fileData || undefined
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex justify-center gap-3 mb-12">
        <button 
          onClick={() => setSphere(Sphere.COMPANY)} 
          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all ${sphere === Sphere.COMPANY ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          <Briefcase size={16}/> Esfera Empresa
        </button>
        <button 
          onClick={() => setSphere(Sphere.PERSONAL)} 
          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all ${sphere === Sphere.PERSONAL ? 'bg-amber-500 text-white shadow-xl shadow-amber-100' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          <User size={16}/> Esfera Pessoal
        </button>
      </div>

      {step === 'upload' && (
        <div 
          onClick={() => document.getElementById('file-input')?.click()}
          className="bg-white border-2 border-dashed border-slate-100 rounded-[48px] p-24 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/20 transition-all group shadow-2xl shadow-slate-200/40"
        >
          <div className={`w-28 h-28 text-white rounded-[40px] flex items-center justify-center mb-10 group-hover:scale-110 transition-all shadow-2xl ${sphere === Sphere.COMPANY ? 'bg-indigo-600 shadow-indigo-100' : 'bg-amber-500 shadow-amber-100'}`}>
            <Upload size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Lançar {sphere === Sphere.COMPANY ? 'Fatura' : 'Gasto'}</h2>
          <p className="text-slate-400 text-sm font-medium">Carregue o comprovativo da esfera <b>{sphere}</b></p>
          <input id="file-input" type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </div>
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-[48px] p-32 flex flex-col items-center justify-center text-center shadow-xl">
          <div className={`w-24 h-24 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin mb-10`}></div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Análise Fiscal IA</h2>
          <p className="text-slate-400 font-bold text-xs mt-2 italic uppercase tracking-widest">A extrair dados do documento...</p>
        </div>
      )}

      {step === 'review' && (
        <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
           <div className={`px-12 py-8 flex items-center justify-between ${sphere === Sphere.COMPANY ? 'bg-slate-900' : 'bg-amber-600'}`}>
              <div className="flex items-center gap-4 text-white">
                <FolderClosed size={20} className="opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-widest">Revisão de Dados</span>
              </div>
              <button onClick={onCancel} className="text-[11px] font-black text-white/40 uppercase hover:text-white transition-colors">Cancelar</button>
           </div>

           <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Nome do Fornecedor / Entidade</label>
                      <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full text-2xl font-black text-slate-900 bg-slate-50 border-none rounded-3xl p-6 focus:ring-4 focus:ring-indigo-500/5 outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Data</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full text-sm font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-6 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Categoria</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full text-sm font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-6 outline-none appearance-none">
                           <option value="Geral">Geral</option>
                           {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className={`p-10 rounded-[40px] text-white shadow-xl ${sphere === Sphere.COMPANY ? 'bg-indigo-600 shadow-indigo-100' : 'bg-amber-500 shadow-amber-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Valor Total Pago</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black">€</span>
                        <input type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} className="bg-transparent border-none text-5xl font-black focus:outline-none w-full text-white" />
                      </div>
                   </div>
                   {sphere === Sphere.COMPANY && (
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Valor IVA</label>
                            <input type="number" step="0.01" value={formData.vatAmount} onChange={e => setFormData({...formData, vatAmount: Number(e.target.value)})} className="w-full text-base font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-6 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Dedução CIVA</label>
                            <select value={formData.vatDeductibility} onChange={e => setFormData({...formData, vatDeductibility: Number(e.target.value)})} className="w-full text-base font-black text-slate-700 bg-slate-50 border-none rounded-2xl p-6 outline-none">
                               <option value="100">100% (Total)</option>
                               <option value="50">50% (Gasóleo)</option>
                               <option value="0">0% (Não dedutível)</option>
                            </select>
                         </div>
                      </div>
                   )}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex gap-6">
                 {!initialData && (
                   <button onClick={() => setStep('upload')} className="w-24 h-24 flex items-center justify-center bg-slate-50 text-slate-400 rounded-[32px] hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all"><RefreshCcw size={24}/></button>
                 )}
                 <button onClick={handleSubmit} className={`flex-1 flex items-center justify-center gap-4 py-8 rounded-[32px] font-black text-2xl text-white shadow-2xl transition-all active:scale-95 ${sphere === Sphere.COMPANY ? 'bg-slate-900 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                    {initialData ? <Save size={28}/> : <CheckCircle2 size={28}/>}
                    {initialData ? 'Guardar Alterações' : 'Confirmar Lançamento'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
