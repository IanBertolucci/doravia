import { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminActivityForm({ mode, activity, onSave, onClose }) {
  const [form, setForm] = useState({
    timeSlot: activity?.timeSlot || '',
    title: activity?.title || '',
    description: activity?.description || '',
    price: activity?.price || '',
    purchased: activity?.purchased || false,
    openingHours: activity?.openingHours || '',
    transport: activity?.transport || '',
    mapLink: activity?.mapLink || '',
    photoUrl: activity?.photoUrl || '',
    curiosity: activity?.curiosity || '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-custom p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">
            {mode === 'create' ? 'Adicionar Atividade' : 'Editar Atividade'}
          </h3>
          <button onClick={onClose} className="text-secondary hover:text-primary"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-body mb-1">Título *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Horário</label>
            <input type="text" value={form.timeSlot} onChange={(e) => handleChange('timeSlot', e.target.value)}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body mb-1">Valor</label>
              <input type="text" value={form.price} onChange={(e) => handleChange('price', e.target.value)}
                className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                <input type="checkbox" checked={form.purchased} onChange={(e) => handleChange('purchased', e.target.checked)}
                  className="w-4 h-4 rounded border-custom-light bg-elevated" />
                Comprado
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Horários de funcionamento</label>
            <textarea value={form.openingHours} onChange={(e) => handleChange('openingHours', e.target.value)} rows={3}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Transporte</label>
            <input type="text" value={form.transport} onChange={(e) => handleChange('transport', e.target.value)}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Link do Mapa</label>
            <input type="text" value={form.mapLink} onChange={(e) => handleChange('mapLink', e.target.value)}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">URL da Foto</label>
            <input type="text" value={form.photoUrl} onChange={(e) => handleChange('photoUrl', e.target.value)}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">Curiosidade</label>
            <textarea value={form.curiosity} onChange={(e) => handleChange('curiosity', e.target.value)} rows={4}
              className="w-full bg-elevated border border-custom-light rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-secondary hover:text-primary transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-primary rounded-lg transition">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
