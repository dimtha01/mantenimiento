import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Settings, Package, DollarSign, X, Plus } from 'lucide-react';

const FORM_EMPTY = { nombre: '', tipoRepuestoId: '', codigo: '', costo: '' };

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
    const [tiposRepuesto, setTiposRepuesto] = useState([]); // Catálogo de tipos
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(FORM_EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const searchTimeoutRef = useRef(null);

    /* Load catálogos */
    useEffect(() => {
        // Cargar tipos de repuesto
        fetch('/api/catalogos/tipos-repuestos')
            .then(r => r.json())
            .then(json => setTiposRepuesto(json.data ?? []))
            .catch(err => console.error('Error cargando tipos de repuesto:', err));
    }, []);

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
            if (tipoFilter !== 'TODOS') params.set('tipoRepuestoId', tipoFilter);

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

    // Solo mostrar KPIs para tipos que tienen repuestos
    const kpi = tiposRepuesto
        .map(t => ({ tipo: t, count: allRepuestos.filter(r => r.tipoRepuestoId === t.id).length }))
        .filter(k => k.count > 0); // Solo tipos con repuestos

    const totalCosto = allRepuestos.reduce((s, r) => s + (Number(r.costo) || 0), 0);

    // Función para recargar tipos de repuesto
    const recargarTiposRepuesto = async () => {
        try {
            const res = await fetch('/api/catalogos/tipos-repuestos');
            const json = await res.json();
            if (json.ok) {
                setTiposRepuesto(json.data ?? []);
            }
        } catch (err) {
            console.error('Error recargando tipos:', err);
        }
    };

    const resetForm = () => { setForm(FORM_EMPTY); setEditId(null); setShowForm(false); setError(null); };

    const handleEdit = (r) => {
        setForm({
            nombre: r.nombre,
            tipoRepuestoId: r.tipoRepuesto ? r.tipoRepuesto.nombre : '',
            codigo: r.codigo ?? '',
            costo: r.costo != null ? String(r.costo) : ''
        });
        setEditId(r.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }

        setSaving(true); setError(null);
        try {
            // Si el tipoRepuestoId no es un número válido, buscar o crear el tipo
            let tipoRepuestoIdFinal = null;
            if (form.tipoRepuestoId && form.tipoRepuestoId.trim()) {
                const valor = form.tipoRepuestoId.trim();

                // Si es un número, usarlo directamente
                if (/^\d+$/.test(valor)) {
                    tipoRepuestoIdFinal = Number(valor);
                } else {
                    // Es un nombre, buscar si existe
                    const tipoExistente = tiposRepuesto.find(t => t.nombre.toLowerCase() === valor.toLowerCase());

                    if (tipoExistente) {
                        tipoRepuestoIdFinal = tipoExistente.id;
                    } else {
                        // Crear nuevo tipo
                        const tipoRes = await fetch('/api/catalogos/tipos-repuestos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nombre: valor }),
                        });
                        const tipoJson = await tipoRes.json();

                        if (!tipoJson.ok || !tipoJson.data) {
                            throw new Error(tipoJson.message || 'Error al crear tipo de repuesto');
                        }

                        tipoRepuestoIdFinal = tipoJson.data.id;

                        // Recargar tipos después de crear uno nuevo
                        await recargarTiposRepuesto();
                    }
                }
            }

            const url = editId ? `/api/repuestos/${editId}` : '/api/repuestos';
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.nombre,
                    equipoId: selectedEquipoId,
                    tipoRepuestoId: tipoRepuestoIdFinal,
                    codigo: form.codigo || null,
                    costo: form.costo !== '' ? Number(form.costo) : null
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);

            // Recargar lista actual con filtros aplicados
            const params = new URLSearchParams({ equipoId: selectedEquipoId });
            if (searchQ.trim()) params.set('q', searchQ);
            if (tipoFilter !== 'TODOS') params.set('tipoRepuestoId', tipoFilter);

            const reloadRes = await fetch(`/api/repuestos?${params}`);
            const reloadJson = await reloadRes.json();
            setRepuestos(reloadJson.data ?? []);

            // Recargar KPIs (sin filtros)
            const kpiRes = await fetch(`/api/repuestos?equipoId=${selectedEquipoId}`);
            const kpiJson = await kpiRes.json();
            setAllRepuestos(kpiJson.data ?? []);

            setShowForm(false);
            resetForm();
        } catch (e) {
            console.error('Error en handleSave:', e);
            setError(e.message || 'Error al guardar repuesto');
        } finally {
            setSaving(false);
        }
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
                                <div key={k.tipo.id} className="rounded-xl p-3 text-center border bg-slate-50 border-slate-200">
                                    <div className="text-xl flex justify-center text-slate-700">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <p className="text-lg font-bold mt-1">{k.count}</p>
                                    <p className="text-[10px] font-semibold text-slate-600 truncate">{k.tipo.nombre}</p>
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

                        {/* Formulario Modal */}
                        {showForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                />
                                {/* Modal */}
                                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{editId ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{equipo?.modelo ?? 'Equipo'}</p>
                                        </div>
                                        <button
                                            onClick={() => { setShowForm(false); resetForm(); }}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del repuesto *</label>
                                            <input
                                                value={form.nombre}
                                                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                                                placeholder="Ej: Filtro de aceite HF-101"
                                                className={inputCls}
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo</label>
                                            <input
                                                value={form.tipoRepuestoId}
                                                onChange={e => setForm(p => ({ ...p, tipoRepuestoId: e.target.value }))}
                                                placeholder="Ej: Filtro, Correa, Aceite..."
                                                list="tipos-repuestos-list"
                                                className={inputCls}
                                            />
                                            <datalist id="tipos-repuestos-list">
                                                {tiposRepuesto.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </datalist>
                                            <p className="text-xs text-slate-400 mt-1">Escribe para buscar o selecciona un tipo existente</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Código</label>
                                                <input
                                                    value={form.codigo}
                                                    onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))}
                                                    placeholder="Ej: HF-101"
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Costo unitario ($)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.costo}
                                                    onChange={e => setForm(p => ({ ...p, costo: e.target.value }))}
                                                    placeholder="0.00"
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {saving && (
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0 2.22-.796 4.267-2.118 5.871l-2.828-2.829A7.966 7.966 0 014 12c0 .792-.102 1.561-.291 2.291z"></path>
                                                    </svg>
                                                )}
                                                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Guardar'}
                                            </button>
                                            <button
                                                onClick={() => { setShowForm(false); resetForm(); }}
                                                className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
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
                            <div className="flex gap-1 flex-wrap">
                                <button
                                    key="TODOS"
                                    onClick={() => setTipoFilter('TODOS')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tipoFilter === 'TODOS' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                                >Todos</button>
                                {tiposRepuesto
                                    .filter(t => allRepuestos.some(r => r.tipoRepuestoId === t.id))
                                    .slice(0, 4) // Máximo 4 tipos
                                    .map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTipoFilter(String(t.id))}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tipoFilter === String(t.id) ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                                    >{t.nombre}</button>
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
                                        <span className="text-xl shrink-0 flex justify-center text-slate-700">
                                            <Package className="w-5 h-5" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-800">{r.nombre}</p>
                                                {r.tipoRepuesto && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 bg-blue-100 text-blue-700">
                                                        {r.tipoRepuesto.nombre}
                                                    </span>
                                                )}
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
