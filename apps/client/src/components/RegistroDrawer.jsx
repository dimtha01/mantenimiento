import { useState, useEffect } from 'react';

const TIPO_CFG = {
    PREVENTIVO: { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    CORRECTIVO: { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    PREDICTIVO: { pill: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
};
const tipoCfg = (nombre) => TIPO_CFG[nombre] ?? { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

export const RegistroDrawer = ({ registro, equipo, tipos = [], onClose, onUpdated }) => {
    const [visible, setVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState(null);

    const [form, setForm] = useState({
        tipoId: registro?.tipoId ?? '',
        fechaServicio: registro?.fechaServicio ? registro.fechaServicio.split('T')[0] : '',
        lecturaActual: registro?.lecturaActual ?? '',
        observaciones: registro?.observaciones ?? '',
        costoManoObra: registro?.costoManoObra ?? '',
        costoServicios: registro?.costoServicios ?? '',
        costoRepuestos: registro?.costoRepuestos ?? '',
    });

    const calculatedTotal = (Number(form.costoManoObra) || 0) + (Number(form.costoServicios) || 0) + (Number(form.costoRepuestos) || 0);

    useEffect(() => {
        if (registro) {
            setForm({
                tipoId: registro.tipoId ?? '',
                fechaServicio: registro.fechaServicio ? registro.fechaServicio.split('T')[0] : '',
                lecturaActual: registro.lecturaActual ?? '',
                observaciones: registro.observaciones ?? '',
                costoManoObra: registro.costoManoObra ?? '',
                costoServicios: registro.costoServicios ?? '',
                costoRepuestos: registro.costoRepuestos ?? '',
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
                    costoManoObra: form.costoManoObra !== '' ? Number(form.costoManoObra) : null,
                    costoServicios: form.costoServicios !== '' ? Number(form.costoServicios) : null,
                    costoRepuestos: form.costoRepuestos !== '' ? Number(form.costoRepuestos) : null,
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

    const costoTotal = (Number(registro.costoManoObra) || 0) + (Number(registro.costoServicios) || 0) + (Number(registro.costoRepuestos) || 0);

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
                        <span className="font-bold text-slate-700">Detalle</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                            >
                                <span className="flex items-center gap-1.5 flex-1 justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Editar
                                </span>
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
                                <span className="text-xs text-slate-400 font-mono ml-auto">{fmtDate(registro.fechaServicio)}</span>
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

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lectura {unidad ? `(${unidad})` : ''}</label>
                                    <input type="number" min="0" value={form.lecturaActual} onChange={e => setForm(p => ({ ...p, lecturaActual: e.target.value }))} className={inputCls} />
                                </div>

                                {/* Costos separados */}
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desglose de Costos</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Mano de Obra</label>
                                            <input type="number" min="0" step="0.01" value={form.costoManoObra} onChange={e => setForm(p => ({ ...p, costoManoObra: e.target.value }))} placeholder="$0.00" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Servicios</label>
                                            <input type="number" min="0" step="0.01" value={form.costoServicios} onChange={e => setForm(p => ({ ...p, costoServicios: e.target.value }))} placeholder="$0.00" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Repuestos</label>
                                            <input type="number" min="0" step="0.01" value={form.costoRepuestos} onChange={e => setForm(p => ({ ...p, costoRepuestos: e.target.value }))} placeholder="$0.00" className={inputCls} />
                                        </div>
                                    </div>
                                    {calculatedTotal > 0 && (
                                        <div className="mt-2 p-2 bg-slate-100 rounded-lg flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-600">Total Calculado:</span>
                                            <span className="text-sm font-bold text-slate-900">${calculatedTotal.toLocaleString()}</span>
                                        </div>
                                    )}
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
                                    { label: 'Tipo', value: registro.tipo?.nombre ?? '—' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                                        <span className="text-xs text-slate-400 font-medium">{label}</span>
                                        <span className="text-sm font-semibold text-slate-800">{value}</span>
                                    </div>
                                ))}

                                {/* Desglose de costos */}
                                <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Desglose de Costos</p>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mano de Obra</p>
                                            <p className="text-sm font-bold text-slate-800">{fmtMoney(registro.costoManoObra)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Servicios</p>
                                            <p className="text-sm font-bold text-slate-800">{fmtMoney(registro.costoServicios)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Repuestos</p>
                                            <p className="text-sm font-bold text-slate-800">{fmtMoney(registro.costoRepuestos)}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-600">Total</span>
                                        <span className="text-lg font-black text-slate-900">{fmtMoney(costoTotal > 0 ? costoTotal : registro.costoTotal)}</span>
                                    </div>
                                </div>

                                {registro.observaciones && (
                                    <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Observaciones</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{registro.observaciones}</p>
                                    </div>
                                )}

                                {/* Repuestos Utilizados */}
                                {registro.repuestos && registro.repuestos.length > 0 && (
                                    <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Repuestos Utilizados</p>
                                        <div className="space-y-2">
                                            {registro.repuestos.map((rr, idx) => (
                                                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{rr.repuesto?.nombre || 'Repuesto'}</p>
                                                        {rr.repuesto?.codigo && (
                                                            <p className="text-[10px] text-slate-400 font-mono">{rr.repuesto.codigo}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                            x{rr.cantidad}
                                                        </span>
                                                        {rr.repuesto?.costo && (
                                                            <span className="text-sm font-bold text-emerald-600">
                                                                ${(Number(rr.repuesto.costo) * rr.cantidad).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-600">Total repuestos:</span>
                                                <span className="font-bold text-slate-900">
                                                    ${registro.repuestos.reduce((sum, rr) => {
                                                        return sum + (Number(rr.repuesto?.costo) || 0) * rr.cantidad;
                                                    }, 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Columna lateral: metadata */}
                    <div className="w-56 shrink-0 border-l border-slate-100 bg-slate-50/50 overflow-y-auto px-5 py-6 space-y-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información</p>

                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tipo</p>
                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.pill}`}>
                                {registro.tipo?.nombre ?? '—'}
                            </span>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Equipo</p>
                            <p className="text-sm font-semibold text-slate-700">{equipo?.codigo ?? '—'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{equipo?.marca?.nombre ?? ''} {equipo?.modelo ?? ''}</p>
                        </div>

                        {equipo?.ubicacion?.nombre && (
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ubicación</p>
                                <p className="text-sm font-semibold text-slate-700">{equipo.ubicacion.nombre}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fecha Servicio</p>
                            <p className="text-sm font-semibold text-slate-700">{fmtDate(registro.fechaServicio)}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Lectura {unidad ? `(${unidad})` : ''}
                            </p>
                            <p className="text-lg font-black text-slate-800 font-mono">
                                {registro.lecturaActual != null ? registro.lecturaActual.toLocaleString() : '—'}
                            </p>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Costo Total</p>
                            <p className={`text-2xl font-black ${costoTotal > 0 || registro.costoTotal != null ? 'text-slate-900' : 'text-slate-300'}`}>
                                {fmtMoney(costoTotal > 0 ? costoTotal : registro.costoTotal)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-7 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
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
