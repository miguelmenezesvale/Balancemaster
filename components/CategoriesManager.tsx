
import React, { useState } from 'react';
import { Tag, Plus, X, Check } from 'lucide-react';
import { Category } from '../types';

interface CategoriesManagerProps {
  categories: Category[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({ categories, onAdd, onRemove }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <Tag size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">As Minhas Categorias</h2>
          <p className="text-sm text-slate-500">Defina os tipos de despesa para a IA aprender.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input 
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ex: Refeições, Marketing..."
          className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
            <span className="font-semibold text-slate-700">{cat.name}</span>
            <button 
              onClick={() => onRemove(cat.id)}
              className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            Ainda não definiu categorias personalizadas.
          </div>
        )}
      </div>
    </div>
  );
};
