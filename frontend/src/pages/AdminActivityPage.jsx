import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivities, createActivity, updateActivity, deleteActivity, reorderActivities, togglePurchased } from '../api';
import Header from '../components/Header';
import AdminActivityForm from '../components/AdminActivityForm';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminActivityPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  const load = () => {
    getActivities(dayId)
      .then(setActivities)
      .catch(() => toast.error('Erro ao carregar atividades'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [dayId]);

  const handleCreate = async (data) => {
    await createActivity(dayId, data);
    toast.success('Atividade criada');
    load();
  };

  const handleUpdate = async (id, data) => {
    await updateActivity(id, data);
    toast.success('Atividade atualizada');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir atividade?')) return;
    await deleteActivity(id);
    toast.success('Atividade excluída');
    load();
  };

  const handleToggle = async (id) => {
    await togglePurchased(id);
    load();
  };

  const handleReorder = async (index, dir) => {
    const ids = activities.map((a) => a.id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorderActivities(dayId, ids);
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <Header title="Atividades do Dia" />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-secondary hover:text-primary transition"
          >
            &larr; Voltar para Admin
          </button>
          <button
            onClick={() => setForm({ mode: 'create' })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="bg-card rounded-xl border border-custom overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom text-secondary text-xs uppercase">
                <th className="text-left p-3">Ordem</th>
                <th className="text-left p-3">Horário</th>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3">Valor</th>
                <th className="text-center p-3">Comprado</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act, idx) => (
                <tr key={act.id} className="border-b border-custom last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleReorder(idx, -1)} className="p-1 text-secondary hover:text-primary"><ArrowUp size={12} /></button>
                      <button onClick={() => handleReorder(idx, 1)} className="p-1 text-secondary hover:text-primary"><ArrowDown size={12} /></button>
                    </div>
                  </td>
                  <td className="p-3 text-body">{act.timeSlot}</td>
                  <td className="p-3 text-primary max-w-[200px] truncate">{act.title}</td>
                  <td className="p-3 text-body">{act.price}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggle(act.id)}
                      className={`p-1.5 rounded-full ${act.purchased ? 'bg-green-900/50 text-green-400' : 'bg-elevated text-muted'}`}
                    >
                      <Check size={14} />
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setForm({ mode: 'edit', activity: act })} className="p-1.5 text-secondary hover:text-blue-400"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(act.id)} className="p-1.5 text-secondary hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length === 0 && (
            <p className="text-center text-muted py-8">Nenhuma atividade cadastrada</p>
          )}
        </div>
      </main>

      {form && (
        <AdminActivityForm
          mode={form.mode}
          activity={form.activity}
          onSave={form.mode === 'create' ? handleCreate : (data) => handleUpdate(form.activity.id, data)}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
