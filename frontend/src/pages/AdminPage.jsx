import { useState, useEffect } from 'react';
import { getCities, createCity, updateCity, deleteCity, reorderCities,
         getDays, createDay, updateDay, deleteDay, reorderDays,
         getContacts, createContact, updateContact, deleteContact,
         getBackups, createBackup } from '../api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AdminCityForm from '../components/AdminCityForm';
import AdminDayForm from '../components/AdminDayForm';
import AdminContactForm from '../components/AdminContactForm';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Phone, Download, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCity, setExpandedCity] = useState(null);
  const [cityDays, setCityDays] = useState({});
  const [cityForm, setCityForm] = useState(null);
  const [dayForm, setDayForm] = useState(null);
  const navigate = useNavigate();

  const loadCities = () => {
    getCities().then(setCities).catch(() => toast.error('Erro ao carregar cidades')).finally(() => setLoading(false));
  };

  useEffect(() => { loadCities(); }, []);

  const loadDays = async (cityId) => {
    try {
      const days = await getDays(cityId);
      setCityDays((prev) => ({ ...prev, [cityId]: days }));
    } catch {
      toast.error('Erro ao carregar dias');
    }
  };

  const toggleExpand = (cityId) => {
    if (expandedCity === cityId) {
      setExpandedCity(null);
      return;
    }
    setExpandedCity(cityId);
    if (!cityDays[cityId]) loadDays(cityId);
  };

  const handleCreateCity = async (name) => {
    await createCity(name);
    toast.success('Cidade criada');
    loadCities();
  };

  const handleUpdateCity = async (id, name) => {
    await updateCity(id, name);
    toast.success('Cidade atualizada');
    loadCities();
  };

  const handleDeleteCity = async (id) => {
    if (!confirm('Excluir cidade?')) return;
    await deleteCity(id);
    toast.success('Cidade excluída');
    loadCities();
  };

  const handleReorderCity = async (index, dir) => {
    const ids = cities.map((c) => c.id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorderCities(ids);
    loadCities();
  };

  const handleCreateDay = async (cityId, { label, date, sunset }) => {
    await createDay(cityId, label, date, sunset);
    toast.success('Dia criado');
    loadDays(cityId);
  };

  const handleUpdateDay = async (id, { label, date, sunset }) => {
    await updateDay(id, label, date, sunset);
    toast.success('Dia atualizado');
    if (expandedCity) loadDays(expandedCity);
  };

  const handleDeleteDay = async (id) => {
    if (!confirm('Excluir dia?')) return;
    await deleteDay(id);
    toast.success('Dia excluído');
    if (expandedCity) loadDays(expandedCity);
  };

  const handleReorderDay = async (cityId, index, dir) => {
    const days = cityDays[cityId] || [];
    const ids = days.map((d) => d.id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorderDays(cityId, ids);
    loadDays(cityId);
  };

  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState(null);

  const loadContacts = () => {
    getContacts().then(setContacts).catch(() => toast.error('Erro ao carregar contatos'));
  };

  useEffect(() => { loadContacts(); }, []);

  const handleCreateContact = async ({ name, phone, relation }) => {
    await createContact({ name, phone, relation });
    toast.success('Contato criado');
    loadContacts();
  };

  const handleUpdateContact = async (id, { name, phone, relation }) => {
    await updateContact(id, { name, phone, relation });
    toast.success('Contato atualizado');
    loadContacts();
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Excluir contato?')) return;
    await deleteContact(id);
    toast.success('Contato excluído');
    loadContacts();
  };

  const [backups, setBackups] = useState([]);

  const loadBackups = () => {
    getBackups().then(setBackups).catch(() => {});
  };

  useEffect(() => { loadBackups(); }, []);

  const handleCreateBackup = async () => {
    toast.promise(createBackup(), {
      loading: 'Criando backup...',
      success: 'Backup criado',
      error: 'Erro ao criar backup',
    });
    await loadBackups();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (ms) => {
    return new Date(ms).toLocaleString('pt-BR');
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
      <Header title="Admin" />
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Gerenciar Cidades</h2>
          <button
            onClick={() => setCityForm({ mode: 'create' })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {cities.map((city, idx) => (
            <div key={city.id} className="bg-card rounded-xl border border-custom overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(city.id)}
                    className="text-secondary hover:text-primary"
                  >
                    {expandedCity === city.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <span className="text-primary font-medium">{city.name}</span>
                  <span className="text-xs text-muted">ordem: {city.displayOrder}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleReorderCity(idx, -1)} className="p-1.5 text-secondary hover:text-primary"><ArrowUp size={14} /></button>
                  <button onClick={() => handleReorderCity(idx, 1)} className="p-1.5 text-secondary hover:text-primary"><ArrowDown size={14} /></button>
                  <button onClick={() => setCityForm({ mode: 'edit', city })} className="p-1.5 text-secondary hover:text-blue-400"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteCity(city.id)} className="p-1.5 text-secondary hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>

              {expandedCity === city.id && (
                <div className="border-t border-custom px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-secondary">Dias</span>
                    <button
                      onClick={() => setDayForm({ mode: 'create', cityId: city.id })}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition"
                    >
                      <Plus size={14} /> Adicionar dia
                    </button>
                  </div>
                  {(cityDays[city.id] || []).map((day, dIdx) => (
                    <div key={day.id} className="flex items-center justify-between py-2 border-b border-custom last:border-0">
                      <span className="text-sm text-body">{day.label}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleReorderDay(city.id, dIdx, -1)} className="p-1 text-secondary hover:text-primary"><ArrowUp size={12} /></button>
                        <button onClick={() => handleReorderDay(city.id, dIdx, 1)} className="p-1 text-secondary hover:text-primary"><ArrowDown size={12} /></button>
                        <button
                          onClick={() => navigate(`/admin/activities/${day.id}`)}
                          className="p-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          Atividades
                        </button>
                        <button onClick={() => setDayForm({ mode: 'edit', day, cityId: city.id })} className="p-1 text-secondary hover:text-blue-400"><Pencil size={12} /></button>
                        <button onClick={() => handleDeleteDay(day.id)} className="p-1 text-secondary hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  {(!cityDays[city.id] || cityDays[city.id].length === 0) && (
                    <p className="text-xs text-muted">Nenhum dia cadastrado</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Phone size={18} className="text-red-400" /> Contatos de Emergência
            </h2>
            <button
              onClick={() => setContactForm({ mode: 'create' })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg text-sm transition"
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="bg-card rounded-xl border border-custom px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-primary font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted truncate">{c.phone} {c.relation && `— ${c.relation}`}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button onClick={() => setContactForm({ mode: 'edit', contact: c })} className="p-1.5 text-secondary hover:text-blue-400"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteContact(c.id)} className="p-1.5 text-secondary hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-sm text-muted">Nenhum contato cadastrado</p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <HardDrive size={18} className="text-green-400" /> Backups
            </h2>
            <button
              onClick={handleCreateBackup}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg text-sm transition"
            >
              <Plus size={16} /> Fazer Backup
            </button>
          </div>

          <div className="space-y-2">
            {backups.map((b) => (
              <div key={b.filename} className="bg-card rounded-xl border border-custom px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-primary font-medium truncate">{b.filename}</p>
                  <p className="text-xs text-muted">{formatDate(b.modified)} — {formatSize(b.size)}</p>
                </div>
                <a
                  href={`/api/backups/${b.filename}`}
                  download
                  className="shrink-0 ml-3 p-2 rounded-lg bg-elevated text-secondary hover:text-blue-400 hover:bg-card-hover transition"
                >
                  <Download size={16} />
                </a>
              </div>
            ))}
            {backups.length === 0 && (
              <p className="text-sm text-muted">Nenhum backup criado</p>
            )}
          </div>
        </div>
      </main>

      {cityForm && (
        <AdminCityForm
          mode={cityForm.mode}
          city={cityForm.city}
          onSave={cityForm.mode === 'create' ? handleCreateCity : (name) => handleUpdateCity(cityForm.city.id, name)}
          onClose={() => setCityForm(null)}
        />
      )}

      {dayForm && (
        <AdminDayForm
          mode={dayForm.mode}
          day={dayForm.day}
          onSave={dayForm.mode === 'create' ? (data) => handleCreateDay(dayForm.cityId, data) : (data) => handleUpdateDay(dayForm.day.id, data)}
          onClose={() => setDayForm(null)}
        />
      )}

      {contactForm && (
        <AdminContactForm
          mode={contactForm.mode}
          contact={contactForm.contact}
          onSave={contactForm.mode === 'create' ? handleCreateContact : (data) => handleUpdateContact(contactForm.contact.id, data)}
          onClose={() => setContactForm(null)}
        />
      )}
    </div>
  );
}
