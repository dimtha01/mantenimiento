import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

/* ── Delete confirmation button ── */
const DeleteBtn = ({ onConfirm }) => {
    const [confirm, setConfirm] = useState(false);
    if (confirm) return (
        <div className="flex items-center gap-1">
            <button onClick={onConfirm} className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-bold">Eliminar</button>
            <button onClick={() => setConfirm(false)} className="text-[10px] px-2 py-0.5 bg-slate-200 rounded font-bold">No</button>
        </div>
    );
    return (
        <button onClick={() => setConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar registro">
            <Trash2 className="w-4 h-4" />
        </button>
    );
};

export const HistorialHorasTab = ({ equipoId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = () => {
        if (!equipoId) return;
        setLoading(true);
        fetch(`/api/equipos/${equipoId}/promedio-horas`)
            .then(res => res.json())
            .then(json => {
                if (json.ok) setData(json.data);
                else setError(json.message);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [equipoId]);

    const handleDelete = async (registroId) => {
        try {
            const res = await fetch(`/api/equipos/${equipoId}/historial-horas/${registroId}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-6 text-center text-sm text-slate-500">Cargando historial...</div>;
    if (error) return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
    if (!data?.historial?.length) return (
        <div className="p-10 text-center">
            <p className="text-4xl mb-3 text-slate-300">⏱️</p>
            <p className="text-sm text-slate-500">Sin historial de horas registrado para este equipo.</p>
            <p className="text-xs text-slate-400 mt-2">Registra las horas desde la pestaña "Horas de Uso"</p>
        </div>
    );

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Historial de Horas</h3>
                    <p className="text-xs text-slate-500 mt-1">Registros de horas de uso del equipo</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{data.estadisticas.totalDias}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-1">Registros</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{data.estadisticas.totalHoras}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 mt-1">Horas Totales</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{data.estadisticas.promedioDiario}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mt-1">Promedio</p>
                </div>
            </div>

            {/* Historial Table */}
            <div className="border border-slate-200 bg-white rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3 text-right">Horas</th>
                            <th className="px-4 py-3 text-right">Acumulado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[...data.historial].reverse().map(h => (
                            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-700 font-medium">
                                    {new Date(h.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 bg-emerald-50/50">
                                    +{h.horas} h
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                                    {h.acumulado?.toLocaleString() ?? 0} h
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <DeleteBtn onConfirm={() => handleDelete(h.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
