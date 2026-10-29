import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivities, togglePurchased, updateActivity, deleteActivity, getDay } from '../api';
import Header from '../components/Header';
import ActivityModal from '../components/ActivityModal';
import AdminActivityForm from '../components/AdminActivityForm';
import { ArrowLeft, Check, X, DollarSign, Clock, Navigation, Pencil, Trash2, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DayPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayInfo, setDayInfo] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const load = () => {
    Promise.all([
      getDay(dayId).catch(() => null),
      getActivities(dayId),
    ])
      .then(([day, acts]) => {
        setDayInfo(day);
        setActivities(acts);
      })
      .catch(() => toast.error('Erro ao carregar dia'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [dayId]);

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      await togglePurchased(id);
      load();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleEdit = async (data) => {
    await updateActivity(editingActivity.id, data);
    toast.success('Atividade atualizada');
    setEditingActivity(null);
    load();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Excluir atividade?')) return;
    try {
      await deleteActivity(id);
      toast.success('Atividade excluída');
      load();
    } catch {
      toast.error('Erro ao excluir');
    }
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
      <Header
        title="Atividades do Dia"
        subtitle={
          dayInfo
            ? (() => {
                const parts = [dayInfo.label];
                if (dayInfo.date) {
                  const d = new Date(dayInfo.date + 'T12:00:00');
                  parts.push(
                    d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  );
                }
                if (dayInfo.cityName) parts.push(dayInfo.cityName);
                if (dayInfo.sunset) parts.push(`⊙ ${dayInfo.sunset}`);
                return parts.join(' — ');
              })()
            : undefined
        }
      />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.id}
              onClick={() => setSelectedActivity(act)}
              className="bg-card rounded-xl border border-custom overflow-hidden cursor-pointer hover:bg-card-hover transition"
            >
              {act.photoUrl && (
                <div className="aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
                  <img
                    src={act.photoUrl}
                    alt={act.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {act.timeSlot && (
                      <span className="text-xs text-blue-400 flex items-center gap-1 mb-1.5">
                        <Clock size={12} /> {act.timeSlot}
                      </span>
                    )}
                    <h3 className="text-primary font-semibold text-base">{act.title}</h3>

                    {act.description && (
                      <p className="text-sm text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                      {act.price && (
                        <span className="text-xs text-muted flex items-center gap-1">
                          <DollarSign size={13} /> {act.price}
                        </span>
                      )}
                      {act.transport && (
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Navigation size={13} /> {act.transport}
                        </span>
                      )}
                      {act.mapLink && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <MapPin size={13} /> Ver mapa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => handleToggle(act.id, e)}
                      className={`p-2 rounded-full transition ${
                        act.purchased
                          ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
                          : 'bg-elevated text-muted hover:bg-elevated'
                      }`}
                    >
                      {act.purchased ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingActivity(act); }}
                      className="p-2 rounded-full bg-elevated text-secondary hover:text-blue-400 hover:bg-elevated transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(act.id, e)}
                      className="p-2 rounded-full bg-elevated text-secondary hover:text-red-400 hover:bg-elevated transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}

      {editingActivity && (
        <AdminActivityForm
          mode="edit"
          activity={editingActivity}
          onSave={handleEdit}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}
