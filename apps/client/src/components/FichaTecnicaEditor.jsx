// FichaTecnicaEditor.jsx
// Formulario dinámico para gestionar pares clave-valor de la ficha técnica de un equipo.
import { useState, useEffect, useCallback } from 'react';

const inputCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

export const FichaTecnicaEditor = ({ equipoId, fichaTecnicaInicial = [], onUpdate }) => {
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Inicializar items desde props
    useEffect(() => {
        const data = Array.isArray(fichaTecnicaInicial) ? fichaTecnicaInicial : [];
        setItems(data.map((item, i) => ({ ...item, _key: `init-${i}` })));
        setHasChanges(false);
    }, [fichaTecnicaInicial]);

    const handleAdd = () => {
        setItems(prev => [...prev, { clave: '', valor: '', _key: `new-${Date.now()}-${Math.random()}` }]);
        setHasChanges(true);
    };

    const handleRemove = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const handleChange = (index, field, value) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
        setHasChanges(true);
        setSuccess(false);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        setItems(prev => {
            const newItems = [...prev];
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            return newItems;
        });
        setHasChanges(true);
    };

    const handleMoveDown = (index) => {
        setItems(prev => {
            if (index >= prev.length - 1) return prev;
            const newItems = [...prev];
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            return newItems;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(false);

        // Validar que no haya claves vacías
        const vacios = items.filter(item => !item.clave.trim());
        if (vacios.length > 0) {
            setError('Cada especificación debe tener un nombre (clave). Elimina las filas vacías o completa el campo.');
            return;
        }

        // Validar duplicados
        const claves = items.map(item => item.clave.trim().toLowerCase());
        const duplicados = claves.filter((c, i) => claves.indexOf(c) !== i);
        if (duplicados.length > 0) {
            setError(`Hay claves duplicadas: ${[...new Set(duplicados)].join(', ')}`);
            return;
        }

        setSaving(true);
        try {
            const payload = items.map(({ clave, valor }) => ({ clave: clave.trim(), valor: valor.trim() }));

            const res = await fetch(`/api/equipos/${equipoId}/ficha-tecnica`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fichaTecnica: payload }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);

            setSuccess(true);
            setHasChanges(false);
            if (onUpdate) onUpdate(json.data);

            // Limpiar mensaje de éxito después de 3 seg
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e.message ?? 'Error al guardar ficha técnica');
        } finally {
            setSaving(false);
        }
    };

    // Sugerencias comunes para autocompletar
    const sugerencias = [
        'Capacidad de Gasoil', 'Capacidad de Aceite', 'Amperaje', 'Voltaje',
        'Potencia (HP)', 'Potencia (kW)', 'RPM Máximas', 'Presión de Trabajo',
        'Peso (kg)', 'Capacidad de Carga', 'Número de Parte', 'Refrigerante',
        'Tipo de Aceite', 'Correa', 'Filtro de Aire', 'Filtro de Aceite',
        'Filtro de Combustible', 'Bujías', 'Neumáticos', 'Dimensiones',
    ];

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Especificaciones</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Especificaciones personalizadas del equipo</p>
                </div>
                <div className="flex items-center gap-2">
                    {success && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardado
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {saving ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {saving ? 'Guardando...' : hasChanges ? 'Guardar Ficha' : 'Sin cambios'}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            {/* Lista de especificaciones */}
            {items.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-slate-400 font-medium">Sin especificaciones técnicas</p>
                    <p className="text-xs text-slate-300 mt-1">Agrega campos personalizados como capacidad, amperaje, etc.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div
                            key={item._key}
                            className="group flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                        >
                            {/* Controles de orden */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                    title="Mover arriba"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === items.length - 1}
                                    className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                    title="Mover abajo"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Clave */}
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={item.clave}
                                    onChange={(e) => handleChange(index, 'clave', e.target.value)}
                                    placeholder="Ej: Capacidad de Gasoil"
                                    className={`${inputCls} text-xs py-2`}
                                    list={`sugerencias-ficha-${index}`}
                                />
                                <datalist id={`sugerencias-ficha-${index}`}>
                                    {sugerencias
                                        .filter(s => !items.some((it, ix) => ix !== index && it.clave.toLowerCase() === s.toLowerCase()))
                                        .map(s => (
                                            <option key={s} value={s} />
                                        ))}
                                </datalist>
                            </div>

                            {/* Separador visual */}
                            <span className="text-slate-300 font-bold text-xs shrink-0">=</span>

                            {/* Valor */}
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={item.valor}
                                    onChange={(e) => handleChange(index, 'valor', e.target.value)}
                                    placeholder="Ej: 500 Litros"
                                    className={`${inputCls} text-xs py-2`}
                                />
                            </div>

                            {/* Eliminar */}
                            <button
                                onClick={() => handleRemove(index)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                title="Eliminar especificación"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón agregar */}
            <button
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Especificación
            </button>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                    Las sub especificaciones permiten guardar información variable según la máquina. Agrega campos como <strong>capacidad de gasoil</strong>, <strong>números de parte de repuestos</strong>, <strong>amperaje</strong>, etc.
                </p>
            </div>
        </div>
    );
};
