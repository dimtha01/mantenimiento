import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { EquipoDrawerModal } from '../components/EquipoDrawerModal';

// ─── Helpers de badge ────────────────────────────────────────
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

const TAB_LABELS = [
  { label: 'Todos', color: 'bg-slate-800 text-white' },
  { label: 'PREVENTIVO', color: 'bg-blue-100 text-blue-700' },
  { label: 'CORRECTIVO', color: 'bg-amber-100 text-amber-700' },
  { label: 'PREDICTIVO', color: 'bg-cyan-100 text-cyan-700' },
  { label: 'Sin OTs', color: 'bg-slate-100 text-slate-500' },
  { label: 'Con Certs', color: 'bg-emerald-100 text-emerald-700' },
];

const QUICK_LINKS = [
  { label: 'Fichas Técnicas', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Certificaciones', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { label: 'Órdenes de Trabajo', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Costos', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

// EQUIPO_VACIO usa los campos reales del modelo Prisma
const EQUIPO_VACIO = {
  id: null, codigo: '', modelo: '', serial: '', factura: false,
  marcaId: '', tipoId: '', unidadNegocioId: '', propietarioId: '', parametroId: '',
  // relaciones (para mostrar en modal)
  marca: null, tipo: null, ubicacion: null, propietario: null, parametro: null,
  mantenimientos: [], planes: [], certificaciones: [], imagenes: [],
};

// ─── Page ─────────────────────────────────────────────────────
export const GestionEquiposPage = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, porTipoMantenimiento: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);

  // ── Fetch lista (con último mantenimiento incluido)
  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ take: '200', withDetails: '1' });
      if (search) params.set('q', search);

      const res = await fetch(`/api/equipos?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setEquipos(json.data ?? []);
      // ✅ Fallback por si el controlador no devuelve kpis
      setKpis(json.kpis ?? { total: 0, porTipoMantenimiento: [] });
    } catch (e) {
      setError(e.message);
      // ✅ Resetea kpis en error para no dejar undefined
      setKpis({ total: 0, porTipoMantenimiento: [] });
    } finally {
      setLoading(false);
    }
  }, [search]);


  useEffect(() => {
    const t = setTimeout(fetchEquipos, 300);
    return () => clearTimeout(t);
  }, [fetchEquipos]);

  // ── Fetch detalle completo al abrir el modal
  const handleSelectEquipo = async (eq) => {
    try {
      const res = await fetch(`/api/equipos/${eq.id}`);
      const json = await res.json();
      if (json.ok) setSelectedEquipo(json.data);
    } catch {
      setSelectedEquipo(eq); // fallback con lo que tenemos
    }
  };

  // ── Filtro por tab (client-side)
  const filtered = equipos.filter((e) => {
    const ultimoMant = e.mantenimientos?.[0];
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Sin OTs') return !ultimoMant;
    if (activeTab === 'Con Certs') return e.certificaciones?.length > 0;
    return ultimoMant?.tipo?.nombre === activeTab;
  });

  // Counts dinámicos para los tabs
  const tabCounts = {
    'Todos': equipos.length,
    'PREVENTIVO': equipos.filter(e => e.mantenimientos?.[0]?.tipo?.nombre === 'PREVENTIVO').length,
    'CORRECTIVO': equipos.filter(e => e.mantenimientos?.[0]?.tipo?.nombre === 'CORRECTIVO').length,
    'PREDICTIVO': equipos.filter(e => e.mantenimientos?.[0]?.tipo?.nombre === 'PREDICTIVO').length,
    'Sin OTs': equipos.filter(e => !e.mantenimientos?.length).length,
    'Con Certs': equipos.filter(e => e.certificaciones?.length > 0).length,
  };

  // KPI cards reales
  const kpiCards = [
    { title: 'Total Equipos', value: kpis.total, bg: 'bg-slate-100', color: 'text-slate-600' },
    ...kpis.porTipoMantenimiento.map((k) => ({
      title: `OTs ${k.tipo}`,
      value: k.count,
      bg: k.tipo === 'PREVENTIVO' ? 'bg-blue-50' : k.tipo === 'CORRECTIVO' ? 'bg-amber-50' : 'bg-cyan-50',
      color: k.tipo === 'PREVENTIVO' ? 'text-blue-600' : k.tipo === 'CORRECTIVO' ? 'text-amber-600' : 'text-cyan-600',
    })),
  ];

  // ── Guardar (create o update) ── o actualizar selectedEquipo sin cerrar
  const handleSaveEquipo = async (form, refreshedEquipo) => {
    // Si el modal nos pasa un equipo ya refrescado (ej. tras agregar cert), solo actualizar state
    if (refreshedEquipo) {
      setSelectedEquipo(refreshedEquipo);
      setEquipos((prev) =>
        prev.map((e) => (e.id === refreshedEquipo.id ? { ...e, ...refreshedEquipo } : e))
      );
      return;
    }

    try {
      const isNew = !form.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/equipos' : `/api/equipos/${form.id}`;

      // Solo enviamos campos del modelo Prisma
      const body = {
        codigo: form.codigo,
        modelo: form.modelo,
        serial: form.serial,
        factura: form.factura ?? false,
        marcaId: Number(form.marcaId),
        tipoId: Number(form.tipoId),
        unidadNegocioId: Number(form.unidadNegocioId),
        propietarioId: Number(form.propietarioId),
        parametroId: Number(form.parametroId),
      };

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setSelectedEquipo(null);
      fetchEquipos();
    } catch (e) {
      console.error('Error guardando equipo:', e.message);
      throw e; // re-throw para que el modal muestre el error
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Gestión de Equipos"
          subtitle="Monitorea y administra todos los activos del sistema"
          showSearch={false}
          notifications={[]}
        />

        <div className="flex-1 overflow-hidden flex gap-0">

          {/* ── IZQUIERDA: Tabla ─────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

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
                  <button onClick={fetchEquipos} className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Status tabs */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                {TAB_LABELS.map((tab) => (
                  <button
                    key={tab.label} onClick={() => setActiveTab(tab.label)}
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

              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Equipo</div>
                <div className="col-span-2">Marca / Tipo</div>
                <div className="col-span-2">Propietario / Ubic.</div>
                <div className="col-span-2">Último Mant.</div>
                <div className="col-span-2">Certificación</div>
                <div className="col-span-1">Factura</div>
              </div>

              {/* Loading / Error */}
              {loading && <div className="py-16 text-center text-sm text-slate-400 animate-pulse">Cargando equipos...</div>}
              {!loading && error && (
                <div className="py-16 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={fetchEquipos} className="mt-2 text-xs text-blue-500 underline">Reintentar</button>
                </div>
              )}

              {/* Rows */}
              {!loading && !error && (
                <div className="divide-y divide-slate-50">
                  {filtered.map((eq) => {
                    const ultimoMant = eq.mantenimientos?.[0] ?? null;
                    const certMasCercana = eq.certificaciones?.sort(
                      (a, b) => new Date(a.vencimiento) - new Date(b.vencimiento)
                    )[0] ?? null;
                    const certBadge = certVencimientoBadge(certMasCercana?.vencimiento);

                    return (
                      <div
                        key={eq.id}
                        className="grid grid-cols-12 px-6 py-3.5 hover:bg-blue-50/40 transition-colors items-center group cursor-pointer"
                        onClick={() => handleSelectEquipo(eq)}
                      >
                        {/* Equipo: codigo + serial */}
                        <div className="col-span-3">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 truncate">{eq.codigo}</p>
                          <p className="text-xs text-slate-400 font-mono">{eq.serial}</p>
                          <p className="text-xs text-slate-400 font-mono">Modelo: {eq.modelo}</p>
                        </div>

                        {/* Marca / Tipo */}
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-slate-700">{eq.marca?.nombre ?? '—'}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {eq.tipo?.nombre ?? '—'}
                          </span>
                        </div>

                        {/* Propietario / Ubicación */}
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-slate-700 truncate">{eq.propietario?.nombre ?? '—'}</p>
                          <p className="text-xs text-slate-400 truncate">{eq.ubicacion?.nombre ?? '—'}</p>
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
                              <p className="text-xs text-slate-400 font-mono">
                                {ultimoMant.lecturaActual.toLocaleString()} {eq.parametro?.unidad}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-300 italic">Sin registros</p>
                          )}
                        </div>

                        {/* Certificación más próxima a vencer */}
                        <div className="col-span-2">
                          {certMasCercana ? (
                            <>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${certBadge.cls}`}>
                                {certBadge.label}
                              </span>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(certMasCercana.vencimiento).toLocaleDateString('es-VE')}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-300 italic">Sin certs.</p>
                          )}
                        </div>

                        {/* Factura */}
                        <div className="col-span-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${eq.factura ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {eq.factura ? 'Sí' : 'No'}
                          </span>
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
            </div>
          </div>

          {/* ── DERECHA: KPIs + Accesos ──────────────────── */}
          <div className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Resumen</h3>
              <div className="space-y-3">
                {kpiCards.map((k) => (
                  <div key={k.title} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <div className={`w-10 h-10 ${k.bg} ${k.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                      </svg>
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

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Accesos Rápidos</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((link) => (
                  <button key={link.label} className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-all group">
                    <div className="text-slate-400 group-hover:text-slate-700 transition-colors">{link.icon}</div>
                    <span className="text-xs font-semibold text-center leading-tight">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

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
