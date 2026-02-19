// GestionEquiposPage.jsx
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { EquipoDrawerModal } from '../components/EquipoDrawerModal';
import { EQUIPOS_CATALOG } from '../store/equiposStore';

// ─── Tabs ─────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'Todos',             count: 230, color: 'bg-slate-800 text-white'         },
  { label: 'Activos',           count: 148, color: 'bg-emerald-100 text-emerald-700' },
  { label: 'En Revisión',       count: 22,  color: 'bg-violet-100 text-violet-700'   },
  { label: 'Fuera de Servicio', count: 10,  color: 'bg-red-100 text-red-700'         },
  { label: 'OT Preventivo',     count: 42,  color: 'bg-blue-100 text-blue-700'       },
  { label: 'OT Correctivo',     count: 18,  color: 'bg-amber-100 text-amber-700'     },
  { label: 'OT Predictivo',     count: 12,  color: 'bg-cyan-100 text-cyan-700'       },
];

const STATS = [
  {
    title: 'Total Equipos', value: '230', change: '+12%', up: true, sub: 'vs. mes anterior',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" /></svg>,
    bg: 'bg-slate-100', color: 'text-slate-600',
  },
  {
    title: 'OTs Preventivas', value: '42', change: '+8%', up: true, sub: 'órdenes activas',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    bg: 'bg-blue-50', color: 'text-blue-600',
  },
  {
    title: 'OTs Correctivas', value: '18', change: '-3%', up: false, sub: 'en proceso',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    bg: 'bg-amber-50', color: 'text-amber-600',
  },
  {
    title: 'Alertas Predictivas', value: '12', change: '+5%', up: true, sub: 'generadas hoy',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    bg: 'bg-cyan-50', color: 'text-cyan-600',
  },
];

const QUICK_LINKS = [
  { label: 'Fichas Técnicas',     icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Certificaciones',     icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { label: 'Órdenes de Trabajo',  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Costos',              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const EQUIPO_VACIO = {
  id: '', name: '', serial: '', brand: '', model: '', category: '',
  location: '', estadoOperativo: 'Activo', year: '', power: '', weight: '',
  fuelCapacity: '', acquisitionDate: '', notes: '',
  lecturaActual: '', lecturaUnidad: 'h',
  otActiva: null, ultimaOT: null,
  lecturas: { valor: 0, unidad: 'h', umbralProximo: null },
};

// ─── Helpers ──────────────────────────────────────────────────
const estadoOperativoBadge = (estado) => ({
  'Activo':           { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Activo'            },
  'En Revisión':      { dot: 'bg-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50',  label: 'En Revisión'       },
  'Fuera de Servicio':{ dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',     label: 'Fuera de Servicio' },
}[estado] ?? { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', label: estado });

const otActivaBadge = (tipo) => ({
  'Preventivo': 'bg-blue-100 text-blue-700',
  'Correctivo': 'bg-amber-100 text-amber-700',
  'Predictivo': 'bg-cyan-100 text-cyan-700',
}[tipo] ?? 'bg-slate-100 text-slate-600');

const getAlertaUmbral = (lecturas) => {
  if (!lecturas?.umbralProximo) return null;
  const r = lecturas.umbralProximo - lecturas.valor;
  if (r <= 0)   return { level: 'vencido', label: `${Math.abs(r)}${lecturas.unidad} vencido`  };
  if (r <= 50)  return { level: 'urgente', label: `${r}${lecturas.unidad} restantes`           };
  if (r <= 100) return { level: 'proximo', label: `${r}${lecturas.unidad} restantes`           };
  return null;
};

const alertaUmbralStyle = (level) => ({
  vencido: 'bg-red-100 text-red-700 border border-red-200',
  urgente: 'bg-amber-100 text-amber-700 border border-amber-200',
  proximo: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
}[level] ?? '');

// ─── Notificaciones globales de esta página ───────────────────
const NOTIFICACIONES = [
  { id: 'N-001', tipo: 'umbral',      leida: false, tiempo: 'Hace 5 min',  titulo: 'Mantenimiento próximo',  descripcion: 'Excavadora EQ-001: faltan 20h para umbral de 500h.', color: 'amber'   },
  { id: 'N-002', tipo: 'correctivo',  leida: false, tiempo: 'Hace 18 min', titulo: 'Falla crítica detectada', descripcion: 'Generador EQ-002: falla en alternador..',            color: 'red'     },
  { id: 'N-003', tipo: 'umbral',      leida: false, tiempo: 'Hace 1 h',    titulo: 'Mantenimiento próximo',  descripcion: 'Compresor EQ-003: faltan 50h para 1000h.',           color: 'amber'   },
  { id: 'N-004', tipo: 'certificado', leida: true,  tiempo: 'Hace 3 h',    titulo: 'Certificado por vencer', descripcion: 'Bomba EQ-006: Certificado vence en 2 días.',         color: 'orange'  },
  { id: 'N-005', tipo: 'predictivo',  leida: true,  tiempo: 'Hace 5 h',    titulo: 'Alerta predictiva',      descripcion: 'Grúa EQ-005: vibración anómala en sensor 3.',        color: 'cyan'    },
];

export const GestionEquiposPage = () => {
  const [activeTab,       setActiveTab]       = useState('Todos');
  const [search,          setSearch]          = useState('');
  const [selectedEquipo,  setSelectedEquipo]  = useState(null);
  const [notifs,          setNotifs]          = useState(NOTIFICACIONES);

  const filtered = EQUIPOS_CATALOG.filter((e) => {
    const matchTab =
      activeTab === 'Todos' ||
      (activeTab === 'Activos'           && e.estadoOperativo === 'Activo') ||
      (activeTab === 'En Revisión'       && e.estadoOperativo === 'En Revisión') ||
      (activeTab === 'Fuera de Servicio' && e.estadoOperativo === 'Fuera de Servicio') ||
      (activeTab === 'OT Preventivo'     && e.otActiva?.tipo === 'Preventivo') ||
      (activeTab === 'OT Correctivo'     && e.otActiva?.tipo === 'Correctivo') ||
      (activeTab === 'OT Predictivo'     && e.otActiva?.tipo === 'Predictivo');

    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.serial.includes(search) ||
      (e.otActiva?.descripcion ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.ultimaOT?.descripcion ?? '').toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  const handleSaveEquipo  = (eq)  => console.log('Equipo guardado:', eq); // TODO: API
  const handleNuevoEquipo = ()    => setSelectedEquipo({ ...EQUIPO_VACIO });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Gestión de Equipos"
          subtitle="Monitorea y administra todos los activos del sistema"
          showSearch={false}
          notifications={notifs}
          onNotifClick={(n) => {
            setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, leida: true } : x));
          }}
          onNotifMarkAll={() => setNotifs((p) => p.map((n) => ({ ...n, leida: true })))}
        />

        <div className="flex-1 overflow-hidden flex gap-0">

          {/* ── IZQUIERDA: Tabla ──────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Top bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Inventario de Equipos</h2>
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar equipo, serie, OT..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                    />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNuevoEquipo}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Equipo
                  </button>
                  <button className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm shadow-emerald-200">
                    Verificar Estado
                  </button>
                </div>
              </div>

              {/* Status tabs */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      activeTab === tab.label ? tab.color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.label ? 'bg-white/30' : 'bg-white text-slate-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Equipo</div>
                <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">OT Activa / Última OT</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lectura</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerta</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {filtered.map((eq) => {
                  const estadoBadge = estadoOperativoBadge(eq.estadoOperativo);
                  const alerta      = getAlertaUmbral(eq.lecturas);

                  return (
                    <div
                      key={eq.id}
                      className="grid grid-cols-12 px-6 py-3.5 hover:bg-blue-50/40 transition-colors items-center group cursor-pointer"
                      onClick={() => setSelectedEquipo(eq)}
                    >
                      <div className="col-span-3">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{eq.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{eq.serial}</p>
                        <p className="text-xs text-slate-400 truncate">{eq.location}</p>
                      </div>

                      <div className="col-span-3 pr-2">
                        {eq.otActiva ? (
                          <div>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${otActivaBadge(eq.otActiva.tipo)}`}>
                              {eq.otActiva.tipo}
                            </span>
                            <p className="text-xs text-slate-700 font-medium leading-tight truncate">{eq.otActiva.descripcion}</p>
                            <p className="text-[11px] text-slate-400">{eq.otActiva.fecha}</p>
                          </div>
                        ) : eq.ultimaOT ? (
                          <div>
                            <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mb-1">Última OT</span>
                            <p className="text-xs text-slate-500 leading-tight truncate">{eq.ultimaOT.descripcion}</p>
                            <p className="text-[11px] text-slate-400">{eq.ultimaOT.fecha}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 italic">Sin OTs registradas</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <p className="text-sm font-bold text-slate-800">
                          {eq.lecturas.valor.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400 ml-1">{eq.lecturas.unidad}</span>
                        </p>
                        {eq.lecturas.umbralProximo && (
                          <p className="text-[11px] text-slate-400">Umbral: {eq.lecturas.umbralProximo}{eq.lecturas.unidad}</p>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${estadoBadge.dot}`} />
                        <span className={`text-xs font-semibold ${estadoBadge.text}`}>{estadoBadge.label}</span>
                      </div>

                      <div className="col-span-2 flex justify-between items-center">
                        {alerta ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alertaUmbralStyle(alerta.level)}`}>
                            {alerta.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEquipo(eq); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700"
                        >
                          Ver
                        </button>
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
            </div>
          </div>

          {/* ── DERECHA: KPIs + Accesos ───────────────────── */}
          <div className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Resumen OTs</h3>
              <div className="space-y-3">
                {STATS.map((stat) => (
                  <div key={stat.title} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate">{stat.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                        <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stat.up ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          )}
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{stat.sub}</p>
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
                    <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <button
              onClick={handleNuevoEquipo}
              className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
