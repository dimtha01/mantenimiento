// OTDrawer.jsx — Detalle de un RegistroMantenimiento real
// Permite ver y editar los campos del registro, y agregar observaciones.
import { useState, useEffect } from 'react';

const TIPO_CFG = {
  PREVENTIVO: { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  CORRECTIVO: { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  PREDICTIVO: { pill: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
};
const tipoCfg = (nombre) => TIPO_CFG[nombre] ?? { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

export const OTDrawer = ({ registro, equipo, tipos = [], onClose, onUpdated }) => {
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  const [form, setForm] = useState({
    tipoId: registro?.tipoId ?? '',
    fechaServicio: registro?.fechaServicio ? registro.fechaServicio.split('T')[0] : '',
    lecturaActual: registro?.lecturaActual ?? '',
    observaciones: registro?.observaciones ?? '',
    costoTotal: registro?.costoTotal ?? '',
  });

  useEffect(() => {
    if (registro) {
      setForm({
        tipoId: registro.tipoId ?? '',
        fechaServicio: registro.fechaServicio ? registro.fechaServicio.split('T')[0] : '',
        lecturaActual: registro.lecturaActual ?? '',
        observaciones: registro.observaciones ?? '',
        costoTotal: registro.costoTotal ?? '',
      });
      setEditMode(false);
      setSaveErr(null);
      setTimeout(() => setVisible(true), 10);
    }
  }, [registro]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await fetch(`/api/mantenimientos/${registro.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoId: Number(form.tipoId),
          fechaServicio: form.fechaServicio,
          lecturaActual: Number(form.lecturaActual),
          observaciones: form.observaciones || null,
          costoTotal: form.costoTotal !== '' ? Number(form.costoTotal) : null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onUpdated(json.data);
    } catch (e) {
      setSaveErr(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!registro) return null;

  const cfg = tipoCfg(registro.tipo?.nombre);
  const unidad = equipo?.parametro?.unidad ?? '';
  const inputCls = 'w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[700px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mantenimiento</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span>Registros</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="font-bold text-slate-700">#{registro.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
              >
                ✏️ Editar
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex">

          {/* Columna principal */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">

            {/* Badges + título */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.pill}`}>
                  {registro.tipo?.nombre ?? '—'}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-auto">Registro #{registro.id}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {registro.observaciones
                  ? registro.observaciones.length > 80
                    ? `${registro.observaciones.slice(0, 80)}…`
                    : registro.observaciones
                  : `Mantenimiento ${registro.tipo?.nombre ?? ''} — ${fmtDate(registro.fechaServicio)}`}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {equipo?.codigo} · {equipo?.marca?.nombre ?? ''} · {equipo?.modelo ?? ''}
              </p>
            </div>

            {/* Formulario de edición / vista */}
            {editMode ? (
              <div className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editar Registro</p>
                {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}

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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lectura {unidad ? `(${unidad})` : ''}</label>
                    <input type="number" min="0" value={form.lecturaActual} onChange={e => setForm(p => ({ ...p, lecturaActual: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Costo Total ($)</label>
                    <input type="number" min="0" step="0.01" value={form.costoTotal} onChange={e => setForm(p => ({ ...p, costoTotal: e.target.value }))} placeholder="Opcional" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                  <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Detalles del servicio realizado..." />
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60">
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button onClick={() => { setEditMode(false); setSaveErr(null); }} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Vista detalle */
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                {[
                  { label: 'Fecha de Servicio', value: fmtDate(registro.fechaServicio) },
                  { label: `Lectura ${unidad ? `(${unidad})` : ''}`, value: registro.lecturaActual != null ? `${registro.lecturaActual.toLocaleString()} ${unidad}` : '—' },
                  { label: 'Costo Total', value: fmtMoney(registro.costoTotal) },
                  { label: 'Tipo', value: registro.tipo?.nombre ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
                {registro.observaciones && (
                  <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Observaciones</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{registro.observaciones}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna lateral: metadata */}
          <div className="w-56 shrink-0 border-l border-slate-100 bg-slate-50/50 overflow-y-auto px-5 py-6 space-y-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información</p>

            {/* Tipo */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tipo</p>
              <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.pill}`}>
                {registro.tipo?.nombre ?? '—'}
              </span>
            </div>

            {/* Equipo */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Equipo</p>
              <p className="text-sm font-semibold text-slate-700">{equipo?.codigo ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{equipo?.marca?.nombre ?? ''} {equipo?.modelo ?? ''}</p>
            </div>

            {/* Ubicación */}
            {equipo?.ubicacion?.nombre && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ubicación</p>
                <p className="text-sm font-semibold text-slate-700">{equipo.ubicacion.nombre}</p>
              </div>
            )}

            {/* Fecha */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fecha Servicio</p>
              <p className="text-sm font-semibold text-slate-700">{fmtDate(registro.fechaServicio)}</p>
            </div>

            {/* Lectura */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Lectura {unidad ? `(${unidad})` : ''}
              </p>
              <p className="text-lg font-black text-slate-800 font-mono">
                {registro.lecturaActual != null ? registro.lecturaActual.toLocaleString() : '—'}
              </p>
            </div>

            {/* Costo */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Costo Total</p>
              <p className={`text-2xl font-black ${registro.costoTotal != null ? 'text-slate-900' : 'text-slate-300'}`}>
                {fmtMoney(registro.costoTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-7 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">ID: #{registro.id}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};
