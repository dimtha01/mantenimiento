// DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

/* ─── Helpers ───────────────────────────────────────── */
const fmt$ = (n) => n != null ? `$${Number(n).toLocaleString('es-VE', { minimumFractionDigits: 0 })}` : '$0';
const fmtN = (n) => Number(n ?? 0).toLocaleString('es-VE');
const fmtDt = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) : '—';

const TIPO_COLOR = {
  PREVENTIVO: { pill: 'bg-indigo-100 text-indigo-700', bar: '#6366f1', dot: 'bg-indigo-500' },
  CORRECTIVO: { pill: 'bg-amber-100 text-amber-700', bar: '#f59e0b', dot: 'bg-amber-500' },
  PREDICTIVO: { pill: 'bg-cyan-100 text-cyan-700', bar: '#06b6d4', dot: 'bg-cyan-500' },
};
const tc = (n) => TIPO_COLOR[n] ?? { pill: 'bg-slate-100 text-slate-600', bar: '#94a3b8', dot: 'bg-slate-400' };

/* ─── Mini bar chart ────────────────────────────────── */
const SparkBars = ({ data }) => {
  if (!data?.length) return (
    <div className="h-24 flex items-end justify-center gap-0.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex-1 bg-slate-100 rounded-sm" style={{ height: `${Math.random() * 60 + 10}%`, opacity: 0.3 }} />
      ))}
    </div>
  );
  const max = Math.max(...data.map(d => d.cantidad), 1);
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm bg-slate-800 transition-all hover:bg-slate-600"
            style={{ height: `${(d.cantidad / max) * 88}%`, minHeight: d.cantidad > 0 ? 3 : 0 }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            {d.mes}: {d.cantidad}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Donut chart ───────────────────────────────────── */
const Donut = ({ porTipo }) => {
  const total = porTipo.reduce((s, t) => s + t.count, 0) || 1;
  const R = 52, CX = 60, CY = 60, SW = 14;
  const circum = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[120px] h-[120px] shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
          {porTipo.map((t, i) => {
            const pct = t.count / total;
            const dash = pct * circum;
            const rot = acc * 360;
            acc += pct;
            return (
              <circle key={i}
                cx={CX} cy={CY} r={R} fill="none"
                stroke={tc(t.tipo).bar} strokeWidth={SW - 1}
                strokeDasharray={`${dash} ${circum - dash}`}
                strokeDashoffset={circum * 0.25}
                strokeLinecap="butt"
                transform={`rotate(${rot} ${CX} ${CY})`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black text-slate-900 leading-none">{fmtN(total)}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">registros</p>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 min-w-0">
        {porTipo.map(t => (
          <div key={t.tipo}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${tc(t.tipo).dot}`} />
                <span className="text-xs text-slate-600 font-medium">{t.tipo}</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{Math.round((t.count / total) * 100)}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(t.count / total) * 100}%`, backgroundColor: tc(t.tipo).bar }} />
            </div>
          </div>
        ))}
        {!porTipo.length && <p className="text-xs text-slate-400">Sin registros</p>}
      </div>
    </div>
  );
};

/* ─── KPI card ──────────────────────────────────────── */
const KPI = ({ label, value, sub, icon, dark, alert }) => (
  <div className={`rounded-xl p-4 border ${dark ? 'bg-slate-900 text-white border-slate-800' : alert ? 'bg-red-50 border-red-100 text-slate-900' : 'bg-white border-slate-200 text-slate-900'}`}>
    <div className="flex items-start justify-between mb-3">
      <span className={`text-xs font-medium ${dark ? 'text-slate-400' : alert ? 'text-red-500' : 'text-slate-500'}`}>{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-white/10' : alert ? 'bg-red-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-black leading-none mb-1 ${alert ? 'text-red-700' : ''}`}>{value}</p>
    {sub && <p className={`text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
  </div>
);

/* ─── Página ────────────────────────────────────────── */
export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setData(json.data);
    } catch (e) {
      setError(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const k = data?.kpis ?? {};
  const porT = data?.porTipo ?? [];
  const porM = data?.porMes ?? [];
  const topE = data?.topEquipos ?? [];
  const ult = data?.ultimosRegistros ?? [];
  const maxE = topE[0]?.count ?? 1;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Resumen en tiempo real del sistema de mantenimiento"
          showSearch={false}
          actionButton={
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors">
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-red-700 font-medium">{error}</span>
              <button onClick={load} className="ml-auto text-xs font-bold text-red-600 hover:text-red-800 underline">Reintentar</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
            </div>
          )}

          {!loading && data && (<>

            {/* ══ KPIs ══ */}
            <div className="grid grid-cols-4 gap-4">
              <KPI dark
                label="Costo Total Mantenimientos"
                value={fmt$(k.costoTotal)}
                sub={`Este mes: ${fmt$(k.costoMes)}`}
                icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <KPI
                label="Registros de Mantenimiento"
                value={fmtN(k.totalMantenimientos)}
                sub={`${k.mantenimientosMes ?? 0} este mes`}
                icon={<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <KPI
                label="Equipos Registrados"
                value={fmtN(k.totalEquipos)}
                sub={`${k.totalPlanes ?? 0} planes preventivos`}
                icon={<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              />
              <KPI
                alert={k.certsVencidas > 0}
                label="Certificaciones Vencidas"
                value={fmtN(k.certsVencidas)}
                sub={`${k.certsPorVencer ?? 0} vencen en ≤30 días`}
                icon={<svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              />
            </div>

            {/* ══ Fila central ══ */}
            <div className="grid grid-cols-3 gap-5">

              {/* Actividad mensual (2 cols) */}
              <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Actividad Mensual</h3>
                    <p className="text-xs text-slate-400">Registros últimos 12 meses</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {porM.length > 0 && <span className="font-semibold text-slate-600">{porM.reduce((s, m) => s + m.cantidad, 0)} total</span>}
                  </div>
                </div>
                <SparkBars data={porM} />
                {/* Eje X: primero y último mes */}
                {porM.length > 1 && (
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-300">{porM[0].mes}</span>
                    <span className="text-[10px] text-slate-300">{porM[porM.length - 1].mes}</span>
                  </div>
                )}
              </div>

              {/* Distribución por tipo (1 col) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Distribución</h3>
                <p className="text-xs text-slate-400 mb-4">Por tipo de mantenimiento</p>
                <Donut porTipo={porT} />
              </div>
            </div>

            {/* ══ Fila inferior ══ */}
            <div className="grid grid-cols-2 gap-5">

              {/* Últimos registros */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Últimos Registros</h3>
                  <a href="/mantenimiento" className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors">Ver todos →</a>
                </div>
                <div className="divide-y divide-slate-50">
                  {ult.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Sin registros</p>}
                  {ult.map(r => (
                    <div key={r.id} className="flex items-center px-5 py-2.5 gap-3 hover:bg-slate-50 transition-colors">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${tc(r.tipo?.nombre).dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{r.equipo?.codigo ?? `#${r.equipoId}`}</p>
                        <p className="text-[11px] text-slate-400 truncate">{r.tipo?.nombre} · {r.equipo?.marca?.nombre ?? ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">{fmtDt(r.fechaServicio)}</p>
                        {r.costoTotal != null && <p className="text-xs font-bold text-slate-700">{fmt$(r.costoTotal)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top equipos */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Top Equipos</h3>
                  <a href="/equipos" className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors">Ver todos →</a>
                </div>
                <div className="divide-y divide-slate-50">
                  {topE.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Sin datos</p>}
                  {topE.map((item, i) => (
                    <div key={item.equipo?.id ?? i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-300 tabular-nums w-4">#{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{item.equipo?.codigo ?? `Equipo ${i + 1}`}</p>
                            <p className="text-[10px] text-slate-400">{item.equipo?.marca?.nombre ?? ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">{item.count} reg.</p>
                          <p className="text-[10px] text-slate-400">{fmt$(item.costo)}</p>
                        </div>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${(item.count / maxE) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </>)}

          {/* Vacío */}
          {!loading && !error && !data && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-3">Sin datos</p>
                <button onClick={load} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Cargar</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
