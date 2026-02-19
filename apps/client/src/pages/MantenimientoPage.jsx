// MantenimientoPage.jsx
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { OTDrawer } from '../components/OTDrawer';
// ← Fuente única: catálogo + historial + OTs activas
import {
  EQUIPOS_CATALOG,
  PLANES_INICIALES,
  HISTORIAL_OTS,
  OTS_ACTIVAS,
} from '../store/equiposStore';

// ─── calcularCostos: derivado de historialOTs + otActiva ──────
const calcularCostos = ({ historialOTs, otActiva }) => {
  const todas = [...(otActiva ? [otActiva] : []), ...historialOTs];
  const totalEstimado = todas.reduce((s, o) => s + (o.costoEstimado ?? 0), 0);
  const totalReal     = todas.filter((o) => o.costoReal != null).reduce((s, o) => s + o.costoReal, 0);
  const variacion     = totalReal - totalEstimado;

  const porTipo = ['Preventivo', 'Correctivo', 'Predictivo'].map((tipo) => {
    const del = todas.filter((o) => o.tipo === tipo);
    return {
      tipo,
      est:  del.reduce((s, o) => s + (o.costoEstimado ?? 0), 0),
      real: del.filter((o) => o.costoReal != null).reduce((s, o) => s + o.costoReal, 0),
      registros: del
        .filter((o) => o.costoReal != null)
        .map((o) => ({ id: o.id, descripcion: o.descripcion, fecha: o.fecha, costoReal: o.costoReal })),
    };
  });

  return { totalEstimado, totalReal, variacion, porTipo };
};

// ─── Notificaciones globales ──────────────────────────────────
const NOTIFICACIONES_MANT = [
  { id: 'N-001', tipo: 'umbral',      leida: false, tiempo: 'Hace 5 min',  titulo: 'Mantenimiento próximo',   descripcion: 'EQ-001: faltan 20h para umbral de 500h.',     equipoId: 'EQ-001', color: 'amber'   },
  { id: 'N-002', tipo: 'correctivo',  leida: false, tiempo: 'Hace 18 min', titulo: 'Falla crítica detectada', descripcion: 'EQ-002: falla en alternador. OT-0039 abierta.', equipoId: 'EQ-002', color: 'red'     },
  { id: 'N-003', tipo: 'umbral',      leida: false, tiempo: 'Hace 1 h',    titulo: 'Mantenimiento próximo',   descripcion: 'EQ-003: faltan 50h para umbral de 1000h.',    equipoId: 'EQ-003', color: 'amber'   },
  { id: 'N-004', tipo: 'certificado', leida: true,  tiempo: 'Hace 3 h',    titulo: 'Certificado por vencer',  descripcion: 'EQ-006: Certificado vence en 2 días.',        equipoId: 'EQ-006', color: 'orange'  },
  { id: 'N-005', tipo: 'predictivo',  leida: true,  tiempo: 'Hace 5 h',    titulo: 'Alerta predictiva',       descripcion: 'EQ-005: vibración anómala en sensor 3.',      equipoId: 'EQ-005', color: 'cyan'    },
  { id: 'N-006', tipo: 'ot_cerrada',  leida: true,  tiempo: 'Ayer',        titulo: 'OT completada',           descripcion: 'OT-0031 cerrada. EQ-001 operativo.',          equipoId: 'EQ-001', color: 'emerald' },
];

// ─── Helpers ──────────────────────────────────────────────────
const getAlertaUmbral = (lecturas) => {
  if (!lecturas?.umbralProximo) return null;
  const r = lecturas.umbralProximo - lecturas.valor;
  if (r <= 0)   return { level: 'vencido', label: `Vencido ${Math.abs(r)}${lecturas.unidad}`, style: 'bg-red-100 text-red-700 border-red-200'        };
  if (r <= 50)  return { level: 'urgente', label: `${r}${lecturas.unidad} restantes`,          style: 'bg-amber-100 text-amber-700 border-amber-200'  };
  if (r <= 100) return { level: 'proximo', label: `${r}${lecturas.unidad} restantes`,          style: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  return null;
};

const OT_TIPO = {
  Preventivo: { pill: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
  Correctivo: { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Predictivo: { pill: 'bg-cyan-100 text-cyan-700',   dot: 'bg-cyan-500'  },
};

const PRIORIDAD = {
  'Crítica': 'bg-red-100 text-red-700',
  'Alta':    'bg-orange-100 text-orange-700',
  'Media':   'bg-yellow-100 text-yellow-700',
  'Baja':    'bg-slate-100 text-slate-600',
};

const FILTER_TABS = [
  { label: 'Todos',      key: 'todos'      },
  { label: 'Preventivo', key: 'Preventivo' },
  { label: 'Correctivo', key: 'Correctivo' },
  { label: 'Predictivo', key: 'Predictivo' },
];

// ─── CrearPlanForm ────────────────────────────────────────────
// Recibe el equipo ya seleccionado (viene del catálogo) y lo usa
// para pre-llenar nombre, trigger y umbral automáticamente.
const CrearPlanForm = ({ equipo, onCreate }) => {
  const [plan, setPlan] = useState({
    nombre:      `Plan de Mantenimiento - ${equipo.name}`,
    trigger:     equipo.lecturas?.umbralProximo ? 'Por Medidor' : 'Por Tiempo',
    umbral:      equipo.lecturas?.umbralProximo ?? 500,
    unidad:      equipo.lecturas?.unidad ?? 'h',
    recurrencia: 'Trimestral',
    checklist:   [],
    repuestos:   [],
    duracionEst: 2,
    costoEst:    0,
  });

  const [nuevoItem,     setNuevoItem]     = useState('');
  const [nuevoRepuesto, setNuevoRepuesto] = useState('');
  const [nuevaCant,     setNuevaCant]     = useState(1);

  const addItem = () => {
    if (!nuevoItem.trim()) return;
    setPlan((p) => ({ ...p, checklist: [...p.checklist, nuevoItem.trim()] }));
    setNuevoItem('');
  };

  const addRepuesto = () => {
    if (!nuevoRepuesto.trim()) return;
    setPlan((p) => ({ ...p, repuestos: [...p.repuestos, { item: nuevoRepuesto.trim(), cant: nuevaCant }] }));
    setNuevoRepuesto('');
    setNuevaCant(1);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 overflow-hidden">
      <div className="px-5 py-4 bg-blue-50/60 border-b border-blue-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Crear Plan de Mantenimiento</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {equipo.name} · {equipo.serial} · Lectura: <span className="font-semibold text-slate-600">{equipo.lecturas.valor.toLocaleString()}{equipo.lecturas.unidad}</span>
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Plan</label>
          <input
            value={plan.nombre}
            onChange={(e) => setPlan((p) => ({ ...p, nombre: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Trigger + Umbral */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trigger</label>
            <select
              value={plan.trigger}
              onChange={(e) => setPlan((p) => ({ ...p, trigger: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            >
              <option>Por Medidor</option>
              <option>Por Tiempo</option>
              <option>Ambos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Umbral ({plan.unidad})
            </label>
            <input
              type="number"
              value={plan.umbral}
              onChange={(e) => setPlan((p) => ({ ...p, umbral: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Recurrencia + Duración + Costo */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Recurrencia</label>
            <select
              value={plan.recurrencia}
              onChange={(e) => setPlan((p) => ({ ...p, recurrencia: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            >
              <option>Mensual</option>
              <option>Trimestral</option>
              <option>Semestral</option>
              <option>Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Duración Est. (h)</label>
            <input type="number" min="0" step="0.5" value={plan.duracionEst}
              onChange={(e) => setPlan((p) => ({ ...p, duracionEst: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Costo Est. ($)</label>
            <input type="number" min="0" value={plan.costoEst}
              onChange={(e) => setPlan((p) => ({ ...p, costoEst: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Checklist dinámico */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Checklist de Tareas</label>
          {plan.checklist.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {plan.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                  <p className="text-sm text-slate-700 flex-1">{item}</p>
                  <button onClick={() => setPlan((p) => ({ ...p, checklist: p.checklist.filter((_, j) => j !== i) }))}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={nuevoItem} onChange={(e) => setNuevoItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Ej: Drenar aceite… (Enter)"
              className="flex-1 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button onClick={addItem} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors">
              + Agregar
            </button>
          </div>
        </div>

        {/* Repuestos dinámicos */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Repuestos</label>
          {plan.repuestos.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {plan.repuestos.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-slate-700 flex-1">{r.item}</p>
                  <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">×{r.cant}</span>
                  <button onClick={() => setPlan((p) => ({ ...p, repuestos: p.repuestos.filter((_, j) => j !== i) }))}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={nuevoRepuesto} onChange={(e) => setNuevoRepuesto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRepuesto()}
              placeholder="Nombre del repuesto"
              className="flex-1 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input type="number" min="1" value={nuevaCant}
              onChange={(e) => setNuevaCant(Number(e.target.value))}
              className="w-16 border border-slate-200 rounded-xl py-2 px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button onClick={addRepuesto} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors">
              + Agregar
            </button>
          </div>
        </div>

        {/* Preview costo */}
        {plan.costoEst > 0 && (
          <div className="bg-slate-900 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Costo estimado</p>
              <p className="text-2xl font-black text-white">${plan.costoEst.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Duración</p>
              <p className="text-sm font-bold text-white">{plan.duracionEst}h</p>
            </div>
          </div>
        )}

        <button
          onClick={() => onCreate({ ...plan })}
          disabled={!plan.nombre.trim() || plan.checklist.length === 0}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          Guardar Plan de Mantenimiento
        </button>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────
export const MantenimientoPage = () => {
  // Planes en state local (en real: API PUT /planes/:equipoId)
  const [planes,      setPlanes]      = useState(PLANES_INICIALES);
  const [selectedId,  setSelectedId]  = useState(EQUIPOS_CATALOG[0].id);
  const [activeTab,   setActiveTab]   = useState('programa');
  const [filterTab,   setFilterTab]   = useState('todos');
  const [otDrawer,    setOtDrawer]    = useState(null);
  const [notifs,      setNotifs]      = useState(NOTIFICACIONES_MANT);
  const [checklistLocal, setChecklistLocal] = useState(null);
  const [editandoPlan,   setEditandoPlan]   = useState(false);

  // Equipo seleccionado del catálogo (solo datos maestros + lecturas)
  const equipoBase   = EQUIPOS_CATALOG.find((e) => e.id === selectedId) ?? EQUIPOS_CATALOG[0];
  // OT activa completa (con checklist)
  const otActiva     = OTS_ACTIVAS[equipoBase.id] ?? null;
  // Historial de OTs cerradas
  const historialOTs = HISTORIAL_OTS[equipoBase.id] ?? [];
  // Plan del equipo (null si no tiene)
  const plan         = planes[equipoBase.id] ?? null;
  // Costos calculados dinámicamente
  const costos       = calcularCostos({ historialOTs, otActiva });

  const noLeidas = notifs.filter((n) => !n.leida).length;

  // Equipos visibles en la lista lateral (filtrados por tipo de OT activa)
  const equiposFiltrados = EQUIPOS_CATALOG.filter((e) => {
    if (filterTab === 'todos') return true;
    return (OTS_ACTIVAS[e.id]?.tipo) === filterTab;
  });

  const handleSelectEquipo = (eq) => {
    setSelectedId(eq.id);
    setActiveTab('programa');
    setChecklistLocal(null);
    setEditandoPlan(false);
  };

  const handleCrearPlan = (nuevoPlan) => {
    setPlanes((p) => ({ ...p, [equipoBase.id]: nuevoPlan }));
    setEditandoPlan(false);
  };

  const getChecklist    = () => checklistLocal ?? otActiva?.checklist ?? [];
  const toggleCheckItem = (id) =>
    setChecklistLocal(getChecklist().map((c) => c.id === id ? { ...c, done: !c.done } : c));

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Mantenimiento"
          subtitle="Programa, órdenes de trabajo y costos por equipo"
          notifications={notifs}
          onNotifClick={(n) => {
            const eq = EQUIPOS_CATALOG.find((e) => e.id === n.equipoId);
            if (eq) { setSelectedId(eq.id); setActiveTab('ots'); }
            setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, leida: true } : x));
          }}
          onNotifMarkAll={() => setNotifs((p) => p.map((n) => ({ ...n, leida: true })))}
          actionButton={
            <button
              onClick={() => setOtDrawer({
                id: 'OT-NUEVA', tipo: 'Correctivo', descripcion: '', estado: 'Abierta',
                fecha: new Date().toISOString().split('T')[0], tecnico: '',
                prioridad: 'Media', costoEstimado: 0, costoReal: null, checklist: [],
              })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nueva OT
            </button>
          }
        />

        <div className="flex-1 overflow-hidden flex">

          {/* ── PANEL IZQUIERDO ────────────────────────── */}
          <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Buscar equipo..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {FILTER_TABS.map((f) => (
                  <button key={f.key} onClick={() => setFilterTab(f.key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      filterTab === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {equiposFiltrados.map((eq) => {
                const alerta  = getAlertaUmbral(eq.lecturas);
                const ot      = OTS_ACTIVAS[eq.id];
                const isActive = selectedId === eq.id;
                const tienePlan = !!planes[eq.id];

                return (
                  <div key={eq.id} onClick={() => handleSelectEquipo(eq)}
                    className={`p-4 cursor-pointer transition-colors ${isActive ? 'bg-slate-900' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{eq.name}</p>
                        <p className={`text-xs font-mono mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{eq.serial}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!tienePlan && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            Sin plan
                          </span>
                        )}
                        {ot && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : OT_TIPO[ot.tipo]?.pill}`}>
                            {ot.tipo}
                          </span>
                        )}
                      </div>
                    </div>
                    {ot && (
                      <p className={`text-xs truncate mb-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{ot.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {eq.lecturas.valor.toLocaleString()}{eq.lecturas.unidad}
                      </p>
                      {alerta && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? 'bg-amber-400/20 text-amber-200 border-amber-400/30' : alerta.style}`}>
                          {alerta.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PANEL DERECHO ──────────────────────────── */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <>
              {/* Cabecera */}
              <div className="px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {equipoBase.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-lg font-bold text-slate-900">{equipoBase.name}</h2>
                        {otActiva && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${OT_TIPO[otActiva.tipo]?.pill}`}>OT {otActiva.tipo}</span>
                        )}
                        {otActiva && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${PRIORIDAD[otActiva.prioridad]}`}>{otActiva.prioridad}</span>
                        )}
                        {!plan && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Sin plan</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{equipoBase.serial} · {equipoBase.category} · {equipoBase.location}</p>
                    </div>
                  </div>
                  {otActiva && (
                    <button onClick={() => setOtDrawer(otActiva)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Ver OT {otActiva.id}
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-5">
                  {[
                    { id: 'programa', label: 'Programa' },
                    { id: 'ots',      label: 'Órdenes de Trabajo', badge: historialOTs.length + (otActiva ? 1 : 0) },
                    { id: 'costos',   label: 'Costos' },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                      {tab.badge > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido tabs */}
              <div className="flex-1 overflow-y-auto p-8">

                {/* TAB: PROGRAMA */}
                {activeTab === 'programa' && (
                  <div className="grid grid-cols-5 gap-6">
                    <div className="col-span-3 space-y-6">

                      {/* Checklist OT activa */}
                      {otActiva && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OT_TIPO[otActiva.tipo]?.pill}`}>{otActiva.tipo}</span>
                              <h3 className="text-sm font-bold text-slate-900">{otActiva.descripcion}</h3>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{otActiva.id}</span>
                          </div>
                          <div className="px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist</p>
                              <p className="text-xs text-slate-400">{getChecklist().filter((c) => c.done).length}/{getChecklist().length} completadas</p>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${(getChecklist().filter((c) => c.done).length / (getChecklist().length || 1)) * 100}%` }} />
                            </div>
                            <div className="space-y-2">
                              {getChecklist().map((item) => (
                                <div key={item.id} onClick={() => toggleCheckItem(item.id)}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${item.done ? 'bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                                >
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {item.done && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <p className={`text-sm flex-1 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.texto}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <p className="text-xs text-slate-400">Técnico: <span className="font-semibold text-slate-600">{otActiva.tecnico}</span></p>
                            <button onClick={() => setOtDrawer(otActiva)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
                              Ver detalle completo <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Plan o CrearPlanForm */}
                      {plan && !editandoPlan ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Plan: {plan.nombre}
                            </h3>
                            <button onClick={() => setEditandoPlan(true)} className="text-xs font-bold text-blue-600 hover:underline">Editar plan →</button>
                          </div>
                          <div className="px-5 py-4 grid grid-cols-2 gap-4">
                            {[
                              { label: 'Trigger',       value: plan.trigger },
                              { label: 'Umbral',        value: `${plan.umbral} ${plan.unidad}` },
                              { label: 'Recurrencia',   value: plan.recurrencia },
                              { label: 'Duración Est.', value: `${plan.duracionEst}h` },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{label}</p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                              </div>
                            ))}
                          </div>
                          {plan.checklist.length > 0 && (
                            <div className="px-5 pb-4">
                              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Checklist del Plan</p>
                              <div className="space-y-1.5">
                                {plan.checklist.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                                    <p className="text-xs text-slate-700">{item}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <CrearPlanForm equipo={equipoBase} onCreate={handleCrearPlan} />
                      )}
                    </div>

                    {/* Sidebar derecho */}
                    <div className="col-span-2 space-y-4">
                      {/* Contador */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contador del Equipo</p>
                        <div className="flex items-end gap-2 mb-3">
                          <span className="text-3xl font-black text-slate-900">{equipoBase.lecturas.valor.toLocaleString()}</span>
                          <span className="text-sm text-slate-400 mb-1">{equipoBase.lecturas.unidad}</span>
                        </div>
                        {equipoBase.lecturas.umbralProximo && (() => {
                          const restante = equipoBase.lecturas.umbralProximo - equipoBase.lecturas.valor;
                          const pct = Math.min((equipoBase.lecturas.valor / equipoBase.lecturas.umbralProximo) * 100, 100);
                          return (
                            <>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>0 {equipoBase.lecturas.unidad}</span>
                                <span className={`font-semibold ${restante <= 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                                  {restante > 0 ? `Faltan ${restante}${equipoBase.lecturas.unidad}` : `Vencido ${Math.abs(restante)}${equipoBase.lecturas.unidad}`}
                                </span>
                                <span>{equipoBase.lecturas.umbralProximo} {equipoBase.lecturas.unidad}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {plan?.repuestos?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repuestos Requeridos</p>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {plan.repuestos.map((r, i) => (
                              <div key={i} className="flex items-center justify-between px-5 py-3">
                                <p className="text-xs text-slate-700 flex-1">{r.item}</p>
                                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full ml-2">×{r.cant}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {plan && (
                        <div className="bg-slate-900 rounded-2xl p-5 text-white">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Costo Estimado del Plan</p>
                          <p className="text-3xl font-black">${plan.costoEst.toLocaleString()}</p>
                          <p className="text-xs text-slate-400 mt-1">Duración estimada: {plan.duracionEst}h</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: OTs */}
                {activeTab === 'ots' && (
                  <div className="space-y-3 max-w-2xl">
                    {otActiva && (
                      <div onClick={() => setOtDrawer(otActiva)}
                        className="bg-white rounded-2xl border-2 border-slate-900 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${OT_TIPO[otActiva.tipo]?.dot}`} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OT_TIPO[otActiva.tipo]?.pill}`}>{otActiva.tipo}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Abierta</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORIDAD[otActiva.prioridad]}`}>{otActiva.prioridad}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{otActiva.id}</span>
                        </div>
                        <p className="text-base font-bold text-slate-900 mb-1">{otActiva.descripcion}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span>{otActiva.tecnico}</span>
                          <span>{otActiva.fecha}</span>
                          <span className="ml-auto text-slate-500 font-medium">Ver detalle →</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progreso</span>
                            <span>{getChecklist().filter((c) => c.done).length}/{getChecklist().length}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(getChecklist().filter((c) => c.done).length / (getChecklist().length || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {historialOTs.length > 0 && (
                      <>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Historial</p>
                        {historialOTs.map((ot) => (
                          <div key={ot.id} onClick={() => setOtDrawer(ot)}
                            className="bg-white rounded-2xl border border-slate-100 p-5 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OT_TIPO[ot.tipo]?.pill}`}>{ot.tipo}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Cerrada</span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{ot.id}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{ot.descripcion}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                              <span>{ot.fecha}</span>
                              <span className="font-semibold text-slate-600">${ot.costoReal} real</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!otActiva && historialOTs.length === 0 && (
                      <div className="py-20 text-center">
                        <p className="text-slate-400 text-sm">Sin órdenes de trabajo registradas</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: COSTOS */}
                {activeTab === 'costos' && (
                  <div className="grid grid-cols-5 gap-6">
                    <div className="col-span-5 grid grid-cols-3 gap-4">
                      {[
                        { label: 'Costo Estimado Total', value: `$${costos.totalEstimado.toLocaleString()}`, sub: 'Suma costoEstimado de todas OTs', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Costo Real Total',     value: `$${costos.totalReal.toLocaleString()}`,     sub: 'Suma costoReal de OTs cerradas',  color: 'text-slate-900', bg: 'bg-slate-50' },
                        {
                          label: 'Variación',
                          value: `${costos.variacion >= 0 ? '+' : ''}$${costos.variacion.toLocaleString()}`,
                          sub:   costos.totalEstimado > 0 ? `${((costos.variacion / costos.totalEstimado) * 100).toFixed(1)}% sobre estimado` : 'Sin estimado',
                          color: costos.variacion > 0 ? 'text-red-600' : 'text-emerald-600',
                          bg:    costos.variacion > 0 ? 'bg-red-50'    : 'bg-emerald-50',
                        },
                      ].map(({ label, value, sub, color, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-5 border border-slate-200`}>
                          <p className="text-xs text-slate-500 font-medium mb-2">{label}</p>
                          <p className={`text-2xl font-black ${color}`}>{value}</p>
                          <p className="text-xs text-slate-400 mt-1">{sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">Desglose por Tipo</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Calculado desde historial de OTs cerradas</p>
                      </div>
                      <div className="p-5 space-y-5">
                        {costos.porTipo.map((t) => {
                          const variacion = t.real - t.est;
                          const maxVal    = Math.max(t.est, t.real, 1);
                          return (
                            <div key={t.tipo}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${OT_TIPO[t.tipo]?.pill}`}>{t.tipo}</span>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-slate-400">Est. <span className="font-semibold text-slate-700">${t.est.toLocaleString()}</span></span>
                                  <span className="text-slate-400">Real <span className="font-semibold text-slate-900">${t.real.toLocaleString()}</span></span>
                                  <span className={`font-bold ${variacion > 0 ? 'text-red-500' : variacion < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {variacion !== 0 ? `${variacion > 0 ? '+' : ''}$${variacion}` : '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {[
                                  { label: 'Est.', val: t.est,  cls: 'bg-slate-300' },
                                  { label: 'Real', val: t.real, cls: OT_TIPO[t.tipo]?.dot },
                                ].map(({ label, val, cls }) => (
                                  <div key={label} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 w-8 text-right">{label}</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all ${cls}`} style={{ width: `${(val / maxVal) * 100}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {t.registros.length > 0 && (
                                <div className="mt-2 space-y-1 pl-10">
                                  {t.registros.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-1.5">
                                      <span className="font-mono">{r.id}</span>
                                      <span className="truncate mx-2 flex-1">{r.descripcion}</span>
                                      <span className="shrink-0">{r.fecha}</span>
                                      <span className="text-slate-700 font-bold ml-2 shrink-0">${r.costoReal}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">OT Activa</p>
                        {otActiva ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">Estimado</span>
                              <span className="text-sm font-bold text-slate-700">${otActiva.costoEstimado.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">Real</span>
                              <span className="text-sm font-bold text-slate-400 italic">
                                {otActiva.costoReal != null ? `$${otActiva.costoReal.toLocaleString()}` : 'En proceso…'}
                              </span>
                            </div>
                          </div>
                        ) : <p className="text-sm text-slate-400">Sin OT activa</p>}
                      </div>

                      <div className="bg-slate-900 rounded-2xl p-5 text-white">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Eficiencia de Costos</p>
                        {costos.totalEstimado > 0 ? (
                          <>
                            <p className={`text-3xl font-black ${costos.variacion <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {(100 - (Math.abs(costos.variacion) / costos.totalEstimado) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Precisión estimado vs real</p>
                          </>
                        ) : <p className="text-sm text-slate-400 mt-1">Sin datos suficientes</p>}
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <p className="text-xs text-blue-700 font-semibold flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Costos en tiempo real
                        </p>
                        <p className="text-[11px] text-blue-500 mt-1">
                          Derivados del <code className="bg-blue-100 px-1 rounded">costoReal</code> de OTs cerradas en <code className="bg-blue-100 px-1 rounded">HISTORIAL_OTS</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </main>

      {otDrawer && <OTDrawer ot={otDrawer} onClose={() => setOtDrawer(null)} />}
    </div>
  );
};
