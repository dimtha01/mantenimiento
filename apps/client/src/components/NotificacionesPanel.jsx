// NotificacionesPanel.jsx
import { useEffect, useRef } from 'react';

const TIPO_CONFIG = {
  umbral: { icon: 'H', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Aviso Previo' },
  correctivo: { icon: 'F', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Correctivo' },
  certificado: { icon: 'C', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Certificado' },
  predictivo: { icon: 'P', bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', label: 'Predictivo' },
  ot_cerrada: { icon: 'R', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completado' },
};

const FILTER_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'umbral', label: 'Aviso Previo' },
  { key: 'correctivo', label: 'Fallas' },
  { key: 'predictivo', label: 'Predictivo' },
];

import { useState } from 'react';

export const NotificacionesPanel = ({ notifs, onClose, onMarcarLeidas, onClickNotif }) => {
  const ref = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const noLeidas = notifs.filter((n) => !n.leida).length;
  const filtered = activeFilter === 'all' ? notifs : notifs.filter((n) => n.tipo === activeFilter);

  return (
    <div
      ref={ref}
      className="absolute top-12 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Notificaciones</h3>
            {noLeidas > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {noLeidas}
              </span>
            )}
          </div>
          <button
            onClick={onMarcarLeidas}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Marcar todas leídas
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3">
          {FILTER_TABS.map((f) => {
            const count = f.key === 'all' ? notifs.length : notifs.filter((n) => n.tipo === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${activeFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {f.label}
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">Sin notificaciones</p>
          </div>
        )}
        {filtered.map((n) => {
          const cfg = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG.umbral;
          return (
            <div
              key={n.id}
              onClick={() => onClickNotif(n)}
              className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 relative ${!n.leida ? 'bg-blue-50/40' : ''}`}
            >
              {/* Icono tipo */}
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center text-base flex-shrink-0 mt-0.5`}>
                {cfg.icon}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{n.titulo}</p>
                  <p className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">{n.tiempo}</p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.descripcion}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Dot no leída */}
              {!n.leida && (
                <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <button className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors py-1">
          Ver historial completo →
        </button>
      </div>
    </div>
  );
};
