import { useState, useEffect } from 'react';
import { getContacts } from '../api';
import { Phone } from 'lucide-react';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getContacts()
      .then((data) => { if (!cancelled) setContacts(data); })
      .catch(() => { if (!cancelled) setContacts([]); });

    return () => { cancelled = true; };
  }, []);

  if (contacts === null) return null;
  if (contacts.length === 0) return null;

  const emergency = contacts.filter((c) => c.relation !== 'Família');
  const family = contacts.filter((c) => c.relation === 'Família');

  return (
    <div className="bg-card rounded-xl border border-custom p-4 mb-6">
      <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Phone size={14} className="text-red-400" />
        Contatos de Emergência
      </h3>

      {emergency.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {emergency.map((c) => (
            <a
              key={c.id}
              href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-card-hover transition gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-primary font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-muted truncate">{c.relation}</p>
              </div>
              <span className="text-sm text-blue-400 font-medium shrink-0">{c.phone}</span>
            </a>
          ))}
        </div>
      )}

      {family.length > 0 && (
        <div>
          <p className="text-[11px] text-secondary font-medium mb-2">Família</p>
          <div className="space-y-1.5">
            {family.map((c) => (
              <a
                key={c.id}
                href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-card-hover transition gap-3"
              >
                <p className="text-sm text-primary font-medium min-w-0 truncate">{c.name}</p>
                <span className="text-sm text-blue-400 font-medium shrink-0">{c.phone}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
