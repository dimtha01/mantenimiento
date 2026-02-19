// MantenimientoPage.jsx — integración completa con API real
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { OTDrawer } from '../components/OTDrawer';

/* ─── Helpers de badge ─────────────────────────────────────────── */
const TIPO_CFG = {
  PREVENTIVO: { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Preventivo' },
  CORRECTIVO: { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Correctivo' },
  PREDICTIVO: { pill: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', label: 'Predictivo' },
};
const tipoCfg = (nombre) => TIPO_CFG[nombre] ?? { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: nombre };
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE') : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

const FILTER_TABS = [
  { label: 'Todos', key: 'TODOS' },
  { label: 'Preventivo', key: 'PREVENTIVO' },
  { label: 'Correctivo', key: 'CORRECTIVO' },
  { label: 'Predictivo', key: 'PREDICTIVO' },
];

/* ─── Formulario registro de mantenimiento ──────────────────────── */
const RegistroForm = ({ equipoId, tipos, unidad, onGuardado, onCancel }) => {
  const [form, setForm] = useState({
    tipoId: tipos[0]?.id ?? '',
    fechaServicio: new Date().toISOString().split('T')[0],
    lecturaActual: '',
    observaciones: '',
    costoTotal: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSubmit = async () => {
    if (!form.tipoId || !form.fechaServicio || form.lecturaActual === '') {
      setErr('Tipo, fecha y lectura son obligatorios.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, equipoId, lecturaActual: Number(form.lecturaActual), costoTotal: form.costoTotal !== '' ? Number(form.costoTotal) : null }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onGuardado(json.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

  return (
    <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50">
      <p className="text-sm font-bold text-slate-900">Nuevo Registro de Mantenimiento</p>
      {err && <p className="text-xs text-red-500">{err}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
          <select value={form.tipoId} onChange={e => setForm(p => ({ ...p, tipoId: e.target.value }))} className={inputCls}>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha de Servicio</label>
          <input type="date" value={form.fechaServicio} onChange={e => setForm(p => ({ ...p, fechaServicio: e.target.value }))} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lectura Actual {unidad ? `(${unidad})` : ''}</label>
          <input type="number" min="0" value={form.lecturaActual} onChange={e => setForm(p => ({ ...p, lecturaActual: e.target.value }))} placeholder="Ej: 1250" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Costo Total ($)</label>
          <input type="number" min="0" step="0.01" value={form.costoTotal} onChange={e => setForm(p => ({ ...p, costoTotal: e.target.value }))} placeholder="Opcional" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
        <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Detalles del servicio..." />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar Registro'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
};

/* ─── Formulario de plan preventivo ────────────────────────────── */
const PlanForm = ({ equipoId, plan, unidad, onGuardado, onCancel }) => {
  const isEdit = !!plan;
  const [form, setForm] = useState({
    descripcionTarea: plan?.descripcionTarea ?? '',
    frecuenciaValor: plan?.frecuenciaValor ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSubmit = async () => {
    if (!form.descripcionTarea || form.frecuenciaValor === '') {
      setErr('Descripción y frecuencia son obligatorias.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const url = isEdit ? `/api/mantenimientos/planes/${plan.id}` : '/api/mantenimientos/planes';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { descripcionTarea: form.descripcionTarea, frecuenciaValor: Number(form.frecuenciaValor) }
        : { equipoId, descripcionTarea: form.descripcionTarea, frecuenciaValor: Number(form.frecuenciaValor) };

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onGuardado(json.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

  return (
    <div className="border border-blue-200 rounded-2xl p-5 space-y-4 bg-blue-50/40">
      <p className="text-sm font-bold text-slate-900">{isEdit ? 'Editar Plan Preventivo' : 'Nuevo Plan Preventivo'}</p>
      {err && <p className="text-xs text-red-500">{err}</p>}

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tarea / Descripción</label>
        <textarea value={form.descripcionTarea} onChange={e => setForm(p => ({ ...p, descripcionTarea: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Ej: Cambio de aceite y filtros..." />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Frecuencia {unidad ? `(cada N ${unidad})` : ''}</label>
        <input type="number" min="1" value={form.frecuenciaValor} onChange={e => setForm(p => ({ ...p, frecuenciaValor: e.target.value }))} placeholder="Ej: 500" className={inputCls} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60">
          {saving ? 'Guardando...' : isEdit ? 'Actualizar Plan' : 'Crear Plan'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
};


/* ─── Página principal ──────────────────────────────────────────── */
export const MantenimientoPage = () => {
  /* ── state ── */
  const [equipos, setEquipos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filterTab, setFilterTab] = useState('TODOS');
  const [activeTab, setActiveTab] = useState('registros');
  const [search, setSearch] = useState('');

  const [registros, setRegistros] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, porTipo: [] });

  const [loading, setLoading] = useState(true);
  const [loadingDet, setLoadingDet] = useState(false);

  const [showRegForm, setShowRegForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);   // null | plan object
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [otDrawer, setOtDrawer] = useState(null);

  /* ── equipo seleccionado ── */
  const equipoSel = equipos.find(e => e.id === selectedId) ?? null;

  /* ── fetch lista equipos ── */
  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ take: '200', withDetails: '1' });
      if (search) params.set('q', search);
      const res = await fetch(`/api/equipos?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      const lista = json.data ?? [];
      setEquipos(lista);
      if (!selectedId && lista.length > 0) setSelectedId(lista[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  /* ── fetch tipos de mantenimiento ── */
  const fetchTipos = useCallback(async () => {
    try {
      const res = await fetch('/api/mantenimientos/tipos');
      const json = await res.json();
      if (json.ok) setTipos(json.data ?? []);
    } catch (e) { console.error(e); }
  }, []);

  /* ── fetch registros y planes del equipo seleccionado ── */
  const fetchDetalle = useCallback(async (equipoId) => {
    if (!equipoId) return;
    setLoadingDet(true);
    try {
      const [rRes, pRes, kRes] = await Promise.all([
        fetch(`/api/mantenimientos?equipoId=${equipoId}&take=100`),
        fetch(`/api/mantenimientos/planes?equipoId=${equipoId}`),
        fetch('/api/mantenimientos?take=500'),
      ]);
      const [rJson, pJson, kJson] = await Promise.all([rRes.json(), pRes.json(), kRes.json()]);
      if (rJson.ok) setRegistros(rJson.data ?? []);
      if (pJson.ok) setPlanes(pJson.data ?? []);
      if (kJson.ok) setKpis(kJson.kpis ?? { total: 0, porTipo: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDet(false);
    }
  }, []);

  useEffect(() => { fetchEquipos(); fetchTipos(); }, [fetchEquipos, fetchTipos]);

  useEffect(() => {
    if (selectedId) fetchDetalle(selectedId);
  }, [selectedId, fetchDetalle]);

  /* ── filtro lateral ── */
  const equiposFiltrados = equipos.filter(e => {
    const matchSearch = !search || e.codigo?.toLowerCase().includes(search.toLowerCase()) || e.serial?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterTab === 'TODOS') return true;
    return e.mantenimientos?.[0]?.tipo?.nombre === filterTab;
  });

  /* ── costos calculados ── */
  const totalCosto = registros.reduce((s, r) => s + Number(r.costoTotal ?? 0), 0);
  const porTipoLocale = tipos.map(t => ({
    nombre: t.nombre,
    count: registros.filter(r => r.tipo?.nombre === t.nombre).length,
    costo: registros.filter(r => r.tipo?.nombre === t.nombre).reduce((s, r) => s + Number(r.costoTotal ?? 0), 0),
  }));

  /* ── helpers de acción ── */
  const handleRegistroCreado = (nuevo) => {
    setRegistros(p => [nuevo, ...p]);
    setShowRegForm(false);
    // actualizar lectura en el equipo localmente
    setEquipos(p => p.map(e => e.id === selectedId
      ? { ...e, mantenimientos: [nuevo, ...(e.mantenimientos ?? [])] }
      : e
    ));
  };

  const handlePlanGuardado = (plan) => {
    setPlanes(p => {
      const idx = p.findIndex(x => x.id === plan.id);
      return idx >= 0 ? p.map(x => x.id === plan.id ? plan : x) : [plan, ...p];
    });
    setShowPlanForm(false);
    setEditPlan(null);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await fetch(`/api/mantenimientos/planes/${planId}`, { method: 'DELETE' });
      setPlanes(p => p.filter(x => x.id !== planId));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Mantenimiento"
          subtitle="Registros, planes preventivos y costos por equipo"
          showSearch={false}
          notifications={[]}
          actionButton={
            <button
              onClick={() => { setShowRegForm(true); setActiveTab('registros'); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuevo Registro
            </button>
          }
        />

        <div className="flex-1 overflow-hidden flex">

          {/* ── PANEL IZQUIERDO: Lista de equipos ── */}
          <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" placeholder="Buscar equipo..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {FILTER_TABS.map(f => (
                  <button key={f.key} onClick={() => setFilterTab(f.key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${filterTab === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loading && <div className="p-6 text-center text-xs text-slate-400 animate-pulse">Cargando equipos...</div>}
              {!loading && equiposFiltrados.map(eq => {
                const ultimoMant = eq.mantenimientos?.[0] ?? null;
                const isActive = selectedId === eq.id;
                const cfg = tipoCfg(ultimoMant?.tipo?.nombre ?? '');
                return (
                  <div key={eq.id} onClick={() => { setSelectedId(eq.id); setActiveTab('registros'); setShowRegForm(false); setShowPlanForm(false); setEditPlan(null); }}
                    className={`p-4 cursor-pointer transition-colors ${isActive ? 'bg-slate-900' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{eq.codigo}</p>
                        <p className={`text-xs font-mono mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{eq.serial} · {eq.modelo}</p>
                      </div>
                      {ultimoMant && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-white/20 text-white' : cfg.pill}`}>
                          {ultimoMant.tipo?.nombre}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[11px] ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                        {ultimoMant ? fmtDate(ultimoMant.fechaServicio) : 'Sin registros'}
                      </p>
                      {eq.parametro?.unidad && ultimoMant && (
                        <span className={`text-[10px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {ultimoMant.lecturaActual?.toLocaleString()} {eq.parametro.unidad}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {!loading && equiposFiltrados.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">Sin equipos</div>
              )}
            </div>
          </div>

          {/* ── PANEL DERECHO ── */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!equipoSel ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Selecciona un equipo
              </div>
            ) : (
              <>
                {/* Cabecera del equipo */}
                <div className="px-8 py-5 border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                        {equipoSel.codigo?.charAt(0) ?? 'E'}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{equipoSel.codigo}</h2>
                        <p className="text-sm text-slate-400">
                          {equipoSel.marca?.nombre ?? '—'} · {equipoSel.modelo} · {equipoSel.ubicacion?.nombre ?? '—'}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{equipoSel.serial}</p>
                      </div>
                    </div>

                    {/* KPI: último registro */}
                    {registros[0] && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Último mantenimiento</p>
                        <p className="text-sm font-bold text-slate-700">{fmtDate(registros[0].fechaServicio)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoCfg(registros[0].tipo?.nombre).pill}`}>
                          {registros[0].tipo?.nombre}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mt-5">
                    {[
                      { id: 'registros', label: 'Registros', badge: registros.length },
                      { id: 'planes', label: 'Planes Preventivos', badge: planes.length },
                      { id: 'costos', label: 'Costos', badge: 0 },
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
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
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                  {loadingDet && <div className="text-center text-sm text-slate-400 animate-pulse py-12">Cargando...</div>}

                  {/* ══ REGISTROS ══ */}
                  {!loadingDet && activeTab === 'registros' && (
                    <div className="max-w-2xl space-y-4">

                      {showRegForm && (
                        <RegistroForm
                          equipoId={selectedId}
                          tipos={tipos}
                          unidad={equipoSel.parametro?.unidad}
                          onGuardado={handleRegistroCreado}
                          onCancel={() => setShowRegForm(false)}
                        />
                      )}

                      {registros.length === 0 && !showRegForm && (
                        <div className="py-16 text-center">
                          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-sm text-slate-400 font-medium">Sin registros de mantenimiento</p>
                          <button onClick={() => setShowRegForm(true)} className="mt-3 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                            + Agregar primer registro
                          </button>
                        </div>
                      )}

                      {registros.map(r => (
                        <div key={r.id} onClick={() => setOtDrawer(r)}
                          className="bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${tipoCfg(r.tipo?.nombre).dot}`} />
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoCfg(r.tipo?.nombre).pill}`}>
                                {r.tipo?.nombre ?? '—'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">{fmtDate(r.fechaServicio)}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-slate-400 mb-0.5">Lectura</p>
                              <p className="font-bold text-slate-800 font-mono">
                                {r.lecturaActual?.toLocaleString() ?? '—'} <span className="font-normal text-slate-400">{equipoSel.parametro?.unidad ?? ''}</span>
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-slate-400 mb-0.5">Costo Total</p>
                              <p className="font-bold text-slate-800">{fmtMoney(r.costoTotal)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-slate-400 mb-0.5">ID Registro</p>
                              <p className="font-bold text-slate-800 font-mono">#{r.id}</p>
                            </div>
                          </div>

                          {r.observaciones && (
                            <p className="text-xs text-slate-500 mt-3 italic line-clamp-2">"{r.observaciones}"</p>
                          )}
                        </div>
                      ))}

                      {!showRegForm && registros.length > 0 && (
                        <button onClick={() => setShowRegForm(true)}
                          className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Agregar Registro
                        </button>
                      )}
                    </div>
                  )}

                  {/* ══ PLANES ══ */}
                  {!loadingDet && activeTab === 'planes' && (
                    <div className="max-w-2xl space-y-4">

                      {(showPlanForm || editPlan) && (
                        <PlanForm
                          equipoId={selectedId}
                          plan={editPlan}
                          unidad={equipoSel.parametro?.unidad}
                          onGuardado={handlePlanGuardado}
                          onCancel={() => { setShowPlanForm(false); setEditPlan(null); }}
                        />
                      )}

                      {planes.length === 0 && !showPlanForm && (
                        <div className="py-16 text-center">
                          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-sm text-slate-400 font-medium">Sin planes preventivos</p>
                          <button onClick={() => setShowPlanForm(true)} className="mt-3 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                            + Crear primer plan
                          </button>
                        </div>
                      )}

                      {planes.map(plan => (
                        <div key={plan.id} className="bg-white border border-slate-100 rounded-2xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                Cada {plan.frecuenciaValor} {equipoSel.parametro?.unidad ?? 'unidades'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditPlan(plan); setShowPlanForm(false); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
                              >
                                Editar
                              </button>
                              <button onClick={() => handleDeletePlan(plan.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700">{plan.descripcionTarea}</p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">Plan #{plan.id}</p>
                        </div>
                      ))}

                      {!showPlanForm && !editPlan && planes.length > 0 && (
                        <button onClick={() => setShowPlanForm(true)}
                          className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Agregar Plan
                        </button>
                      )}
                    </div>
                  )}

                  {/* ══ COSTOS ══ */}
                  {!loadingDet && activeTab === 'costos' && (
                    <div className="max-w-3xl space-y-6">
                      {/* KPIs */}
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Total Registros', value: registros.length, color: 'text-slate-900', bg: 'bg-slate-50' },
                          { label: 'Costo Total', value: fmtMoney(totalCosto), color: 'text-slate-900', bg: 'bg-slate-50' },
                          { label: 'Costo Promedio', value: registros.length ? fmtMoney(totalCosto / registros.length) : '—', color: 'text-blue-700', bg: 'bg-blue-50' },
                        ].map(k => (
                          <div key={k.label} className={`${k.bg} rounded-2xl p-5 border border-slate-200`}>
                            <p className="text-xs text-slate-500 font-medium mb-2">{k.label}</p>
                            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Desglose por tipo */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                          <h3 className="text-sm font-bold text-slate-900">Desglose por Tipo</h3>
                        </div>
                        <div className="p-5 space-y-5">
                          {porTipoLocale.map(t => {
                            const maxVal = Math.max(...porTipoLocale.map(x => x.costo), 1);
                            return (
                              <div key={t.nombre}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tipoCfg(t.nombre).pill}`}>{t.nombre}</span>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{t.count} registro{t.count !== 1 ? 's' : ''}</span>
                                    <span className="font-bold text-slate-700">{fmtMoney(t.costo)}</span>
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${tipoCfg(t.nombre).dot}`} style={{ width: `${(t.costo / maxVal) * 100}%` }} />
                                </div>
                              </div>
                            );
                          })}
                          {registros.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">Sin registros para mostrar costos</p>
                          )}
                        </div>
                      </div>

                      {/* Historial de registros con costo */}
                      {registros.filter(r => r.costoTotal != null).length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Historial de Costos</h3>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {registros.filter(r => r.costoTotal != null).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                                <div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoCfg(r.tipo?.nombre).pill}`}>{r.tipo?.nombre}</span>
                                  <span className="text-xs text-slate-400 ml-2">{fmtDate(r.fechaServicio)}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800">{fmtMoney(r.costoTotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* OT Drawer — muestra detalles de un RegistroMantenimiento */}
      {otDrawer && (
        <OTDrawer
          registro={otDrawer}
          equipo={equipoSel}
          tipos={tipos}
          onClose={() => setOtDrawer(null)}
          onUpdated={(updated) => {
            setRegistros(p => p.map(r => r.id === updated.id ? updated : r));
            setOtDrawer(null);
          }}
        />
      )}
    </div>
  );
};
