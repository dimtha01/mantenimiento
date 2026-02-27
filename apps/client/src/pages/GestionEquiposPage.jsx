import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { EquipoDrawerModal } from '../components/EquipoDrawerModal';

// ─── Helpers ──────────────────────────────────────────────────
const otBadgeClass = (nombre) => ({
  PREVENTIVO: 'bg-blue-100 text-blue-700',
  CORRECTIVO: 'bg-amber-100 text-amber-700',
  PREDICTIVO: 'bg-cyan-100 text-cyan-700',
}[nombre] ?? 'bg-slate-100 text-slate-600');

const certVencimientoBadge = (vencimiento) => {
  if (!vencimiento) return { label: 'Sin fecha', cls: 'bg-slate-100 text-slate-500' };
  const dias = Math.ceil((new Date(vencimiento) - new Date()) / 86400000);
  if (dias < 0) return { label: 'Vencido', cls: 'bg-red-100 text-red-700' };
  if (dias <= 30) return { label: `${dias}d`, cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Vigente', cls: 'bg-emerald-100 text-emerald-700' };
};

// Removed horasAlertaBadge

const TAB_LABELS = [
  { label: 'Todos', color: 'bg-slate-800 text-white' },
  { label: 'Operativos', color: 'bg-emerald-100 text-emerald-700' },
  { label: 'No Operativos', color: 'bg-red-100 text-red-700' },
  { label: 'Alerta Horas', color: 'bg-amber-100 text-amber-700' },
  { label: 'Con Fallas', color: 'bg-orange-100 text-orange-700' },
];

const EQUIPO_VACIO = {
  id: null, codigo: '', modelo: '', serial: '', factura: false,
  marcaId: '', tipoId: '', unidadNegocioId: '', propietarioId: '', parametroId: '',
  horasMantenimientoPreventivo: '',
  marca: null, tipo: null, ubicacion: null, propietario: null, parametro: null,
  mantenimientos: [], planes: [], certificaciones: [], imagenes: [], fallas: [],
};

const PAGE_SIZE = 10;

// ─── Paginador compacto ────────────────────────────────────────
const Pagination = ({ page, totalPages, total, onPrev, onNext, onGoto, pageSize }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  if (left > 1) pages.push(1);
  if (left > 2) pages.push('…');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('…');
  if (right < totalPages) pages.push(totalPages);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/60">
      <p className="text-xs text-slate-400">
        Mostrando <span className="font-semibold text-slate-600">{from}–{to}</span> de{' '}
        <span className="font-semibold text-slate-600">{total}</span> equipos
      </p>

      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={onPrev} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Páginas */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onGoto(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${p === page
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'
                }`}
            >
              {p}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          onClick={onNext} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
export const GestionEquiposPage = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kpis, setKpis] = useState({ total: 0, totalOperativos: 0, totalNoOperativos: 0, equiposConAlertaHoras: 0, porTipoMantenimiento: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [alertasHoras, setAlertasHoras] = useState([]);

  // ── Fetch alertas de horas ───────────────────────────────
  const fetchAlertasHoras = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/alertas-horas');
      const json = await res.json();
      if (json.ok) setAlertasHoras(json.data ?? []);
    } catch (e) {
      console.error('Error fetching alertas:', e);
    }
  }, []);

  // ── Fetch paginado desde el servidor ──────────────────────
  const fetchEquipos = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * PAGE_SIZE;
      const params = new URLSearchParams({ take: String(PAGE_SIZE), skip: String(skip) });
      if (search) params.set('q', search);

      const res = await fetch(`/api/equipos?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setEquipos(json.data ?? []);
      setTotal(json.kpis?.total ?? 0);
      setKpis(json.kpis ?? { total: 0, totalOperativos: 0, totalNoOperativos: 0, equiposConAlertaHoras: 0, porTipoMantenimiento: [] });
    } catch (e) {
      setError(e.message);
      setKpis({ total: 0, totalOperativos: 0, totalNoOperativos: 0, equiposConAlertaHoras: 0, porTipoMantenimiento: [] });
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Resetear a pag 1 cuando cambia búsqueda o tab
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  // Cargar cuando cambia la página
  useEffect(() => {
    const t = setTimeout(() => { fetchEquipos(page); fetchAlertasHoras(); }, 300);
    return () => clearTimeout(t);
  }, [fetchEquipos, fetchAlertasHoras, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Filtro por tab (client-side sobre la página actual) ───
  const filtered = equipos.filter((e) => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Operativos') return e.estadoOperativo === 'OPERATIVO';
    if (activeTab === 'No Operativos') return e.estadoOperativo === 'NO_OPERATIVO';
    if (activeTab === 'Alerta Horas') return horasAlertaBadge(e) !== null;
    if (activeTab === 'Con Fallas') return (e.fallas?.length ?? 0) > 0;
    return true;
  });

  // Conteos dinámicos 
  const tabCounts = {
    'Todos': total,
    'Operativos': kpis.totalOperativos ?? equipos.filter(e => e.estadoOperativo === 'OPERATIVO').length,
    'No Operativos': kpis.totalNoOperativos ?? equipos.filter(e => e.estadoOperativo === 'NO_OPERATIVO').length,
    'Alerta Horas': kpis.equiposConAlertaHoras ?? equipos.filter(e => horasAlertaBadge(e) !== null).length,
    'Con Fallas': equipos.filter(e => (e.fallas?.length ?? 0) > 0).length,
  };

  const kpiCards = [
    { title: 'Total Equipos', value: kpis.total, bg: 'bg-slate-100', color: 'text-slate-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { title: 'Operativos', value: kpis.totalOperativos ?? 0, bg: 'bg-emerald-50', color: 'text-emerald-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: 'No Operativos', value: kpis.totalNoOperativos ?? 0, bg: 'bg-red-50', color: 'text-red-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: 'Alertas Horas', value: kpis.equiposConAlertaHoras ?? 0, bg: 'bg-amber-50', color: 'text-amber-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  // ── Fetch detalle al abrir modal ──────────────────────────
  const handleSelectEquipo = async (eq) => {
    try {
      const res = await fetch(`/api/equipos/${eq.id}`);
      const json = await res.json();
      if (json.ok) setSelectedEquipo(json.data);
    } catch {
      setSelectedEquipo(eq);
    }
  };

  // ── Guardar (create / update) ─────────────────────────────
  const handleSaveEquipo = async (form, refreshedEquipo) => {
    if (refreshedEquipo) {
      setSelectedEquipo(refreshedEquipo);
      setEquipos((prev) => prev.map((e) => (e.id === refreshedEquipo.id ? { ...e, ...refreshedEquipo } : e)));
      return;
    }
    try {
      const isNew = !form.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/equipos' : `/api/equipos/${form.id}`;
      const body = {
        codigo: form.codigo, modelo: form.modelo, serial: form.serial,
        factura: form.factura ?? false,
        marcaId: Number(form.marcaId),
        tipoId: Number(form.tipoId),
        unidadNegocioId: Number(form.unidadNegocioId),
        propietarioId: Number(form.propietarioId),
        parametroId: Number(form.parametroId),
        ...(form.horasMantenimientoPreventivo !== undefined && form.horasMantenimientoPreventivo !== '' ? { horasMantenimientoPreventivo: Number(form.horasMantenimientoPreventivo) } : {}),
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setSelectedEquipo(null);
      fetchEquipos(page);
    } catch (e) {
      console.error('Error guardando equipo:', e.message);
      throw e;
    }
  };

  // Generar notificaciones de alertas de horas
  const horasNotificaciones = alertasHoras.map((a, i) => ({
    id: `alerta-${a.id}-${i}`,
    leida: false,
    titulo: a.nivelAlerta === 'critico' ? `${a.codigo}: ${a.descripcionTarea} - Requerido` : `${a.codigo}: ${a.descripcionTarea} - Próximo`,
    descripcion: a.nivelAlerta === 'critico'
      ? `Tarea "${a.descripcionTarea}" vencida. Cada ${a.frecuenciaValor}h. Requiere ejecución inmediata.`
      : `Quedan ${a.horasRestantes}h para "${a.descripcionTarea}". Frecuencia: cada ${a.frecuenciaValor}h.`,
    tiempo: a.fechaUltimaEjecucion ? new Date(a.fechaUltimaEjecucion).toLocaleDateString('es-VE') : 'Sin registro',
    color: a.nivelAlerta === 'critico' ? 'red' : 'amber',
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Gestión de Equipos"
          subtitle="Monitorea y administra todos los activos del sistema"
          showSearch={false}
          notifications={horasNotificaciones}
          onNotifClick={(n) => {
            const alerta = alertasHoras.find(a => n.id.includes(`alerta-${a.id}`));
            if (alerta) handleSelectEquipo(alerta);
          }}
          onNotifMarkAll={() => { }}
        />

        <div className="flex-1 overflow-hidden flex gap-0">

          {/* ── IZQUIERDA: Tabla ──────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Alerta global de horas */}
            {alertasHoras.length > 0 && (
              <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      {alertasHoras.filter(a => a.nivelAlerta === 'critico').length > 0
                        ? `${alertasHoras.filter(a => a.nivelAlerta === 'critico').length} tarea(s) de mantenimiento vencida(s)`
                        : `${alertasHoras.length} tarea(s) de mantenimiento próximas`}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">Basado en las horas de uso registradas</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {alertasHoras.slice(0, 5).map(a => (
                    <button
                      key={a.planId}
                      onClick={() => handleSelectEquipo(a)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${a.nivelAlerta === 'critico'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                    >
                      <span>{a.codigo}</span>
                      <span className="truncate max-w-[120px]">{a.descripcionTarea}</span>
                      <span className="font-mono">{a.horasRestantes}h</span>
                    </button>
                  ))}
                  {alertasHoras.length > 5 && (
                    <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-amber-600">+{alertasHoras.length - 5} más</span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

              {/* Top bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Inventario de Equipos</h2>
                <div className="relative flex-1 max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text" placeholder="Buscar código, serie, marca..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEquipo({ ...EQUIPO_VACIO })}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Agregar Equipo
                  </button>
                  <button onClick={() => fetchEquipos(page)} className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Tabs de estado */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                {TAB_LABELS.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeTab === tab.label ? tab.color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.label ? 'bg-white/30' : 'bg-white text-slate-500'}`}>
                      {tabCounts[tab.label] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Cabecera de tabla */}
              <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Equipo</div>
                <div className="col-span-2">Marca / Tipo</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Horas Uso</div>
                <div className="col-span-2">Último Mant.</div>
                <div className="col-span-1">Fallas</div>
              </div>

              {/* Loading / Error */}
              {loading && (
                <div className="py-16 text-center text-sm text-slate-400 animate-pulse">Cargando equipos...</div>
              )}
              {!loading && error && (
                <div className="py-16 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={() => fetchEquipos(page)} className="mt-2 text-xs text-blue-500 underline">Reintentar</button>
                </div>
              )}

              {/* Filas */}
              {!loading && !error && (
                <div className="divide-y divide-slate-50 flex-1">
                  {filtered.map((eq) => {
                    const ultimoMant = eq.mantenimientos?.[0] ?? null;
                    const alertaEquipo = alertasHoras.find(a => a.equipoId === eq.id);
                    const fallasAbiertas = eq.fallas?.filter(f => f.estado !== 'RESUELTA')?.length ?? 0;
                    const isNoOperativo = eq.estadoOperativo === 'NO_OPERATIVO';

                    return (
                      <div
                        key={eq.id}
                        className={`grid grid-cols-12 px-6 py-3.5 hover:bg-blue-50/40 transition-colors items-center group cursor-pointer
                          ${isNoOperativo ? 'bg-red-50/30' : ''}`}
                        onClick={() => handleSelectEquipo(eq)}
                      >
                        {/* Equipo */}
                        <div className="col-span-3">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 truncate">{eq.codigo}</p>
                          <p className="text-xs text-slate-400 font-mono">{eq.serial}</p>
                          <p className="text-xs text-slate-400 font-mono">Mod: {eq.modelo}</p>
                        </div>

                        {/* Marca / Tipo */}
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-slate-700">{eq.marca?.nombre ?? '—'}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {eq.tipo?.nombre ?? '—'}
                          </span>
                        </div>

                        {/* Estado Operativo */}
                        <div className="col-span-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${isNoOperativo ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isNoOperativo ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {isNoOperativo ? 'No Operativo' : 'Operativo'}
                          </span>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{eq.ubicacion?.nombre ?? '—'}</p>
                        </div>

                        {/* Horas de Uso */}
                        <div className="col-span-2 flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-700 font-mono">
                              {eq.horasAcumuladas ?? 0}h
                            </span>
                            <span className="text-[10px] text-slate-400">totales</span>
                          </div>
                          {alertaEquipo && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${alertaEquipo.nivelAlerta === 'critico' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {alertaEquipo.nivelAlerta === 'critico' ? 'VENCIDO' : 'ALERTA'}
                            </span>
                          )}
                        </div>

                        {/* Último mantenimiento */}
                        <div className="col-span-2">
                          {ultimoMant ? (
                            <>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${otBadgeClass(ultimoMant.tipo?.nombre)}`}>
                                {ultimoMant.tipo?.nombre}
                              </span>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(ultimoMant.fechaServicio).toLocaleDateString('es-VE')}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-300 italic">Sin registros</p>
                          )}
                        </div>

                        {/* Fallas */}
                        <div className="col-span-1">
                          {fallasAbiertas > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {fallasAbiertas} abierta{fallasAbiertas > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                              0
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="py-16 text-center">
                      <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
                      </svg>
                      <p className="text-sm text-slate-400 font-medium">No se encontraron equipos</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Paginación ── */}
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                onGoto={(p) => setPage(p)}
              />
            </div>
          </div>

          {/* ── DERECHA: KPIs + Accesos ───────────────────── */}
          <div className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Resumen</h3>
              <div className="space-y-3">
                {kpiCards.map((k) => (
                  <div key={k.title} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <div className={`w-10 h-10 ${k.bg} ${k.color} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
                      {k.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate">{k.title}</p>
                      <span className="text-xl font-bold text-slate-900">{k.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Indicador de página */}
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">Página</p>
              <p className="text-2xl font-black text-slate-800">{page}<span className="text-sm font-medium text-slate-400"> / {totalPages}</span></p>
              <p className="text-[11px] text-slate-400 mt-0.5">{PAGE_SIZE} equipos por página</p>
            </div>

            <button
              onClick={() => setSelectedEquipo({ ...EQUIPO_VACIO })}
              className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Agregar Nuevo Equipo
            </button>
          </div>
        </div>
      </main>

      <EquipoDrawerModal
        equipo={selectedEquipo}
        onClose={() => setSelectedEquipo(null)}
        onSave={handleSaveEquipo}
      />
    </div>
  );
};
