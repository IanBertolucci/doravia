import { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminCityForm({ mode, city, onSave, onClose }) {
  const [name, setName] = useState(city?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-custom p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">
            {mode === 'create' ? 'Adicionar Cidade' : 'Editar Cidade'}
          </h3>
          <button onClick={onClose} className="text-secondary hover:text-primary"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-body mb-1.5">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-secondary hover:text-primary transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-primary rounded-lg transition">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
