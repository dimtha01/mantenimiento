import { useState, useEffect } from 'react';

export const HistorialHorasTab = ({ equipoId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, [equipoId]);

    if (loading) return <div className="p-6 text-center text-sm text-slate-500">Cargando historial...</div>;
    if (error) return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
    if (!data?.historial?.length) return (
        <div className="p-10 text-center">
            <p className="text-4xl mb-3">⏱️</p>
            <p className="text-sm text-slate-500">Sin historial de horas registrado para este equipo.</p>
        </div>
    );

    return (
        <div className="p-6 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{data.estadisticas.totalDias}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-1">Días Registrados</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{data.estadisticas.totalHoras}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 mt-1">Horas Totales (Aumento)</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{data.estadisticas.promedioDiario}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mt-1">Promedio Diario</p>
                </div>
            </div>

            {/* Historial Table */}
            <div className="border border-slate-200 bg-white rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Motivo</th>
                            <th className="px-4 py-3 text-right">Lectura Total</th>
                            <th className="px-4 py-3 text-right">Aumento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[...data.historial].reverse().map(h => (
                            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-700 font-medium">
                                    {new Date(h.fecha).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                        {h.tipo}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                                    {h.acumulado?.toLocaleString() ?? 0}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 bg-emerald-50/50">
                                    +{h.horas} h
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
