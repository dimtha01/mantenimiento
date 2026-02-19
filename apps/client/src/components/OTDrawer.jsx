// OTDrawer.jsx
// Modal de detalle de una OT — inspirado en el estilo task/CRM detail
// de las referencias (panel derecho con metadata + actividad/comentarios)
import { useState, useEffect } from 'react';

const OT_TIPO = {
  Preventivo: { pill: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
  Correctivo: { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Predictivo: { pill: 'bg-cyan-100 text-cyan-700',   dot: 'bg-cyan-500'  },
};

const PRIORIDAD = {
  'Crítica': { color: 'bg-red-100 text-red-700',       dot: '🔴' },
  'Alta':    { color: 'bg-orange-100 text-orange-700', dot: '🟠' },
  'Media':   { color: 'bg-yellow-100 text-yellow-700', dot: '🟡' },
  'Baja':    { color: 'bg-slate-100 text-slate-600',   dot: '⚪' },
};

// Mock actividad
const ACTIVIDAD_MOCK = [
  { id: 1, usuario: 'Carlos Ruiz',  tiempo: 'Hace 2h',  tipo: 'checklist', texto: 'Marcó "Drenar aceite usado del cárter" como completado.' },
  { id: 2, usuario: 'Ana Belén',    tiempo: 'Hace 4h',  tipo: 'estado',    texto: 'Cambió estado de Pendiente → Abierta.' },
  { id: 3, usuario: 'Jorge Soto',   tiempo: 'Ayer',     tipo: 'comentario',texto: 'Revisar si el filtro LF9009 está en stock antes de continuar.' },
  { id: 4, usuario: 'Sistema',      tiempo: 'Ayer',     tipo: 'alerta',    texto: 'OT generada automáticamente: umbral 500h alcanzado (actual: 480h).' },
];

const ACTIVIDAD_ICON = {
  checklist: { bg: 'bg-emerald-100', icon: <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> },
  estado:    { bg: 'bg-blue-100',    icon: <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
  comentario:{ bg: 'bg-slate-100',   icon: <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  alerta:    { bg: 'bg-amber-100',   icon: <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
};

export const OTDrawer = ({ ot, onClose }) => {
  const [visible, setVisible]     = useState(false);
  const [activeTab, setActiveTab] = useState('actividad');
  const [comentario, setComentario] = useState('');
  const [actividad, setActividad] = useState(ACTIVIDAD_MOCK);

  useEffect(() => {
    if (ot) setTimeout(() => setVisible(true), 10);
  }, [ot]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  const handleEnviarComentario = () => {
    if (!comentario.trim()) return;
    setActividad((prev) => [{ id: Date.now(), usuario: 'Tú', tiempo: 'Ahora', tipo: 'comentario', texto: comentario }, ...prev]);
    setComentario('');
  };

  if (!ot) return null;

  const tipoCfg = OT_TIPO[ot.tipo] ?? OT_TIPO.Preventivo;
  const priorCfg = PRIORIDAD[ot.prioridad] ?? PRIORIDAD['Media'];

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 h-full w-[760px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mantenimiento</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span>Órdenes de Trabajo</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="font-bold text-slate-700">{ot.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </button>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* BODY: layout 2 columnas */}
        <div className="flex-1 overflow-hidden flex">

          {/* Columna principal */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {/* Título + badges */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${tipoCfg.pill}`}>{ot.tipo}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ot.estado === 'Abierta' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{ot.estado}</span>
                {ot.prioridad && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${priorCfg.color}`}>{priorCfg.dot} {ot.prioridad}</span>}
                <span className="text-xs text-slate-400 font-mono ml-auto">{ot.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{ot.descripcion || 'Nueva Orden de Trabajo'}</h2>
            </div>

            {/* Tabs: Actividad / Checklist / Archivos */}
            <div className="flex gap-1 border-b border-slate-100 mb-5">
              {[
                { id: 'actividad', label: 'Actividad', count: actividad.length },
                { id: 'checklist', label: 'Checklist', count: ot.checklist?.length ?? 0 },
                { id: 'archivos',  label: 'Archivos',  count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Actividad */}
            {activeTab === 'actividad' && (
              <div>
                {/* Campo comentario */}
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">T</div>
                  <div className="flex-1">
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleEnviarComentario())}
                      placeholder="Agrega un comentario... (Enter para enviar)"
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                    />
                    {comentario && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleEnviarComentario} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">Enviar</button>
                        <button onClick={() => setComentario('')} className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline de actividad */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                  <div className="space-y-4">
                    {actividad.map((a) => {
                      const cfg = ACTIVIDAD_ICON[a.tipo] ?? ACTIVIDAD_ICON.comentario;
                      return (
                        <div key={a.id} className="flex gap-3 relative">
                          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-800">{a.usuario}</span>
                              <span className="text-[11px] text-slate-400">{a.tiempo}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{a.texto}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Checklist */}
            {activeTab === 'checklist' && (
              <div>
                {ot.checklist?.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {ot.checklist.filter((c) => c.done).length}/{ot.checklist.length} tareas completadas
                      </p>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(ot.checklist.filter((c) => c.done).length / ot.checklist.length) * 100}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {ot.checklist.map((item) => (
                        <div key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border ${item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                            {item.done && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <p className={`text-sm flex-1 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.texto}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">Sin pasos definidos en esta OT</p>
                )}
              </div>
            )}

            {/* Tab: Archivos */}
            {activeTab === 'archivos' && (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p className="text-sm text-slate-400 font-medium">Adjunta evidencias, fotos o reportes</p>
                <button className="mt-3 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">Subir archivo</button>
              </div>
            )}
          </div>

          {/* Columna lateral: metadata (estilo CRM/task detail) */}
          <div className="w-64 shrink-0 border-l border-slate-100 bg-slate-50/50 overflow-y-auto px-5 py-6 space-y-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información de la OT</p>

            {/* Estado */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Estado</p>
              <select className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                <option>Abierta</option>
                <option>En Proceso</option>
                <option>Esperando Repuesto</option>
                <option>Cerrada</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prioridad</p>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${priorCfg.color} border-current/20`}>
                <span className="text-sm">{priorCfg.dot}</span>
                <span className="text-sm font-semibold">{ot.prioridad}</span>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tipo</p>
              <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-semibold ${tipoCfg.pill}`}>{ot.tipo}</span>
            </div>

            {/* Técnico */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Técnico Asignado</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {ot.tecnico?.charAt(0) ?? '?'}
                </div>
                <span className="text-sm font-semibold text-slate-700">{ot.tecnico || 'Sin asignar'}</span>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fecha</p>
              <p className="text-sm font-semibold text-slate-700">{ot.fecha}</p>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Costos</p>

              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Estimado</p>
                <p className="text-lg font-black text-slate-900">${ot.costoEstimado ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Real</p>
                <p className={`text-lg font-black ${ot.costoReal != null ? 'text-slate-900' : 'text-slate-300'}`}>
                  {ot.costoReal != null ? `$${ot.costoReal}` : 'En proceso...'}
                </p>
              </div>
              {ot.costoReal != null && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${ot.costoReal > ot.costoEstimado ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {ot.costoReal > ot.costoEstimado ? '↑' : '↓'}
                  {ot.costoReal > ot.costoEstimado
                    ? `$${ot.costoReal - ot.costoEstimado} sobre estimado`
                    : `$${ot.costoEstimado - ot.costoReal} bajo estimado`}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="pt-2 space-y-2">
              <button className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Cerrar OT
              </button>
              <button className="w-full py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                Imprimir Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
