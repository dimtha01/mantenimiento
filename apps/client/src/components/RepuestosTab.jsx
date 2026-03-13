import { useState, useEffect, useCallback } from 'react';

const TIPOS = ['FILTRO', 'CORREA', 'ACEITE', 'OTRO'];

const inputCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';
const selectCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

const TIPO_COLORS = {
    FILTRO: 'bg-blue-100 text-blue-700',
    CORREA: 'bg-yellow-100 text-yellow-700',
    ACEITE: 'bg-orange-100 text-orange-700',
    OTRO: 'bg-slate-100 text-slate-600',
};

export const RepuestosTab = ({ equipoId }) => {
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nombre: '', tipo: 'OTRO', codigo: '', costo: '' });
    const [error, setError] = useState(null);

    const fetchRepuestos = useCallback(async () => {
        if (!equipoId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/repuestos?equipoId=${equipoId}`);
            const json = await res.json();
            if (json.ok) setRepuestos(json.data);
        } catch (e) {
            console.error('Error cargando repuestos:', e);
        } finally {
            setLoading(false);
        }
    }, [equipoId]);

    useEffect(() => { fetchRepuestos(); }, [fetchRepuestos]);

    const resetForm = () => {
        setForm({ nombre: '', tipo: 'OTRO', codigo: '', costo: '' });
        setEditId(null);
        setShowForm(false);
        setError(null);
    };

    const handleEdit = (r) => {
        setForm({ nombre: r.nombre, tipo: r.tipo, codigo: r.codigo || '', costo: r.costo ?? '' });
        setEditId(r.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
        setSaving(true);
        setError(null);
        try {
            const url = editId ? `/api/repuestos/${editId}` : '/api/repuestos';
            const method = editId ? 'PUT' : 'POST';
            const body = editId
                ? { nombre: form.nombre, tipo: form.tipo, codigo: form.codigo || null, costo: form.costo !== '' ? Number(form.costo) : null }
                : { equipoId, nombre: form.nombre, tipo: form.tipo, codigo: form.codigo || null, costo: form.costo !== '' ? Number(form.costo) : null };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);
            await fetchRepuestos();
            resetForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este repuesto?')) return;
        try {
            await fetch(`/api/repuestos/${id}`, { method: 'DELETE' });
            await fetchRepuestos();
        } catch (e) {
            console.error('Error eliminando repuesto:', e);
        }
    };

    return (
        <div className="px-6 py-4 space-y-3">
            {/* KPI */}
            <div className="grid grid-cols-4 gap-2">
                {TIPOS.map(t => (
                    <div key={t} className={`border rounded-lg p-2 text-center ${TIPO_COLORS[t]}`}>
                        <p className="text-xl font-bold">{repuestos.filter(r => r.tipo === t).length}</p>
                        <p className="text-[10px] font-semibold mt-0.5 capitalize">{t.charAt(0) + t.slice(1).toLowerCase()}</p>
                    </div>
                ))}
            </div>

            {/* Lista */}
            {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Cargando repuestos...</div>
            ) : repuestos.length === 0 && !showForm ? (
                <div className="py-8 text-center">
                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    <p className="text-sm text-slate-400">Sin repuestos registrados</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {repuestos.map(r => (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${TIPO_COLORS[r.tipo] ?? 'bg-slate-100 text-slate-600'}`}>{r.tipo}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{r.nombre}</p>
                                    {r.codigo && <p className="text-[10px] text-slate-400 font-mono">{r.codigo}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {r.costo != null && (
                                    <span className="text-sm font-bold text-emerald-700">${Number(r.costo).toFixed(2)}</span>
                                )}
                                <button onClick={() => handleEdit(r)} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulario */}
            {showForm ? (
                <div className="border border-blue-200 rounded-2xl p-4 space-y-3 bg-blue-50/30">
                    <p className="text-sm font-bold text-slate-900">{editId ? 'Editar Repuesto' : 'Nuevo Repuesto'}</p>
                    {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre *</label>
                            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Filtro de aceite HF-101" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
                            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={selectCls}>
                                {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Código / Ref.</label>
                            <input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ej: HF-101" className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Costo Unitario ($)</label>
                            <input type="number" min="0" step="0.01" value={form.costo} onChange={e => setForm(p => ({ ...p, costo: e.target.value }))} placeholder="Ej: 45.00" className={inputCls} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors">
                            {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Agregar Repuesto'}
                        </button>
                        <button onClick={resetForm} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Agregar Repuesto
                </button>
            )}
        </div>
    );
};
