import { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminContactForm({ mode, contact, onSave, onClose }) {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [relation, setRelation] = useState(contact?.relation || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSave({ name: name.trim(), phone: phone.trim(), relation: relation.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-custom p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">
            {mode === 'create' ? 'Adicionar Contato' : 'Editar Contato'}
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
          <label className="block text-sm text-body mb-1.5">Telefone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55 11 99999-0000"
            className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <label className="block text-sm text-body mb-1.5">Relação / Tipo</label>
          <input
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="Emergência, Família, etc."
            className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
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
