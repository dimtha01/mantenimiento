import { useState, useEffect } from 'react';
import { FileIcon, ImageIcon, DownloadIcon, TrashIcon, EditIcon, CheckCircleIcon, WarningIcon } from './Icons';

const EXT_ICONS = {
    pdf: { icon: FileIcon, color: 'bg-red-100 text-red-700' },
    doc: { icon: FileIcon, color: 'bg-blue-100 text-blue-700' },
    docx: { icon: FileIcon, color: 'bg-blue-100 text-blue-700' },
    xls: { icon: FileIcon, color: 'bg-emerald-100 text-emerald-700' },
    xlsx: { icon: FileIcon, color: 'bg-emerald-100 text-emerald-700' },
    jpg: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700' },
    jpeg: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700' },
    png: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700' },
    gif: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700' },
    webp: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700' },
};

const getExt = (fileName) => fileName?.split('.').pop()?.toLowerCase() ?? '';

const getVencimientoStatus = (vencimiento) => {
    const hoy = new Date();
    const venc = new Date(vencimiento);
    const diasDiff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));

    if (diasDiff < 0) {
        return { status: 'VENCIDA', color: 'bg-red-500 text-white', textColor: 'text-red-600' };
    } else if (diasDiff <= 30) {
        return { status: 'PRÓXIMO', color: 'bg-amber-500 text-white', textColor: 'text-amber-600' };
    } else if (diasDiff <= 90) {
        return { status: 'PRONTO', color: 'bg-yellow-500 text-white', textColor: 'text-yellow-600' };
    }
    return { status: 'VIGENTE', color: 'bg-emerald-500 text-white', textColor: 'text-emerald-600' };
};

const ImagePreview = ({ url, alt }) => {
    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(true);

    if (err) {
        return (
            <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-slate-400" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-40">
            {loading && (
                <div className="absolute inset-0 bg-slate-100 rounded-lg animate-pulse" />
            )}
            <img
                src={url}
                alt={alt}
                className="w-full h-40 object-cover rounded-lg"
                onError={() => setErr(true)}
                onLoad={() => setLoading(false)}
            />
        </div>
    );
};

export const CertificacionCard = ({ certificacion, onViewDetails, onEdit, onDelete }) => {
    const [adjuntos, setAdjuntos] = useState([]);
    const [loadingAdjuntos, setLoadingAdjuntos] = useState(false);

    useEffect(() => {
        const fetchAdjuntos = async () => {
            setLoadingAdjuntos(true);
            try {
                const res = await fetch(`/api/attachments?type=certificacion&id=${certificacion.id}`);
                const json = await res.json();
                if (json.ok) setAdjuntos(json.data);
            } catch (e) {
                console.error('Error cargando adjuntos:', e);
            } finally {
                setLoadingAdjuntos(false);
            }
        };
        fetchAdjuntos();
    }, [certificacion.id]);

    const vencimientoInfo = getVencimientoStatus(certificacion.vencimiento);
    const diasRestantes = Math.ceil((new Date(certificacion.vencimiento) - new Date()) / (1000 * 60 * 60 * 24));

    const handleDownload = (adj) => {
        window.open(`/api/attachments/${adj.id}/download`, '_blank');
    };

    const previewAdjunto = adjuntos.find(a => a.isImage);
    const otrosAdjuntos = adjuntos.filter(a => !a.isImage);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Header con estado */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${vencimientoInfo.color}`}>
                        {vencimientoInfo.status}
                    </span>
                    <span className={`text-xs font-semibold ${vencimientoInfo.textColor}`}>
                        {diasRestantes >= 0 ? `${diasRestantes} días restantes` : `${Math.abs(diasRestantes)} días vencida`}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {onViewDetails && (
                        <button
                            onClick={() => onViewDetails(certificacion)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(certificacion)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(certificacion)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Previsualización de imagen */}
            {previewAdjunto && (
                <div className="px-4 pt-4">
                    <ImagePreview url={previewAdjunto.url} alt={certificacion.nombre} />
                </div>
            )}

            {/* Contenido */}
            <div className="p-4 space-y-3">
                {/* Nombre */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{certificacion.nombre}</h3>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-500 font-medium">Emisión</p>
                        <p className="text-slate-800 font-semibold">
                            {new Date(certificacion.fechaEmision).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className={`rounded-lg p-2 ${vencimientoInfo.status === 'VENCIDA' ? 'bg-red-50' : 'bg-slate-50'}`}>
                        <p className="text-slate-500 font-medium">Vencimiento</p>
                        <p className={`font-semibold ${vencimientoInfo.textColor}`}>
                            {new Date(certificacion.vencimiento).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Duración */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Vigencia: {certificacion.duracionMeses} {certificacion.duracionMeses === 1 ? 'mes' : 'meses'}</span>
                </div>

                {/* Archivos adjuntos */}
                {!loadingAdjuntos && adjuntos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                            {adjuntos.length} {adjuntos.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
                        </p>
                        <div className="space-y-1.5">
                            {previewAdjunto && (
                                <button
                                    key={previewAdjunto.id}
                                    onClick={() => handleDownload(previewAdjunto)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                                >
                                    <span className="text-sm">🖼️</span>
                                    <span className="text-xs font-medium text-slate-700 truncate flex-1">{previewAdjunto.fileName}</span>
                                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            )}
                            {otrosAdjuntos.map(adj => {
                                const ext = getExt(adj.fileName);
                                return (
                                    <button
                                        key={adj.id}
                                        onClick={() => handleDownload(adj)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <span className="text-sm text-slate-700">
                                            {ext === 'pdf' && <FileIcon className="w-4 h-4" />}
                                            {ext === 'doc' && <FileIcon className="w-4 h-4" />}
                                            {ext === 'docx' && <FileIcon className="w-4 h-4" />}
                                            {ext === 'xls' && <FileIcon className="w-4 h-4" />}
                                            {ext === 'xlsx' && <FileIcon className="w-4 h-4" />}
                                            {(ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') && <ImageIcon className="w-4 h-4" />}
                                            {!EXT_ICONS[ext] && <FileIcon className="w-4 h-4" />}
                                        </span>
                                        <span className="text-xs font-medium text-slate-700 truncate flex-1">{adj.fileName}</span>
                                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificacionCard;
