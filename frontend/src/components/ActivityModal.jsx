import { X, Clock, DollarSign, Check, Navigation, MapPin, Info, ExternalLink } from 'lucide-react';

export default function ActivityModal({ activity, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card sm:rounded-2xl border-0 sm:border border-custom w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-custom z-10">
          <h2 className="text-lg font-bold text-primary truncate pr-4">{activity.title}</h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activity.timeSlot && (
            <p className="text-blue-400 flex items-center gap-2 text-sm">
              <Clock size={14} /> {activity.timeSlot}
            </p>
          )}

          {activity.description && (
            <p className="text-body text-sm leading-relaxed">{activity.description}</p>
          )}

          <div className="flex gap-3">
            {activity.price && (
              <div className="bg-elevated rounded-lg p-3 flex-1">
                <p className="text-xs text-secondary flex items-center gap-1 mb-1">
                  <DollarSign size={12} /> Valor
                </p>
                <p className="text-primary font-medium text-sm">{activity.price}</p>
              </div>
            )}
            <div className="bg-elevated rounded-lg p-3 flex-1">
              <p className="text-xs text-secondary mb-1">Status</p>
              <p className={`font-medium text-sm ${activity.purchased ? 'text-green-400' : 'text-red-400'}`}>
                {activity.purchased ? 'Comprado' : 'Pendente'}
              </p>
            </div>
          </div>

          {activity.transport && (
            <p className="text-body text-sm flex items-center gap-2">
              <Navigation size={14} className="text-muted" /> {activity.transport}
            </p>
          )}

          {activity.openingHours && (
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">Horários</p>
              <p className="text-body text-sm whitespace-pre-wrap">{activity.openingHours}</p>
            </div>
          )}

          {activity.mapLink && (
            <a
              href={activity.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm"
            >
              <MapPin size={14} /> Abrir no Google Maps <ExternalLink size={12} />
            </a>
          )}

          {activity.photoUrl && (
            <img
              src={activity.photoUrl}
              alt={activity.title}
              className="w-full rounded-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {activity.curiosity && (
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Info size={12} /> Curiosidades
              </p>
              <p className="text-body text-sm leading-relaxed whitespace-pre-wrap">{activity.curiosity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
