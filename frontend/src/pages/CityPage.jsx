import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCity, updateDay } from '../api';
import Header from '../components/Header';
import AdminDayForm from '../components/AdminDayForm';
import { ArrowLeft, Check, Clock, DollarSign, MapPin, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CityPage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);

  const load = () => {
    getCity(cityId)
      .then(setCity)
      .catch(() => toast.error('Erro ao carregar cidade'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [cityId]);

  const handleEditDay = async ({ label, date, sunset }) => {
    await updateDay(editingDay.id, label, date, sunset);
    toast.success('Dia atualizado');
    setEditingDay(null);
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }
  if (!city) return null;

  return (
    <div className="min-h-screen bg-page">
      <Header title={city.name} />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="relative pl-8 border-l-2 border-custom space-y-6">
          {city.days?.map((day) => (
            <div key={day.id} className="relative">
              <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-[var(--bg-page)]" />
              <div
                className="bg-card rounded-xl border border-custom p-4 cursor-pointer hover:bg-card-hover transition"
                onClick={() => navigate(`/days/${day.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-primary font-medium flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    {day.label}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingDay(day); }}
                    className="p-1.5 text-secondary hover:text-blue-400 transition"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {day.activities?.slice(0, 4).map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-sm">
                      <span className="text-secondary truncate">
                        {act.timeSlot && <span className="text-muted">{act.timeSlot} — </span>}
                        {act.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {act.price && <span className="text-xs text-muted">{act.price}</span>}
                        {act.purchased && <Check size={14} className="text-green-500" />}
                      </div>
                    </div>
                  ))}
                  {day.activities?.length > 4 && (
                    <p className="text-xs text-blue-400 mt-1">+{day.activities.length - 4} atividades</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {editingDay && (
        <AdminDayForm
          mode="edit"
          day={editingDay}
          onSave={handleEditDay}
          onClose={() => setEditingDay(null)}
        />
      )}
    </div>
  );
}
