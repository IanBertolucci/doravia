import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivity, togglePurchased, updateActivity } from '../api';
import Header from '../components/Header';
import AdminActivityForm from '../components/AdminActivityForm';
import {
  ArrowLeft, Clock, DollarSign, Check, X,
  Navigation, MapPin, Info, ExternalLink, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const load = () => {
    getActivity(id)
      .then(setActivity)
      .catch(() => toast.error('Erro ao carregar atividade'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleToggle = async () => {
    try {
      await togglePurchased(id);
      load();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleEdit = async (data) => {
    await updateActivity(id, data);
    toast.success('Atividade atualizada');
    setEditing(false);
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }
  if (!activity) return null;

  return (
    <div className="min-h-screen bg-page">
      <Header title="Detalhes" />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-secondary hover:text-primary transition"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm bg-elevated hover:bg-elevated text-body px-3 py-1.5 rounded-lg transition"
          >
            <Pencil size={14} /> Editar
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-custom overflow-hidden">
          {activity.photoUrl && (
            <div className="w-full h-64 bg-elevated flex items-center justify-center">
              <img
                src={activity.photoUrl}
                alt={activity.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">{activity.title}</h1>
                {activity.timeSlot && (
                  <p className="text-blue-400 flex items-center gap-2 mt-2">
                    <Clock size={16} /> {activity.timeSlot}
                  </p>
                )}
              </div>
              <button
                onClick={handleToggle}
                className={`shrink-0 p-3 rounded-xl transition ${
                  activity.purchased
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-elevated text-muted hover:bg-elevated'
                }`}
              >
                <Check size={20} />
              </button>
            </div>

            {activity.description && (
              <div>
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Observações</h2>
                <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {activity.price && (
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-secondary flex items-center gap-1 mb-1">
                    <DollarSign size={12} /> Valor
                  </p>
                  <p className="text-primary font-medium">{activity.price}</p>
                </div>
              )}

              <div className="bg-elevated rounded-lg p-3">
                <p className="text-xs text-secondary flex items-center gap-1 mb-1">
                  {activity.purchased ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />} Status
                </p>
                <p className={activity.purchased ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                  {activity.purchased ? 'Comprado' : 'Pendente'}
                </p>
              </div>
            </div>

            {activity.openingHours && (
              <div>
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Horários</h2>
                <p className="text-body text-sm whitespace-pre-wrap">{activity.openingHours}</p>
              </div>
            )}

            {activity.transport && (
              <div>
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">
                  <Navigation size={14} className="inline mr-1" /> Transporte
                </h2>
                <p className="text-body text-sm">{activity.transport}</p>
              </div>
            )}

            {activity.mapLink && (
              <a
                href={activity.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm"
              >
                <MapPin size={16} /> Abrir no Google Maps <ExternalLink size={14} />
              </a>
            )}

            {activity.curiosity && (
              <div>
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">
                  <Info size={14} className="inline mr-1" /> Curiosidades
                </h2>
                <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">{activity.curiosity}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {editing && (
        <AdminActivityForm
          mode="edit"
          activity={activity}
          onSave={handleEdit}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
