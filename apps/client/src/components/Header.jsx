// components/Header.jsx
// Props:
//   title, subtitle
//   showSearch, searchValue, onSearchChange
//   actionButton
//   notifications        → array de { id, leida, titulo, descripcion, tiempo, color }
//   onNotifClick(notif)  → callback al hacer clic en una notificación
//   onNotifMarkAll()     → marcar todas como leídas

import { useState } from 'react';

const NOTIF_COLOR = {
  amber:   { bg: 'bg-amber-50',   dot: 'bg-amber-400',   text: 'text-amber-700'   },
  red:     { bg: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-700'     },
  orange:  { bg: 'bg-orange-50',  dot: 'bg-orange-400',  text: 'text-orange-700'  },
  cyan:    { bg: 'bg-cyan-50',    dot: 'bg-cyan-400',    text: 'text-cyan-700'    },
  emerald: { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  slate:   { bg: 'bg-slate-50',   dot: 'bg-slate-400',   text: 'text-slate-600'   },
};

export const Header = ({
  title,
  subtitle,
  showSearch    = false,
  searchValue,
  onSearchChange,
  actionButton,
  notifications    = [],
  onNotifClick,
  onNotifMarkAll,
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const noLeidas = notifications.filter((n) => !n.leida).length;

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 shrink-0 relative z-20">
      <div className="flex items-center justify-between">

        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">

          {/* Buscador opcional */}
          {showSearch && (
            <div className="relative group">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Buscar..."
                type="text"
                value={searchValue}
                onChange={onSearchChange}
              />
            </div>
          )}

          {/* ── Campana de notificaciones ── */}
          <div className="relative">
            <button
              onClick={() => setShowPanel((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {noLeidas > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {noLeidas}
                </span>
              )}
            </button>

            {/* Panel desplegable */}
            {showPanel && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setShowPanel(false)} />

                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                  {/* Header panel */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Notificaciones</h3>
                      {noLeidas > 0 && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          {noLeidas} nuevas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {noLeidas > 0 && onNotifMarkAll && (
                        <button
                          onClick={() => { onNotifMarkAll(); }}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Marcar todas
                        </button>
                      )}
                      <button
                        onClick={() => setShowPanel(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Lista */}
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <svg className="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm text-slate-400">Sin notificaciones</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const cfg = NOTIF_COLOR[n.color] ?? NOTIF_COLOR.slate;
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              onNotifClick?.(n);
                              setShowPanel(false);
                            }}
                            className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.leida ? cfg.bg : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.leida ? cfg.dot : 'bg-slate-200'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className={`text-xs font-bold truncate ${!n.leida ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {n.titulo}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">{n.tiempo}</span>
                              </div>
                              <p className="text-xs text-slate-500 leading-snug">{n.descripcion}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                      <p className="text-xs text-slate-400 text-center">
                        {notifications.filter((n) => n.leida).length} de {notifications.length} leídas
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Avatar + usuario */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <img
              src="https://i.pravatar.cc/150?img=68"
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-slate-200"
            />
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-900">Mark Lee</p>
              <p className="text-xs text-slate-500">marklee@gmail.com</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {actionButton && actionButton}
        </div>
      </div>
    </header>
  );
};
