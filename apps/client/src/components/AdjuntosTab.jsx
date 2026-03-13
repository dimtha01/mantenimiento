import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileIcon, ImageIcon, DownloadIcon, TrashIcon } from './Icons';

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
        <button
            onClick={() => setConfirm(true)}
            title="Eliminar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
};

const ImagePreview = ({ url, alt }) => {
    const [err, setErr] = useState(false);
    if (err) return <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-400" /></div>;
    return (
        <img
            src={url}
            alt={alt}
            className="w-full h-32 object-cover rounded-lg border border-slate-200"
            onError={() => setErr(true)}
        />
    );
};

export const AdjuntosTab = ({ attachableType, attachableId }) => {
    const [adjuntos, setAdjuntos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileRef = useRef(null);

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setUploadError('El archivo supera los 10 MB permitidos.');
            return;
        }

        setUploading(true);
        setUploadError(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('attachableType', attachableType);
        fd.append('attachableId', String(attachableId));

        try {
            const res = await fetch('/api/attachments', { method: 'POST', body: fd });
            const json = await res.json();
            if (!json.ok) throw new Error(json.message);
            await fetchAdjuntos();
        } catch (err) {
            setUploadError(err.message ?? 'Error al subir el archivo');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
            await fetchAdjuntos();
        } catch (e) {
            console.error('Error eliminando adjunto:', e);
        }
    };

    const handleDownload = (adj) => {
        window.open(`/api/attachments/${adj.id}/download`, '_blank');
    };

    const formatSize = (fileName) => {
        const ext = getExt(fileName);
        return EXT_ICONS[ext] ?? { icon: FileIcon, color: 'bg-slate-100 text-slate-600' };
    };

    return (
        <div className="px-6 py-4 space-y-4">
            {/* Zona de carga */}
            <div
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 group"
                onClick={() => fileRef.current?.click()}
            >
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-sm text-blue-600 font-semibold">Subiendo archivo...</p>
                    </div>
                ) : (
                    <>
                        <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">Click para subir archivo</p>
                        <p className="text-xs text-slate-400 mt-1">Imágenes, PDF, Word, Excel — Máx. 10 MB</p>
                    </>
                )}
            </div>

            {uploadError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {uploadError}
                </div>
            )}

            {/* Lista de adjuntos */}
            {loading ? (
                <div className="py-4 text-center text-slate-400 text-sm">Cargando archivos...</div>
            ) : adjuntos.length === 0 ? (
                <p className="text-center text-sm text-slate-400">Sin archivos adjuntos</p>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{adjuntos.length} archivo(s) adjunto(s)</p>
                    {adjuntos.map((adj) => {
                        const isImage = adj.isImage;
                        const icon = formatSize(adj.fileName);
                        return (
                            <div key={adj.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                {isImage && (
                                    <ImagePreview url={adj.url} alt={adj.fileName} />
                                )}
                                <div className="flex items-center gap-3 px-3 py-2.5">
                                    <span className={`text-xl shrink-0 p-1 rounded-lg ${icon.color}`}>
                                        {getExt(adj.fileName) === 'pdf' && <FileIcon className="w-5 h-5" />}
                                        {getExt(adj.fileName) === 'doc' && <FileIcon className="w-5 h-5" />}
                                        {getExt(adj.fileName) === 'docx' && <FileIcon className="w-5 h-5" />}
                                        {getExt(adj.fileName) === 'xls' && <FileIcon className="w-5 h-5" />}
                                        {getExt(adj.fileName) === 'xlsx' && <FileIcon className="w-5 h-5" />}
                                        {(getExt(adj.fileName) === 'jpg' || getExt(adj.fileName) === 'jpeg' || getExt(adj.fileName) === 'png' || getExt(adj.fileName) === 'gif' || getExt(adj.fileName) === 'webp') && <ImageIcon className="w-5 h-5" />}
                                        {!EXT_ICONS[getExt(adj.fileName)] && <FileIcon className="w-5 h-5" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{adj.fileName}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(adj.creadoEn).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleDownload(adj)}
                                            title="Descargar"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        <DeleteBtn onConfirm={() => handleDelete(adj.id)} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
