import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileIcon, ImageIcon, DownloadIcon, TrashIcon } from './Icons';

/* ── helpers ── */
const EXT_MAP = {
    pdf: { icon: FileIcon, color: 'bg-red-100 text-red-700', label: 'PDF' },
    doc: { icon: FileIcon, color: 'bg-blue-100 text-blue-700', label: 'Word' },
    docx: { icon: FileIcon, color: 'bg-blue-100 text-blue-700', label: 'Word' },
    xls: { icon: FileIcon, color: 'bg-emerald-100 text-emerald-700', label: 'Excel' },
    xlsx: { icon: FileIcon, color: 'bg-emerald-100 text-emerald-700', label: 'Excel' },
    jpg: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700', label: 'Imagen' },
    jpeg: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700', label: 'Imagen' },
    png: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700', label: 'Imagen' },
    gif: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700', label: 'Imagen' },
    webp: { icon: ImageIcon, color: 'bg-purple-100 text-purple-700', label: 'Imagen' },
};

const getExt = (name) => name?.split('.').pop()?.toLowerCase() ?? '';
const getInfo = (name) => EXT_MAP[getExt(name)] ?? { icon: FileIcon, color: 'bg-slate-100 text-slate-600', label: 'Archivo' };
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ── Image preview with error boundary ── */
const ImgPreview = ({ src, alt }) => {
    const [err, setErr] = useState(false);
    if (err) return <div className="w-full h-36 bg-slate-100 flex items-center justify-center rounded-t-xl"><ImageIcon className="w-8 h-8 text-slate-400" /></div>;
    return (
        <img
            src={src} alt={alt}
            className="w-full h-36 object-cover rounded-t-xl border-b border-slate-200"
            onError={() => setErr(true)}
        />
    );
};

/* ── Individual file card ── */
const ArchivoCard = ({ adj, onDelete }) => {
    const info = getInfo(adj.fileName);
    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getExt(adj.fileName));
    const [delConfirm, setDelConfirm] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            {isImg && <ImgPreview src={adj.url} alt={adj.fileName} />}
            {!isImg && (
                <div className="w-full h-24 flex items-center justify-center bg-slate-50 border-b border-slate-100 rounded-t-xl">
                    <span className="text-4xl text-slate-700">
                        {info.icon === FileIcon && <FileIcon className="w-10 h-10" />}
                        {info.icon === ImageIcon && <ImageIcon className="w-10 h-10" />}
                    </span>
                </div>
            )}
            <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2 flex-1">{adj.fileName}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${info.color}`}>{info.label}</span>
                </div>
                <p className="text-[10px] text-slate-400">{fmtDate(adj.creadoEn)}</p>
                <div className="flex gap-1.5 pt-1">
                    <button
                        onClick={() => window.open(`/api/attachments/${adj.id}/download`, '_blank')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                    </button>
                    {onDelete && (
                        delConfirm ? (
                            <div className="flex flex-1 items-center justify-center gap-1">
                                <button onClick={() => onDelete(adj.id)} className="flex-1 text-[10px] py-1.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">Eliminar</button>
                                <button onClick={() => setDelConfirm(false)} className="flex-1 text-[10px] py-1.5 bg-slate-200 rounded-lg font-bold hover:bg-slate-300 transition-colors">No</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setDelConfirm(true)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar archivo"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Upload zone ── */
const UploadZone = ({ onUploaded, attachableType, attachableId }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { setError('El archivo supera los 10 MB.'); return; }
        setUploading(true); setError(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('attachableType', attachableType);
        fd.append('attachableId', String(attachableId));
        try {
            const res = await fetch('/api/attachments', { method: 'POST', body: fd });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);
            onUploaded(json.data);
        } catch (e) {
            setError(e.message ?? 'Error al subir');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg border border-slate-200 hover:border-blue-300 transition-all disabled:opacity-60"
                >
                    {uploading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    )}
                    {uploading ? 'Subiendo...' : 'Subir archivo'}
                </button>
                <span className="text-[10px] text-slate-300">PDF · Word · Excel · Imagen · Max 10 MB</span>
                <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFile(e.target.files[0])} />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
    );
};

/* ── Main Export: Archivos panel para Certificaciones/Fallas ── */
export const ArchivosPanel = ({ attachableType, attachableId, canDelete = true }) => {
    const [adjuntos, setAdjuntos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdjuntos = useCallback(async () => {
        if (!attachableId || !attachableType) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/attachments?type=${attachableType}&id=${attachableId}`);
            const json = await res.json();
            if (json.ok) setAdjuntos(json.data);
        } catch (e) {
            console.error('Error cargando adjuntos:', e);
        } finally {
            setLoading(false);
        }
    }, [attachableType, attachableId]);

    useEffect(() => { fetchAdjuntos(); }, [fetchAdjuntos]);

    const handleDelete = async (id) => {
        await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
        setAdjuntos(p => p.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-3">
            <UploadZone
                attachableType={attachableType}
                attachableId={attachableId}
                onUploaded={(newAdj) => setAdjuntos(p => [newAdj, ...p])}
            />
            {loading ? (
                <p className="text-xs text-slate-400 text-center py-3">Cargando archivos...</p>
            ) : adjuntos.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">Sin archivos adjuntos</p>
            ) : (
                <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{adjuntos.length} archivo(s)</p>
                    <div className="grid grid-cols-2 gap-3">
                        {adjuntos.map(adj => (
                            <ArchivoCard
                                key={adj.id}
                                adj={adj}
                                onDelete={canDelete ? handleDelete : null}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
