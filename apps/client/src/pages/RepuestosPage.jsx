import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Settings, Package, DollarSign, X, Plus } from 'lucide-react';

const TIPOS = ['FILTRO', 'CORREA', 'ACEITE', 'OTRO'];
const TIPO_COLORS = {
    FILTRO: 'bg-blue-100 text-blue-700',
    CORREA: 'bg-amber-100 text-amber-700',
    ACEITE: 'bg-emerald-100 text-emerald-700',
    OTRO: 'bg-slate-100 text-slate-600',
};
const TIPO_ICONS = {
    FILTRO: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    CORREA: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /></svg>,
    ACEITE: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v6m0 0v6m0-6h6m-6 0H6" /><circle cx="12" cy="12" r="3" /></svg>,
    OTRO: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
};

const FORM_EMPTY = { nombre: '', tipo: 'FILTRO', codigo: '', costo: '' };

/* ── Inline confirm delete button ── */
const DeleteBtn = ({ onConfirm }) => {
    const [confirm, setConfirm] = useState(false);
    if (confirm) return (
        <div className="flex items-center gap-1">
            <button onClick={onConfirm} className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-bold">Eliminar</button>
            <button onClick={() => setConfirm(false)} className="text-[10px] px-2 py-0.5 bg-slate-200 rounded font-bold">No</button>
        </div>
    );
    return (
        <button onClick={() => setConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    );
};

const inputCls = 'w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';
const selectCls = `${inputCls} pr-8`;

export const RepuestosPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [selectedEquipoId, setSelectedEquipoId] = useState(null);
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQ, setSearchQ] = useState(''); // Búsqueda de repuestos
    const [equipoSearch, setEquipoSearch] = useState(''); // Búsqueda de equipos
    const [tipoFilter, setTipoFilter] = useState('TODOS');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(FORM_EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const searchTimeoutRef = useRef(null);

    /* Load equipos list */
    useEffect(() => {
        fetch('/api/equipos?take=200')
            .then(r => r.json())
            .then(json => {
                const list = (json.data ?? []).sort((a, b) => (a.modelo ?? '').localeCompare(b.modelo ?? ''));
                setEquipos(list);
                if (list.length > 0) setSelectedEquipoId(list[0].id);
            });
    }, []);

    // Filtrar equipos por búsqueda
    const filteredEquipos = equipos.filter(eq => {
        if (!equipoSearch.trim()) return true;
        const search = equipoSearch.toLowerCase();
        return (
            (eq.codigo && eq.codigo.toLowerCase().includes(search)) ||
            (eq.modelo && eq.modelo.toLowerCase().includes(search)) ||
            (eq.marca?.nombre && eq.marca.nombre.toLowerCase().includes(search))
        );
    });

    /* Load repuestos for selected equipo - con debounce para búsqueda */
    useEffect(() => {
        if (!selectedEquipoId) return;

        setLoading(true);

        // Limpiar timeout anterior si existe
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Crear nuevo timeout para debounce
        searchTimeoutRef.current = setTimeout(async () => {
            const params = new URLSearchParams({ equipoId: selectedEquipoId });
            if (searchQ.trim()) params.set('q', searchQ);
            if (tipoFilter !== 'TODOS') params.set('tipo', tipoFilter);

            try {
                const res = await fetch(`/api/repuestos?${params}`);
                const json = await res.json();
                setRepuestos(json.data ?? []);
            } catch (err) {
                console.error('Error cargando repuestos:', err);
                setRepuestos([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms de debounce

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [selectedEquipoId, searchQ, tipoFilter]);

    // Limpiar búsqueda cuando se cambia de equipo
    useEffect(() => {
        setSearchQ('');
        setTipoFilter('TODOS');
        setEquipoSearch(''); // Limpiar búsqueda de equipos también
    }, [selectedEquipoId]);

    /* ── KPI per tipo (basado en todos los repuestos del equipo, no solo filtrados) ── */
    const [allRepuestos, setAllRepuestos] = useState([]);
    useEffect(() => {
        // Cargar todos los repuestos sin filtros para KPIs
        if (selectedEquipoId) {
            fetch(`/api/repuestos?equipoId=${selectedEquipoId}`)
                .then(r => r.json())
                .then(json => setAllRepuestos(json.data ?? []))
                .catch(err => console.error('Error cargando KPIs:', err));
        }
    }, [selectedEquipoId]);

    const kpi = TIPOS.map(t => ({ tipo: t, count: allRepuestos.filter(r => r.tipo === t).length }));
    const totalCosto = allRepuestos.reduce((s, r) => s + (Number(r.costo) || 0), 0);

    const resetForm = () => { setForm(FORM_EMPTY); setEditId(null); setShowForm(false); setError(null); };

    const handleEdit = (r) => {
        setForm({ nombre: r.nombre, tipo: r.tipo, codigo: r.codigo ?? '', costo: r.costo != null ? String(r.costo) : '' });
        setEditId(r.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
        setSaving(true); setError(null);
        try {
            const url = editId ? `/api/repuestos/${editId}` : '/api/repuestos';
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, equipoId: selectedEquipoId, costo: form.costo !== '' ? Number(form.costo) : null }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);

            // Recargar lista actual con filtros aplicados
            const params = new URLSearchParams({ equipoId: selectedEquipoId });
            if (searchQ.trim()) params.set('q', searchQ);
            if (tipoFilter !== 'TODOS') params.set('tipo', tipoFilter);

            const reloadRes = await fetch(`/api/repuestos?${params}`);
            const reloadJson = await reloadRes.json();
            setRepuestos(reloadJson.data ?? []);

            // Recargar KPIs (sin filtros)
            const kpiRes = await fetch(`/api/repuestos?equipoId=${selectedEquipoId}`);
            const kpiJson = await kpiRes.json();
            setAllRepuestos(kpiJson.data ?? []);

            resetForm();
        } catch (e) { setError(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        await fetch(`/api/repuestos/${id}`, { method: 'DELETE' });
        setRepuestos(p => p.filter(r => r.id !== id));
        // También actualizar allRepuestos para KPIs
        setAllRepuestos(p => p.filter(r => r.id !== id));
    };

    const equipo = equipos.find(e => e.id === selectedEquipoId);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title="Repuestos"
                    subtitle="Gestión de repuestos por equipo"
                    showSearch={false}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    notifications={[]}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* ── LEFT: equipo selector ── */}
                    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col overflow-hidden shrink-0">
                        <div className="p-3 border-b border-slate-100">
                            <input
                                type="text"
                                value={equipoSearch}
                                onChange={(e) => setEquipoSearch(e.target.value)}
                                placeholder="Buscar equipo por código, nombre o marca..."
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredEquipos.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-xs">
                                    No se encontraron equipos
                                </div>
                            ) : (
                                filteredEquipos.map(eq => {
                                    const repCount = repuestos.length > 0 && selectedEquipoId === eq.id ? repuestos.length : null;
                                    return (
                                        <div
                                            key={eq.id}
                                            onClick={() => { setSelectedEquipoId(eq.id); setShowForm(false); resetForm(); }}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 ${selectedEquipoId === eq.id
                                                    ? 'bg-slate-50 border-slate-900 text-slate-900'
                                                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{eq.modelo ?? eq.codigo}</p>
                                                <div className="flex items-center gap-2">
                                                    {eq.codigo && <p className="text-[10px] text-slate-400 font-mono truncate">{eq.codigo}</p>}
                                                    {eq.marca?.nombre && <p className="text-[9px] text-slate-300 truncate">{eq.marca.nombre}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {/* ── RIGHT: repuestos panel ── */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{equipo?.modelo ?? 'Selecciona un equipo'}</h2>
                                {equipo?.codigo && <p className="text-sm text-slate-400 font-mono">{equipo.codigo}</p>}
                            </div>
                            <button
                                onClick={() => { setShowForm(v => !v); if (showForm) resetForm(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                            >
                                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span>{showForm ? 'Cancelar' : 'Agregar Repuesto'}</span>
                            </button>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-5 gap-3">
                            {kpi.map(k => (
                                <div key={k.tipo} className={`rounded-xl p-3 text-center border ${TIPO_COLORS[k.tipo] ?? 'bg-slate-100 text-slate-600'} border-transparent`}>
                                    <div className="text-xl flex justify-center text-slate-700">{React.cloneElement(TIPO_ICONS[k.tipo])}</div>
                                    <p className="text-lg font-bold mt-1">{k.count}</p>
                                    <p className="text-[10px] font-semibold">{k.tipo.charAt(0) + k.tipo.slice(1).toLowerCase()}</p>
                                </div>
                            ))}
                            <div className="rounded-xl p-3 text-center bg-slate-100 border border-slate-200">
                                <div className="text-xl flex justify-center text-slate-700">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <p className="text-base font-bold mt-1 text-slate-900">${totalCosto.toFixed(0)}</p>
                                <p className="text-[10px] font-semibold text-slate-500">Total</p>
                            </div>
                        </div>

                        {/* Form */}
                        {showForm && (
                            <div className="border border-blue-200 rounded-2xl p-5 bg-blue-50/30 space-y-3">
                                <p className="text-sm font-bold text-slate-900">{editId ? 'Editar Repuesto' : 'Agregar Repuesto'}</p>
                                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre del repuesto</label>
                                        <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Filtro de aceite HF-101" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
                                        <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={selectCls}>
                                            {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Código / Referencia</label>
                                        <input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ej: HF-101" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Costo unitario ($)</label>
                                        <input type="number" min="0" step="0.01" value={form.costo} onChange={e => setForm(p => ({ ...p, costo: e.target.value }))} placeholder="0.00" className={inputCls} />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors">
                                        {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Agregar'}
                                    </button>
                                    <button onClick={resetForm} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                                placeholder="Buscar repuesto..."
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white flex-1 max-w-xs"
                            />
                            <div className="flex gap-1">
                                {['TODOS', ...TIPOS].map(t => (
                                    <button key={t} onClick={() => setTipoFilter(t)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tipoFilter === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                                    >{t === 'TODOS' ? 'Todos' : t.charAt(0) + t.slice(1).toLowerCase()}</button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Cargando repuestos...</div>
                        ) : repuestos.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-4xl mb-3 flex justify-center text-slate-300">
                                    <Package className="w-12 h-12" />
                                </div>
                                <p className="text-slate-400 text-sm">{allRepuestos.length === 0 ? 'Sin repuestos registrados para este equipo' : 'Sin resultados para los filtros aplicados'}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {repuestos.map(r => (
                                    <div key={r.id} className="flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                                        <span className="text-xl shrink-0 flex justify-center text-slate-700">{React.cloneElement(TIPO_ICONS[r.tipo] || TIPO_ICONS.OTRO)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-800">{r.nombre}</p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${TIPO_COLORS[r.tipo] ?? 'bg-slate-100 text-slate-600'}`}>{r.tipo}</span>
                                            </div>
                                            {r.codigo && <p className="text-[10px] text-slate-400 font-mono">{r.codigo}</p>}
                                        </div>
                                        {r.costo != null && (
                                            <span className="text-sm font-bold text-emerald-700 shrink-0">${Number(r.costo).toFixed(2)}</span>
                                        )}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <DeleteBtn onConfirm={() => handleDelete(r.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
