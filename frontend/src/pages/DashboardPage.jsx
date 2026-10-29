import { useState, useEffect } from 'react';
import { getCities, getCity, getDay, getActivities } from '../api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WeatherForecast from '../components/WeatherForecast';
import EmergencyContacts from '../components/EmergencyContacts';
import { ChevronDown, ChevronRight, Check, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [cities, setCities] = useState([]);
  const [citiesWithDays, setCitiesWithDays] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getCities()
      .then((data) => {
        if (cancelled) return;
        const enriched = data.map((c) => ({
          ...c,
          dayCount: 0,
          purchasedCount: 0,
        }));
        setCities(enriched);

        Promise.all(data.map((c) => getCity(c.id).catch(() => null)))
          .then((details) => {
            if (!cancelled) setCitiesWithDays(details.filter(Boolean));
          })
          .catch(() => {});
      })
      .catch(() => toast.error('Erro ao carregar cidades'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!citiesWithDays) return;
    citiesWithDays.forEach((city) => {
      (city.days || []).forEach((day) => {
        getDay(day.id).catch(() => {});
        getActivities(day.id).catch(() => {});
      });
    });
  }, [citiesWithDays]);

  const toggleExpand = async (cityId) => {
    if (expanded === cityId) {
      setExpanded(null);
      return;
    }
    try {
      const cityData = await getCity(cityId);
      setCities((prev) =>
        prev.map((c) => (c.id === cityId ? { ...c, days: cityData.days } : c))
      );
      setExpanded(cityId);
    } catch {
      toast.error('Erro ao carregar detalhes');
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
      <Header />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-primary mb-6">Roteiro de Viagem</h2>

        <WeatherForecast cities={citiesWithDays} />

        <div className="space-y-3">
          {cities.map((city) => (
            <div
              key={city.id}
              className="bg-card rounded-xl border border-custom overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(city.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-blue-400 shrink-0" />
                    <div className="text-left">
                    <span className="text-primary font-medium">{city.name}</span>
                    {city.days && (
                      <p className="text-xs text-secondary mt-0.5">
                        {city.days.length} dias
                      </p>
                    )}
                  </div>
                </div>
                {expanded === city.id ? (
                  <ChevronDown size={20} className="text-secondary" />
                ) : (
                  <ChevronRight size={20} className="text-secondary" />
                )}
              </button>

              {expanded === city.id && city.days && (
                <div className="border-t border-custom">
                  {city.days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => navigate(`/cities/${city.id}`)}
                      className="w-full flex items-center justify-between px-4 py-3 pl-12 hover:bg-card-hover/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-muted" />
                        <span className="text-sm text-body">{day.label}</span>
                      </div>
                      {day.activities?.some((a) => a.purchased) && (
                        <Check size={16} className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8"><EmergencyContacts /></div>
      </main>
    </div>
  );
}
