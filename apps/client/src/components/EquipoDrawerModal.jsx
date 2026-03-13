// EquipoDrawerModal.jsx
// Tabs: Info General | Certificaciones | Mantenimientos | Planes | Repuestos | Adjuntos
import { useState, useEffect, useCallback, useRef } from 'react';
import { FichaTecnicaEditor } from './FichaTecnicaEditor';
import { HistorialHorasTab } from './HistorialHorasTab';
import { AdjuntosTab } from './AdjuntosTab';
import { ArchivosPanel } from './ArchivosPanel';

/* ─── helpers ─────────────────────────────────────────────────── */
const daysUntil = (dateStr) =>
  dateStr ? Math.ceil((new Date(dateStr) - new Date()) / 86400000) : null;

const certBadge = (vencimiento) => {
  const d = daysUntil(vencimiento);
  if (d === null) return { label: 'Sin fecha', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400', alert: false };
  if (d < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', alert: true };
  if (d < 30) return { label: `${d}d`, color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', alert: true };
  if (d < 90) return { label: `${d}d`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', alert: false };
  return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', alert: false };
};

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE') : '—';

const CertCard = ({ cert, info, d, isExp, isSoon, onRenovar }) => {
  const [showFiles, setShowFiles] = useState(false);
  return (
    <div className={`border rounded-xl bg-white shadow-sm overflow-hidden ${isExp ? 'border-red-200' : isSoon ? 'border-amber-200' : 'border-zinc-200'}`}>
      {/* Header */}
      <div className={`p-4 ${isExp ? 'bg-red-50/50' : isSoon ? 'bg-amber-50/50' : 'bg-white'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${info.color}`}>
                {isExp ? 'VENCIDO' : isSoon ? `${d}d para vencer` : 'VIGENTE'}
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-900 truncate font-mono tracking-tight">{cert.nombre || 'Certificación'}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              <span>Emisión: <strong className="text-zinc-700 font-normal">{fmtDate(cert.fechaEmision)}</strong></span>
              <span>·</span>
              <span>Vence: <strong className={`font-normal ${isExp ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-zinc-700'}`}>{fmtDate(cert.vencimiento)}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isExp && (
              <button onClick={onRenovar}
                className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
                Renovar
              </button>
            )}
            <button
              onClick={() => setShowFiles(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-colors border ${showFiles ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Archivos
            </button>
          </div>
        </div>
      </div>
      {/* Archivos expandibles */}
      {showFiles && (
        <div className="border-t border-zinc-100 p-4 bg-zinc-50/60">
          <ArchivosPanel attachableType="certificacion" attachableId={cert.id} />
        </div>
      )}
    </div>
  );
};

const FORM_EMPTY = {
  codigo: '', modelo: '', serial: '', factura: false,
  marcaId: '', tipoId: '', unidadNegocioId: '', propietarioId: '', parametroId: '',
};

/* ─── FallaArchivos ──────────────────────────────────────────── */
const FallaArchivos = ({ fallaId }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-slate-100 pt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${open ? 'text-slate-700' : 'text-slate-400 hover:text-slate-700'}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        {open ? 'Ocultar evidencias' : 'Ver / adjuntar evidencias'}
      </button>
      {open && (
        <div className="mt-2">
          <ArchivosPanel attachableType="falla" attachableId={fallaId} />
        </div>
      )}
    </div>
  );
};


/* ─── SELECT helper ───────────────────────────────────────────── */
const Field = ({ label, onAdd, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {onAdd && (
        <button
          onClick={onAdd}
          className="text-white bg-zinc-800 hover:bg-zinc-900 w-5 h-5 rounded flex items-center justify-center transition-colors shadow-sm"
          title="Agregar nuevo"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
    {children}
  </div>
);

const inputCls = 'w-full border border-zinc-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 bg-white placeholder-zinc-400 transition-colors shadow-sm';
const selectCls = `${inputCls} pr-8 font-sans font-medium text-zinc-700`;

/* ─── CatalogCombobox ─── free-text, auto-create, inline delete ──── */
const CatalogCombobox = ({
  label, value, items = [], onChange, onCreateNew, onDelete, placeholder = 'Escribir...',
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null); // item id pending delete
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setDelConfirm(null); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = items.find(i => String(i.id) === String(value));
  const trimmed = query.trim();

  const filtered = trimmed
    ? items.filter(i => i.nombre.toLowerCase().includes(trimmed.toLowerCase()))
    : items;

  const exactMatch = items.find(i => i.nombre.toLowerCase() === trimmed.toLowerCase());
  const showCreate = trimmed && !exactMatch;

  const handleSelect = (item) => { onChange(item.id); setQuery(''); setOpen(false); };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setQuery(''); };

  const handleCreate = async () => {
    if (!trimmed) return;
    const newItem = await onCreateNew(trimmed);
    if (newItem) { onChange(newItem.id); setQuery(''); setOpen(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length === 1 && !showCreate) handleSelect(filtered[0]);
      else if (showCreate) handleCreate();
    }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={ref} className="relative">
      <div className={`flex items-center border rounded-lg bg-white overflow-visible transition-colors ${open ? 'border-zinc-500 ring-1 ring-zinc-500 shadow-sm' : 'border-zinc-200 shadow-sm'}`}>
        {selected && !open ? (
          <div className="flex items-center flex-1 pl-3 py-2 gap-2">
            <span className="text-sm font-bold text-zinc-900 flex-1 truncate">{selected.nombre}</span>
            <button type="button" onClick={handleClear} className="mr-2 text-zinc-400 hover:text-red-500 transition-colors shrink-0" title="Quitar selección">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <input
            type="text" value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 py-2 px-3 text-sm bg-transparent outline-none placeholder-zinc-400 font-mono"
          />
        )}
      </div>

      {open && (filtered.length > 0 || showCreate) && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(item => (
            <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 group border-b border-zinc-100 last:border-0">
              <span className="flex-1 cursor-pointer" onClick={() => handleSelect(item)}>{item.nombre}</span>
              {onDelete && (
                delConfirm === item.id ? (
                  <div className="flex items-center gap-1 ml-2">
                    <button type="button" onClick={() => { onDelete(item); setDelConfirm(null); setOpen(false); }} className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-bold uppercase tracking-wider shadow-sm">Eliminar</button>
                    <button type="button" onClick={() => setDelConfirm(null)} className="text-[10px] px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded font-bold uppercase tracking-wider">No</button>
                  </div>
                ) : (
                  <button type="button" onClick={e => { e.stopPropagation(); setDelConfirm(item.id); }}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all" title="Eliminar">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )
              )}
            </li>
          ))}
          {showCreate && (
            <li onClick={handleCreate} className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-900 border-zinc-900 font-bold hover:bg-zinc-100 cursor-pointer border-t">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Crear «{trimmed}»
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

/* ─── MODAL PEQUEÑO PARA CATÁLOGOS ────────────────────────────── */
const NuevoCatalogoModal = ({ visible, onClose, onSave, title, error }) => {
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setNombre('');
      setSaving(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200">
        <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          {error && <p className="mb-3 text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">{error}</p>}
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Nombre / Valor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputCls}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Escriba aquí..."
            autoFocus
          />
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-3 justify-end items-center">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            disabled={!nombre.trim() || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(nombre.trim());
              setSaving(false);
            }}
            className="px-5 py-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm uppercase tracking-wider"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
export const EquipoDrawerModal = ({ equipo, onClose, onSave }) => {
  const isNew = !equipo?.id;

  /* animación */
  const [visible, setVisible] = useState(false);

  /* tabs */
  const [activeTab, setActiveTab] = useState('general');

  /* form principal */
  const [form, setForm] = useState(FORM_EMPTY);
  const [originalForm, setOriginalForm] = useState(FORM_EMPTY);

  /* catálogos para selects */
  const [catalogos, setCatalogos] = useState({
    marcas: [], tipos: [], ubicaciones: [], propietarios: [], parametros: [],
  });

  /* estado guardado */
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* modal creación en catálogo */
  const [catalogModal, setCatalogModal] = useState({ visible: false, type: '', label: '', error: null });

  /* nuevo certificado */
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({ nombre: '', fechaEmision: '', duracionMeses: '', vencimiento: '' });
  const [certError, setCertError] = useState(null);
  const [certSaving, setCertSaving] = useState(false);

  /* registro de horas */
  const [horasInput, setHorasInput] = useState('');
  const [horasSaving, setHorasSaving] = useState(false);

  /* fallas */
  const [showFallaForm, setShowFallaForm] = useState(false);
  const [newFalla, setNewFalla] = useState({ descripcion: '', severidad: 'MEDIA', fecha: new Date().toISOString().split('T')[0], responsable: '', costoReparacion: '' });
  const [fallaSaving, setFallaSaving] = useState(false);
  const [estadoSaving, setEstadoSaving] = useState(false);
  const [resolverFallaModal, setResolverFallaModal] = useState({ visible: false, fallaId: null, solucion: '' });

  /* ── cargar catálogos ──────────────────────────────── */
  const fetchCatalogos = useCallback(async () => {
    try {
      const [marcas, tipos, ubicaciones, propietarios, parametros] = await Promise.all([
        fetch('/api/catalogos/marcas').then(r => r.json()),
        fetch('/api/catalogos/tipos').then(r => r.json()),
        fetch('/api/catalogos/ubicaciones').then(r => r.json()),
        fetch('/api/catalogos/propietarios').then(r => r.json()),
        fetch('/api/catalogos/parametros').then(r => r.json()),
      ]);
      setCatalogos({
        marcas: marcas.data ?? [],
        tipos: tipos.data ?? [],
        ubicaciones: ubicaciones.data ?? [],
        propietarios: propietarios.data ?? [],
        parametros: parametros.data ?? [],
      });
    } catch (e) {
      console.error('Error cargando catálogos:', e);
    }
  }, []);

  /* ── auto-seleccionar 'horas' cuando se carguen los catálogos ── */
  useEffect(() => {
    if (catalogos.parametros.length > 0 && !form.parametroId) {
      const horasParam = catalogos.parametros.find(
        (p) => p.unidad?.toLowerCase().includes('hora')
      );
      if (horasParam) {
        setForm((prev) => ({ ...prev, parametroId: horasParam.id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogos.parametros]);

  /* ── abrir / cerrar ────────────────────────────────── */
  const prevEquipoId = useRef(null);

  useEffect(() => {
    if (equipo) {
      const initial = {
        id: equipo.id ?? null,
        codigo: equipo.codigo ?? '',
        modelo: equipo.modelo ?? '',
        serial: equipo.serial ?? '',
        factura: equipo.factura ?? false,
        marcaId: equipo.marcaId ?? equipo.marca?.id ?? '',
        tipoId: equipo.tipoId ?? equipo.tipo?.id ?? '',
        unidadNegocioId: equipo.unidadNegocioId ?? equipo.ubicacion?.id ?? '',
        propietarioId: equipo.propietarioId ?? equipo.propietario?.id ?? '',
        parametroId: equipo.parametroId ?? equipo.parametro?.id ?? '',
        horasMantenimientoPreventivo: equipo.horasMantenimientoPreventivo ?? '',
      };
      setForm(initial);
      setOriginalForm(initial);

      if (prevEquipoId.current !== equipo.id) {
        setActiveTab('general');
        setShowCertForm(false);
        setShowFallaForm(false);
      }
      prevEquipoId.current = equipo.id;

      setSaveError(null);
      fetchCatalogos();
      setTimeout(() => setVisible(true), 10);
    }
  }, [equipo, fetchCatalogos]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  /* crear opción en catálogo dinámico */
  const handleSaveCatalog = async (nombre) => {
    try {
      setCatalogModal(p => ({ ...p, error: null }));
      const { type } = catalogModal; // marcas, tipos, ubicaciones, propietarios
      const url = `/api/catalogos/${type}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();

      if (!data.ok) throw new Error(data.message);

      // Actualizar catálogos y seleccionar el nuevo
      const newItem = data.data; // { id: 123, nombre: '...' }

      setCatalogos(prev => ({
        ...prev,
        [type]: [...prev[type], newItem].sort((a, b) => a.nombre?.localeCompare(b.nombre))
      }));

      // Seleccionarlo automáticamente según el tipo
      if (type === 'marcas') handleChange('marcaId', newItem.id);
      else if (type === 'tipos') handleChange('tipoId', newItem.id);
      else if (type === 'ubicaciones') handleChange('unidadNegocioId', newItem.id);
      else if (type === 'propietarios') handleChange('propietarioId', newItem.id);

      setCatalogModal({ visible: false, type: '', label: '', error: null });
    } catch (err) {
      setCatalogModal(p => ({ ...p, error: err.message }));
    }
  };

  /* true si el form difiere del estado original (solo relevante en modo edición) */
  const hasChanges = isNew || JSON.stringify(
    Object.fromEntries(Object.keys(originalForm).filter(k => k !== 'id').map(k => [k, String(form[k] ?? '')]))
  ) !== JSON.stringify(
    Object.fromEntries(Object.keys(originalForm).filter(k => k !== 'id').map(k => [k, String(originalForm[k] ?? '')]))
  );

  /* ── guardar equipo ────────────────────────────────── */
  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await onSave(form);
      handleClose();
    } catch (e) {
      setSaveError(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  /* ── agregar certificacion ────────────────────────── */
  const handleAddCert = async () => {
    setCertError(null);
    if (!newCert.nombre || !newCert.fechaEmision || !newCert.duracionMeses || !newCert.vencimiento) {
      setCertError('Todos los campos son obligatorios');
      return;
    }
    if (new Date(newCert.vencimiento) <= new Date(newCert.fechaEmision)) {
      setCertError('La fecha de vencimiento debe ser posterior a la de emisión');
      return;
    }
    setCertSaving(true);
    try {
      const res = await fetch(`/api/equipos/${equipo.id}/certificaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newCert.nombre,
          fechaEmision: newCert.fechaEmision,
          duracionMeses: parseInt(newCert.duracionMeses),
          vencimiento: newCert.vencimiento,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      const eq = await fetch(`/api/equipos/${equipo.id}`).then(r => r.json());
      if (eq.ok) onSave(null, eq.data);

      setNewCert({ nombre: '', fechaEmision: '', duracionMeses: '', vencimiento: '' });
      setShowCertForm(false);
    } catch (e) {
      setCertError(e.message);
      console.error('Error guardando cert:', e);
    } finally {
      setCertSaving(false);
    }
  };

  if (!equipo) return null;

  /* badges de certicaciones  */
  // Agrupar historial por nombre tomando la más reciente para que no se sumen alertas de certs antiguas ya renovadas
  const certs = Object.values((equipo.certificaciones ?? []).reduce((acc, c) => {
    if (!acc[c.nombre] || new Date(c.vencimiento) > new Date(acc[c.nombre].vencimiento)) {
      acc[c.nombre] = c;
    }
    return acc;
  }, {}));
  const alertCerts = certs.filter((c) => certBadge(c.vencimiento).alert);
  const mantenimientos = equipo.mantenimientos ?? [];
  const planes = equipo.planes ?? [];
  const fallas = equipo.fallas ?? [];
  const fallasAbiertas = fallas.filter(f => f.estado !== 'RESUELTA');

  /* ── handler: registrar falla ── */
  const handleAddFalla = async () => {
    if (!newFalla.descripcion) return;
    setFallaSaving(true);
    try {
      const res = await fetch(`/api/equipos/${equipo.id}/fallas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFalla),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      if (json.equipo) onSave(null, json.equipo);
      setNewFalla({ descripcion: '', severidad: 'MEDIA', fecha: new Date().toISOString().split('T')[0] });
      setShowFallaForm(false);
    } catch (e) {
      console.error('Error registrando falla:', e);
    } finally {
      setFallaSaving(false);
    }
  };

  /* ── handler: actualizar falla ── */
  const handleUpdateFalla = async (fallaId, data) => {
    try {
      const res = await fetch(`/api/equipos/${equipo.id}/fallas/${fallaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      if (json.equipo) onSave(null, json.equipo);
    } catch (e) {
      console.error('Error actualizando falla:', e);
    }
  };

  /* ── handler: cambiar estado operativo ── */
  const handleToggleEstado = async () => {
    setEstadoSaving(true);
    try {
      const nuevoEstado = equipo.estadoOperativo === 'OPERATIVO' ? 'NO_OPERATIVO' : 'OPERATIVO';
      const res = await fetch(`/api/equipos/${equipo.id}/estado-operativo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoOperativo: nuevoEstado }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onSave(null, json.data);
    } catch (e) {
      console.error('Error cambiando estado:', e);
    } finally {
      setEstadoSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'Info General', badge: 0 },
    { id: 'ficha', label: 'Sub Especificaciones', badge: 0 },
    { id: 'horas', label: 'Horas de Uso', badge: 0 },
    { id: 'fallas', label: 'Fallas', badge: fallasAbiertas.length },
    { id: 'historial_horas', label: 'Historial Horas', badge: null },
    { id: 'certificaciones', label: 'Certificaciones', badge: alertCerts.length },
    { id: 'mantenimientos', label: 'Mantenimientos', badge: 0 },
    { id: 'planes', label: 'Planes', badge: 0 },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[85%] md:w-[720px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-500">{isNew ? 'Nuevo equipo' : 'Editar equipo'}</span>
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <span className="text-[10px] font-mono text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-200">{saveError}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              title={!hasChanges ? 'Sin cambios pendientes' : ''}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
              {saving ? 'Guardando...' : hasChanges ? 'Guardar' : 'Sin cambios'}
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── CARD resumen del equipo (solo en modo edición) ── */}
        {!isNew && (
          <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-mono font-bold text-2xl shadow-sm shrink-0 border-2 border-zinc-700">
                {equipo.codigo?.charAt(0) ?? 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black text-zinc-900 leading-tight font-mono tracking-tight truncate">{equipo.codigo}</h3>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5 truncate">
                  {equipo.marca?.nombre ?? '—'} · {equipo.modelo} · {equipo.ubicacion?.nombre ?? '—'}
                </p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest inline-flex items-center gap-1.5 ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  {equipo.estadoOperativo === 'NO_OPERATIVO' ? 'No Operativo' : 'Operativo'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${equipo.factura ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                  {equipo.factura ? '✓ Con Factura' : 'Sin Factura'}
                </span>
              </div>
            </div>

            {/* Alerta de planes pendientes */}
            {(() => {
              const planes = equipo.planes ?? [];
              const horasEquipo = equipo.horasAcumuladas ?? 0;
              const vencidos = planes.filter(p => p.frecuenciaValor > 0 && horasEquipo >= (p.horasUltimaEjecucion ?? 0) + p.frecuenciaValor);
              const proximos = planes.filter(p => p.frecuenciaValor > 0 && horasEquipo < (p.horasUltimaEjecucion ?? 0) + p.frecuenciaValor && horasEquipo >= (p.horasUltimaEjecucion ?? 0) + p.frecuenciaValor - Math.max(2, Math.round(p.frecuenciaValor * 0.1)));

              if (vencidos.length > 0) return (
                <button onClick={() => setActiveTab('planes')} className="mt-4 w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-red-100 transition-colors text-left shadow-sm">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-[11px] text-red-800 font-mono tracking-tight flex-1">
                    <strong className="tracking-normal uppercase">¡Atención requerida!</strong> {vencidos.length} plan(es) con límite excedido.
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 underline">Ver Planes</span>
                </button>
              );
              if (proximos.length > 0) return (
                <button onClick={() => setActiveTab('planes')} className="mt-4 w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-amber-100 transition-colors text-left shadow-sm">
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[11px] text-amber-800 font-mono tracking-tight flex-1">
                    <strong className="tracking-normal uppercase">Margen de aviso:</strong> {proximos.length} plan(es) próximos a requerir servicio.
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 underline">Ver Planes</span>
                </button>
              );
              return null;
            })()}

            {/* Alertas certificaciones */}
            {alertCerts.length > 0 && (
              <button
                onClick={() => setActiveTab('certificaciones')}
                className="mt-3 w-full flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-amber-100 transition-colors text-left"
              >
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-700 font-medium flex-1">
                  {alertCerts.length} certificado{alertCerts.length > 1 ? 's' : ''} por vencer o vencido.
                </p>
                <span className="text-xs font-bold text-amber-600 underline">Ver ahora</span>
              </button>
            )}

            {/* Alerta de fallas abiertas */}
            {fallasAbiertas.length > 0 && (
              <button
                onClick={() => setActiveTab('fallas')}
                className="mt-3 w-full flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-orange-100 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs text-orange-700 font-medium flex-1">
                  {fallasAbiertas.length} falla{fallasAbiertas.length > 1 ? 's' : ''} sin resolver
                </p>
                <span className="text-xs font-bold text-orange-600 underline">Ver fallas</span>
              </button>
            )}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="relative border-b border-zinc-200 bg-white shrink-0 group">
          <div id="drawer-tabs-container" className="flex px-3 sm:px-5 pr-16 pl-12 gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth relative z-0">
            {TABS.filter(t => isNew ? t.id === 'general' : true).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3.5 px-3 sm:px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-bold rounded flex items-center justify-center shadow-sm font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {!isNew && (
            <>
              {/* Botón Izquierda */}
              <button
                onClick={() => {
                  const el = document.getElementById('drawer-tabs-container');
                  if (el) el.scrollBy({ left: -250, behavior: 'smooth' });
                }}
                className="absolute left-0 top-0 bottom-0 px-2 bg-gradient-to-r from-white via-white/90 to-transparent flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-[4px_0_8px_-2px_rgba(255,255,255,0.8)] z-10 transition-colors opacity-0 group-hover:opacity-100"
                title="Desplazar a la izquierda"
              >
                <div className="bg-white rounded-full p-1 border border-slate-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </button>

              {/* Botón Derecha */}
              <button
                onClick={() => {
                  const el = document.getElementById('drawer-tabs-container');
                  if (el) el.scrollBy({ left: 250, behavior: 'smooth' });
                }}
                className="absolute right-0 top-0 bottom-0 px-2 bg-gradient-to-l from-white via-white/90 to-transparent flex items-center justify-center text-zinc-500 hover:text-zinc-900 shadow-[-4px_0_8px_-2px_rgba(255,255,255,0.8)] z-10 transition-colors opacity-0 group-hover:opacity-100"
                title="Desplazar a la derecha"
              >
                <div className="bg-white rounded-full p-1 border border-zinc-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </>
          )}
        </div>

        {/* ── CONTENIDO ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ════ Info General ════ */}
          {activeTab === 'general' && (
            <div className="px-6 py-4 space-y-3">

              {/* Código */}
              <Field label="Código del Equipo">
                <input
                  value={form.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  placeholder="Ej: EQ-001"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                {/* Modelo */}
                <Field label="Modelo">
                  <input
                    value={form.modelo}
                    onChange={(e) => handleChange('modelo', e.target.value)}
                    placeholder="Ej: 320 GC"
                    className={inputCls}
                  />
                </Field>

                {/* Serial */}
                <Field label="Número de Serial">
                  <input
                    value={form.serial}
                    onChange={(e) => handleChange('serial', e.target.value)}
                    placeholder="Ej: CAT-2024-001"
                    className={`${inputCls} font-mono`}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Marca */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Marca</label>
                  <CatalogCombobox
                    value={form.marcaId}
                    items={catalogos.marcas}
                    onChange={(v) => handleChange('marcaId', v)}
                    onCreateNew={async (nombre) => {
                      const res = await fetch('/api/catalogos/marcas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
                      const json = await res.json();
                      if (json.ok) { setCatalogos(p => ({ ...p, marcas: [...p.marcas, json.data].sort((a, b) => a.nombre.localeCompare(b.nombre)) })); return json.data; }
                    }}
                    onDelete={async (item) => {
                      await fetch(`/api/catalogos/marcas/${item.id}`, { method: 'DELETE' });
                      setCatalogos(p => ({ ...p, marcas: p.marcas.filter(m => m.id !== item.id) }));
                      if (String(form.marcaId) === String(item.id)) handleChange('marcaId', '');
                    }}
                    placeholder="Escribir o seleccionar marca..."
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tipo de Equipo</label>
                  <CatalogCombobox
                    value={form.tipoId}
                    items={catalogos.tipos}
                    onChange={(v) => handleChange('tipoId', v)}
                    onCreateNew={async (nombre) => {
                      const res = await fetch('/api/catalogos/tipos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
                      const json = await res.json();
                      if (json.ok) { setCatalogos(p => ({ ...p, tipos: [...p.tipos, json.data].sort((a, b) => a.nombre.localeCompare(b.nombre)) })); return json.data; }
                    }}
                    onDelete={async (item) => {
                      await fetch(`/api/catalogos/tipos/${item.id}`, { method: 'DELETE' });
                      setCatalogos(p => ({ ...p, tipos: p.tipos.filter(t => t.id !== item.id) }));
                      if (String(form.tipoId) === String(item.id)) handleChange('tipoId', '');
                    }}
                    placeholder="Escribir o seleccionar tipo..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ubicación */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Ubicación / Unidad</label>
                  <CatalogCombobox
                    value={form.unidadNegocioId}
                    items={catalogos.ubicaciones}
                    onChange={(v) => handleChange('unidadNegocioId', v)}
                    onCreateNew={async (nombre) => {
                      const res = await fetch('/api/catalogos/ubicaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
                      const json = await res.json();
                      if (json.ok) { setCatalogos(p => ({ ...p, ubicaciones: [...p.ubicaciones, json.data].sort((a, b) => a.nombre.localeCompare(b.nombre)) })); return json.data; }
                    }}
                    onDelete={async (item) => {
                      await fetch(`/api/catalogos/ubicaciones/${item.id}`, { method: 'DELETE' });
                      setCatalogos(p => ({ ...p, ubicaciones: p.ubicaciones.filter(u => u.id !== item.id) }));
                      if (String(form.unidadNegocioId) === String(item.id)) handleChange('unidadNegocioId', '');
                    }}
                    placeholder="Escribir o seleccionar ubicación..."
                  />
                </div>

                {/* Propietario */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Propietario</label>
                  <CatalogCombobox
                    value={form.propietarioId}
                    items={catalogos.propietarios}
                    onChange={(v) => handleChange('propietarioId', v)}
                    onCreateNew={async (nombre) => {
                      const res = await fetch('/api/catalogos/propietarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
                      const json = await res.json();
                      if (json.ok) { setCatalogos(p => ({ ...p, propietarios: [...p.propietarios, json.data].sort((a, b) => a.nombre.localeCompare(b.nombre)) })); return json.data; }
                    }}
                    onDelete={async (item) => {
                      await fetch(`/api/catalogos/propietarios/${item.id}`, { method: 'DELETE' });
                      setCatalogos(p => ({ ...p, propietarios: p.propietarios.filter(p2 => p2.id !== item.id) }));
                      if (String(form.propietarioId) === String(item.id)) handleChange('propietarioId', '');
                    }}
                    placeholder="Escribir o seleccionar propietario..."
                  />
                </div>
              </div>


              {/* Parámetro de control */}
              <Field label="Parámetro de Control (unidad de medición)">
                <select
                  value={form.parametroId}
                  onChange={(e) => handleChange('parametroId', e.target.value)}
                  className={selectCls}
                >
                  {catalogos.parametros.map(p => (
                    <option key={p.id} value={p.id}>{p.unidad}</option>
                  ))}
                </select>
              </Field>

              {/* Factura */}
              <div className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg bg-zinc-50 transition-colors hover:border-zinc-300">
                <input
                  id="factura-check"
                  type="checkbox"
                  checked={form.factura}
                  onChange={(e) => handleChange('factura', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <label htmlFor="factura-check" className="text-sm font-bold text-zinc-700 cursor-pointer select-none">
                  El equipo cuenta con factura de compra
                </label>
              </div>


            </div>
          )}

          {/* ════ Ficha Técnica ════ */}
          {activeTab === 'ficha' && (
            <div className="px-6 py-4">
              <FichaTecnicaEditor
                equipoId={equipo.id}
                fichaTecnicaInicial={equipo.fichaTecnica ?? []}
                onUpdate={(equipoActualizado) => {
                  if (equipoActualizado) onSave(null, equipoActualizado);
                }}
              />
            </div>
          )}

          {/* ════ Horas de Uso ════ */}
          {activeTab === 'horas' && (
            <div className="px-6 py-4 space-y-3">

              {/* Horómetro actual */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-zinc-200 rounded-xl p-3 text-center bg-zinc-50 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-4xl font-black text-zinc-900 font-mono tracking-tighter">{equipo.horasAcumuladas ?? 0}</p>
                  <p className="text-[11px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">Horómetro Actual</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">horas acumuladas</p>
                </div>
                <div className="border border-zinc-200 rounded-xl p-4 text-center bg-white shadow-sm flex flex-col items-center justify-center">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Último registro</p>
                  <p className="text-lg font-bold text-zinc-900 mt-1 font-mono tracking-tight">
                    {equipo.ultimaFechaHoras ? new Date(equipo.ultimaFechaHoras).toLocaleDateString('es-VE') : '—'}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">Planes: {(equipo.planes ?? []).length}</p>
                </div>
              </div>

              {/* Planes preventivos con Meta/Umbral */}
              {(equipo.planes ?? []).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Estado de Planes Preventivos</p>
                  {(equipo.planes ?? []).map(plan => {
                    const horasEquipo = equipo.horasAcumuladas ?? 0;
                    const base = plan.horasUltimaEjecucion ?? 0;
                    const frecuencia = plan.frecuenciaValor;
                    const meta = base + frecuencia;
                    const umbral = Math.max(2, Math.round(frecuencia * 0.1));
                    const horasRestantes = Math.max(0, meta - horasEquipo);
                    const pct = frecuencia > 0 ? Math.min(100, Math.max(0, ((horasEquipo - base) / frecuencia) * 100)) : 0;

                    let nivelAlerta = 'normal';
                    if (horasEquipo >= meta) nivelAlerta = 'critico';
                    else if (horasEquipo >= meta - umbral) nivelAlerta = 'advertencia';
                    else if (pct >= 70) nivelAlerta = 'precaucion';

                    const borderColor = nivelAlerta === 'critico' ? 'border-red-300 bg-red-50/50' :
                      nivelAlerta === 'advertencia' ? 'border-amber-300 bg-amber-50/50' :
                        nivelAlerta === 'precaucion' ? 'border-yellow-200 bg-yellow-50/50' :
                          'border-zinc-200 bg-white';
                    const barColor = nivelAlerta === 'critico' ? 'bg-red-500' :
                      nivelAlerta === 'advertencia' ? 'bg-amber-500' :
                        nivelAlerta === 'precaucion' ? 'bg-yellow-500' : 'bg-emerald-500';

                    return (
                      <div key={plan.id} className={`border rounded-xl p-4 shadow-sm ${borderColor}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-800 leading-tight">{plan.descripcionTarea}</p>
                            {nivelAlerta !== 'normal' && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-widest border border-transparent shadow-sm ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-yellow-500'}`}>
                                {nivelAlerta === 'critico' ? 'VENCIDO' : nivelAlerta === 'advertencia' ? 'EN AVISO PREVIO' : 'PRÓXIMO'}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {nivelAlerta === 'critico' && (
                              <a href={`/admin/mantenimiento?equipo=${equipo.id}&plan=${plan.id}`} className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap uppercase tracking-wider shadow-sm">
                                Ejecutar Mant.
                              </a>
                            )}
                            <span className="text-[11px] font-mono text-zinc-500 font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">c/{frecuencia}h</span>
                          </div>
                        </div>

                        {/* Info Meta/Umbral */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider mb-2">
                          <div className="bg-white/50 rounded-lg py-1 border border-zinc-100">
                            <p className="text-zinc-400">Base</p>
                            <p className="font-mono text-zinc-800 text-xs">{base}h</p>
                          </div>
                          <div className="bg-white/50 rounded-lg py-1 border border-zinc-100">
                            <p className="text-zinc-400">Meta</p>
                            <p className="font-mono text-zinc-800 text-xs">{meta}h</p>
                          </div>
                          <div className="bg-white/50 rounded-lg py-1 border border-zinc-100">
                            <p className="text-zinc-400">Aviso</p>
                            <p className="font-mono text-amber-700 text-xs">{umbral}h</p>
                          </div>
                          <div className="bg-white/50 rounded-lg py-1 border border-zinc-100">
                            <p className="text-zinc-400">Restante</p>
                            <p className={`font-mono text-xs ${nivelAlerta === 'critico' ? 'text-red-600' : nivelAlerta === 'advertencia' ? 'text-amber-600' : 'text-emerald-600'}`}>{horasRestantes}h</p>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="relative mt-3">
                          <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                          {/* Marca del umbral */}
                          <div
                            className="absolute top-0 w-1 h-1.5 bg-zinc-900 rounded-full shadow-[0_0_2px_rgba(255,255,255,1)]"
                            style={{ left: `${Math.max(0, ((frecuencia - umbral) / frecuencia) * 100)}%`, transform: 'translateX(-50%)' }}
                            title={`Margen de aviso a las ${meta - umbral}h`}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[9px] font-mono text-zinc-400">{base}h (última)</span>
                          <span className="text-[10px] font-mono font-bold text-zinc-800 relative -top-3 bg-white px-1 border border-zinc-200 rounded text-center min-w-[36px] shadow-sm">{horasEquipo}h</span>
                          <span className="text-[9px] font-mono text-zinc-400">{meta}h (meta)</span>
                        </div>
                        {plan.fechaUltimaEjecucion && (
                          <div className="mt-2 pt-2 border-t border-black/5 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Última Ejecución</span>
                            <span className="font-mono text-zinc-600">{fmtDate(plan.fechaUltimaEjecucion)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Sin planes preventivos</p>
                  <p className="text-[10px] text-zinc-400">Crea planes desde el módulo de Mantenimiento.</p>
                </div>
              )}

              {/* Formulario para registrar horas */}
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 shadow-sm mt-4">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Registrar Horas de Uso</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasInput}
                    onChange={(e) => setHorasInput(e.target.value)}
                    placeholder="Ej: 8"
                    className="flex-1 border border-zinc-200 rounded-lg py-2.5 px-4 text-sm font-mono focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 bg-white placeholder-zinc-400 shadow-sm transition-colors"
                  />
                  <button
                    onClick={async () => {
                      if (!horasInput || Number(horasInput) <= 0) return;
                      setHorasSaving(true);
                      try {
                        const res = await fetch(`/api/equipos/${equipo.id}/registrar-horas`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ horas: Number(horasInput) }),
                        });
                        const json = await res.json();
                        if (!json.ok) throw new Error(json.message);
                        // Refrescar equipo
                        const eq = await fetch(`/api/equipos/${equipo.id}`).then(r => r.json());
                        if (eq.ok) onSave(null, eq.data);
                        setHorasInput('');
                      } catch (e) {
                        console.error('Error registrando horas:', e);
                      } finally {
                        setHorasSaving(false);
                      }
                    }}
                    disabled={horasSaving || !horasInput || Number(horasInput) <= 0}
                    className="px-6 py-2.5 bg-zinc-900 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {horasSaving ? 'Guardando...' : 'Registrar'}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2">
                  Las horas se acumulan. Cada plan tiene su propia meta. Al ejecutar un plan desde Mantenimiento, su base se actualiza al horómetro actual y el ciclo reinicia para ese plan.
                </p>
              </div>
            </div>
          )}

          {/* ════ Certificaciones ════ */}
          {activeTab === 'certificaciones' && (
            <div className="px-6 py-4 space-y-3">

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Vigentes', val: certs.filter((c) => { const d = daysUntil(c.vencimiento); return d !== null && d >= 90; }).length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Por vencer', val: certs.filter((c) => { const d = daysUntil(c.vencimiento); return d !== null && d >= 0 && d < 90; }).length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: 'Vencidos', val: certs.filter((c) => { const d = daysUntil(c.vencimiento); return d !== null && d < 0; }).length, color: 'bg-red-50 text-red-700 border-red-200' },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center shadow-sm flex flex-col items-center justify-center ${color}`}>
                    <p className="text-3xl font-black font-mono tracking-tighter">{val}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Grid de tarjetas de certificaciones */}
              {certs.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <svg className="w-8 h-8 text-zinc-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Sin certificaciones</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {certs.map((cert) => {
                    const info = certBadge(cert.vencimiento);
                    const d = daysUntil(cert.vencimiento);
                    const isExp = d !== null && d < 0;
                    const isSoon = d !== null && d >= 0 && d < 90;
                    return (
                      <CertCard
                        key={cert.id}
                        cert={cert}
                        info={info}
                        d={d}
                        isExp={isExp}
                        isSoon={isSoon}
                        onRenovar={() => {
                          setNewCert({ nombre: cert.nombre || '', fechaEmision: '', duracionMeses: String(cert.duracionMeses), vencimiento: '' });
                          setShowCertForm(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}


              {/* Formulario nuevo certificado */}
              {showCertForm ? (
                <div className="border border-zinc-200 rounded-xl p-5 space-y-3 bg-zinc-50 shadow-sm mt-4">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Nuevo Certificado</p>
                  {certError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-[10px] font-mono text-red-700">{certError}</p>
                    </div>
                  )}
                  <Field label="Nombre de la Certificación">
                    <input
                      type="text"
                      value={newCert.nombre}
                      onChange={(e) => setNewCert((p) => ({ ...p, nombre: e.target.value }))}
                      placeholder="Ej: Certificación ISO 9001, Inspección Técnica..."
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Duración (meses)">
                      <input
                        type="number"
                        min="1"
                        value={newCert.duracionMeses}
                        onChange={(e) => {
                          const dm = e.target.value;
                          setNewCert((p) => {
                            const updated = { ...p, duracionMeses: dm };
                            if (p.fechaEmision && dm) {
                              const d = new Date(p.fechaEmision);
                              d.setMonth(d.getMonth() + parseInt(dm));
                              updated.vencimiento = d.toISOString().split('T')[0];
                            }
                            return updated;
                          });
                        }}
                        placeholder="Ej: 12"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Fecha de Emisión">
                      <input
                        type="date"
                        value={newCert.fechaEmision}
                        onChange={(e) => {
                          const fe = e.target.value;
                          setNewCert((p) => {
                            const updated = { ...p, fechaEmision: fe };
                            if (fe && p.duracionMeses) {
                              const d = new Date(fe);
                              d.setMonth(d.getMonth() + parseInt(p.duracionMeses));
                              updated.vencimiento = d.toISOString().split('T')[0];
                            }
                            return updated;
                          });
                        }}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Fecha de Vencimiento">
                    <input
                      type="date"
                      value={newCert.vencimiento}
                      onChange={(e) => setNewCert((p) => ({ ...p, vencimiento: e.target.value }))}
                      className={inputCls}
                      min={newCert.fechaEmision || undefined}
                    />
                  </Field>
                  <div className="flex gap-2 pt-2 border-t border-zinc-200 mt-3">
                    <button
                      onClick={handleAddCert}
                      disabled={certSaving}
                      className="flex-1 py-2.5 bg-zinc-900 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-60 flex justify-center items-center gap-2 shadow-sm"
                    >
                      {certSaving ? 'Guardando...' : 'Guardar Certificado'}
                    </button>
                    <button
                      onClick={() => setShowCertForm(false)}
                      className="px-5 py-2.5 border border-zinc-200 text-zinc-500 hover:text-zinc-900 text-[11px] uppercase tracking-wider font-bold rounded-lg hover:bg-white bg-zinc-100 transition-colors shadow-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCertForm(true)}
                  className="w-full py-3.5 border border-dashed border-zinc-300 hover:border-zinc-500 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 bg-zinc-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Certificado
                </button>
              )}
            </div>
          )}

          {/* ════ Mantenimientos ════ */}
          {activeTab === 'mantenimientos' && (
            <div className="px-6 py-4 space-y-3">
              {mantenimientos.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <svg className="w-8 h-8 text-zinc-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Sin registros de mantenimiento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mantenimientos.map((m) => {
                    const tipoBg = {
                      PREVENTIVO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                      CORRECTIVO: 'bg-amber-100 text-amber-700 border-amber-200',
                      PREDICTIVO: 'bg-cyan-100 text-cyan-700 border-cyan-200',
                    }[m.tipo?.nombre] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';
                    return (
                      <div key={m.id} className="border border-zinc-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${tipoBg}`}>
                            {m.tipo?.nombre ?? 'SIN TIPO'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded bg-zinc-50">{fmtDate(m.fechaServicio)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          <div>
                            <span className="block mb-0.5">Lectura</span>
                            <span className="font-mono text-zinc-900 border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 rounded shadow-sm">
                              {m.lecturaActual?.toLocaleString() ?? '—'} {equipo.parametro?.unidad ?? ''}
                            </span>
                          </div>
                          {m.costoTotal != null && (
                            <div>
                              <span className="block mb-0.5">Costo</span>
                              <span className="font-mono text-zinc-900 border border-zinc-200 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded shadow-sm">
                                ${Number(m.costoTotal).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {m.observaciones && (
                          <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-200 italic">"{m.observaciones}"</p>
                        )}
                        {m.repuestos && m.repuestos.length > 0 && (
                          <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5">
                            {m.repuestos.map(rr => (
                              <span key={rr.id} className="inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 rounded border border-zinc-200 shadow-sm">
                                <span className="bg-zinc-900 px-1 py-0.5 rounded text-white font-mono">{rr.cantidad}x</span>
                                <span className="truncate max-w-[120px]">{rr.repuesto?.nombre}</span> {rr.repuesto?.codigo ? <span className="text-zinc-400 font-mono">({rr.repuesto.codigo})</span> : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3 bg-zinc-900 text-white rounded-xl px-4 py-3 shadow-sm mt-4">
                <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-zinc-300 font-medium">
                  Ir al módulo de <strong className="text-white">Mantenimiento</strong> para registrar nuevos trabajos.
                </p>
              </div>
            </div>
          )}

          {/* ════ Planes Preventivos ════ */}
          {activeTab === 'planes' && (
            <div className="px-6 py-4 space-y-3">
              {planes.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <svg className="w-8 h-8 text-zinc-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Sin planes preventivos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {planes.map((plan) => {
                    const horasEquipo = equipo.horasAcumuladas ?? 0;
                    const base = plan.horasUltimaEjecucion ?? 0;
                    const frecuencia = plan.frecuenciaValor;
                    const meta = base + frecuencia;
                    const umbral = Math.max(2, Math.round(frecuencia * 0.1));
                    const pct = frecuencia > 0 ? Math.min(100, Math.max(0, ((horasEquipo - base) / frecuencia) * 100)) : 0;

                    let nivelAlerta = 'normal';
                    if (horasEquipo >= meta) nivelAlerta = 'critico';
                    else if (horasEquipo >= meta - umbral) nivelAlerta = 'advertencia';
                    else if (pct >= 70) nivelAlerta = 'precaucion';

                    return (
                      <div key={plan.id} className={`border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2 ${nivelAlerta === 'critico' ? 'border-red-200 bg-red-50/50' : nivelAlerta === 'advertencia' ? 'border-amber-200 bg-amber-50/50' : 'border-zinc-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            Plan #{plan.id}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                            Frecuencia: {plan.frecuenciaValor ?? '—'} {equipo.parametro?.unidad ?? ''}
                          </span>
                        </div>
                        {plan.descripcionTarea && (
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-sm font-bold text-zinc-800 flex-1 leading-tight">{plan.descripcionTarea}</p>
                            {nivelAlerta !== 'normal' && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap uppercase tracking-widest shadow-sm border border-transparent ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-yellow-500'}`}>
                                {nivelAlerta === 'critico' ? 'VENCIDO' : nivelAlerta === 'advertencia' ? 'EN AVISO PREVIO' : 'PRÓXIMO'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-2 h-1.5 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3 bg-zinc-900 text-white rounded-xl px-4 py-3 shadow-sm mt-4">
                <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-zinc-300 font-medium">
                  Los planes preventivos se crean y administran desde <strong className="text-white">Mantenimiento</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ════ Fallas ════ */}
          {activeTab === 'fallas' && (
            <div className="px-6 py-4 space-y-3">
              {/* Estado operativo */}
              <div className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'text-red-800' : 'text-emerald-800'}`}>
                      {equipo.estadoOperativo === 'NO_OPERATIVO' ? 'Equipo No Operativo' : 'Equipo Operativo'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono font-bold tracking-wider">{fallasAbiertas.length} FALLA{fallasAbiertas.length !== 1 ? 'S' : ''} ABIERTA{fallasAbiertas.length !== 1 ? 'S' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleEstado}
                  disabled={estadoSaving}
                  className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm ${equipo.estadoOperativo === 'NO_OPERATIVO'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                    }`}
                >
                  {estadoSaving ? '...' : equipo.estadoOperativo === 'NO_OPERATIVO' ? 'Marcar Operativo' : 'Marcar No Operativo'}
                </button>
              </div>

              {/* KPIs fallas */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total', val: fallas.length, color: 'bg-zinc-50 text-zinc-700 border-zinc-200' },
                  { label: 'Abiertas', val: fallas.filter(f => f.estado === 'ABIERTA').length, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'En Proceso', val: fallas.filter(f => f.estado === 'EN_PROCESO').length, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                  { label: 'Resueltas', val: fallas.filter(f => f.estado === 'RESUELTA').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center shadow-sm flex flex-col items-center justify-center ${color}`}>
                    <p className="text-3xl font-black font-mono tracking-tighter">{val}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Lista de fallas */}
              {fallas.length === 0 && !showFallaForm && (
                <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <svg className="w-8 h-8 text-zinc-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Sin fallas registradas</p>
                </div>
              )}

              {fallas.map((falla) => {
                const sevCfg = {
                  BAJA: { bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
                  MEDIA: { bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
                  ALTA: { bg: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
                  CRITICA: { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
                }[falla.severidad] ?? { bg: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' };
                const estCfg = {
                  ABIERTA: 'bg-orange-100 text-orange-800 border-orange-200',
                  EN_PROCESO: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  RESUELTA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                }[falla.estado] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';

                return (
                  <div key={falla.id} className={`border rounded-xl p-4 shadow-sm flex flex-col gap-2 ${falla.estado === 'RESUELTA' ? 'border-zinc-200 bg-zinc-50/50 opacity-80' : 'border-zinc-200 bg-white'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${estCfg}`}>
                          {falla.estado}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${sevCfg.bg}`}>
                          {falla.severidad}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded bg-zinc-50">{fmtDate(falla.fecha)}</span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800 leading-tight mb-1">{falla.descripcion}</p>
                    {falla.solucion && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 rounded-lg p-2.5 border border-emerald-200 shadow-sm mt-1">
                        <strong className="uppercase tracking-wider mr-1">Solución:</strong> {falla.solucion}
                      </p>
                    )}
                    {falla.fechaResolucion && (
                      <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        <span>Resuelta</span>
                        <span className="font-mono text-zinc-600">{fmtDate(falla.fechaResolucion)}</span>
                      </div>
                    )}
                    {(falla.responsable || falla.costoReparacion) && (
                      <div className="flex items-center gap-4 mt-2 mb-1">
                        {falla.responsable && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {falla.responsable}
                          </span>
                        )}
                        {falla.costoReparacion && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-mono">${Number(falla.costoReparacion).toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    )}
                    {falla.estado !== 'RESUELTA' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100">
                        {falla.estado === 'ABIERTA' && (
                          <button onClick={() => handleUpdateFalla(falla.id, { estado: 'EN_PROCESO' })} className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200 rounded-lg transition-colors shadow-sm">Marcar: En Proceso</button>
                        )}
                        <button
                          onClick={() => setResolverFallaModal({ visible: true, fallaId: falla.id, solucion: '' })}
                          className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors shadow-sm"
                        >Resolver Falla</button>
                      </div>
                    )}
                    <div className="pt-2">
                      <FallaArchivos fallaId={falla.id} />
                    </div>
                  </div>
                );
              })}


              {/* Formulario nueva falla */}
              {showFallaForm ? (
                <div className="border border-red-200 rounded-xl p-5 space-y-3 bg-red-50/50 shadow-sm mt-4">
                  <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-2">Registrar Nueva Falla</p>
                  <Field label="Descripción de la falla">
                    <textarea
                      value={newFalla.descripcion}
                      onChange={(e) => setNewFalla(p => ({ ...p, descripcion: e.target.value }))}
                      rows={3}
                      className={`${inputCls} resize-none`}
                      placeholder="Describe la falla detectada..."
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Severidad">
                      <select value={newFalla.severidad} onChange={(e) => setNewFalla(p => ({ ...p, severidad: e.target.value }))} className={selectCls}>
                        <option value="BAJA">Baja</option>
                        <option value="MEDIA">Media</option>
                        <option value="ALTA">Alta</option>
                        <option value="CRITICA">Crítica</option>
                      </select>
                    </Field>
                    <Field label="Fecha">
                      <input type="date" value={newFalla.fecha} onChange={(e) => setNewFalla(p => ({ ...p, fecha: e.target.value }))} className={inputCls} />
                    </Field>
                  </div>
                  {(newFalla.severidad === 'ALTA' || newFalla.severidad === 'CRITICA') && (
                    <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-red-800">Una falla <strong className="font-mono text-red-900 border border-red-200 bg-red-50 px-1 py-0.5 rounded ml-1 mr-1">{newFalla.severidad}</strong> marcará automáticamente el equipo como <strong className="text-red-900 border-b border-red-900 ml-1">No Operativo</strong>.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Responsable">
                      <input
                        type="text"
                        value={newFalla.responsable}
                        onChange={(e) => setNewFalla(p => ({ ...p, responsable: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Costo Estimado ($)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newFalla.costoReparacion}
                        onChange={(e) => setNewFalla(p => ({ ...p, costoReparacion: e.target.value }))}
                        placeholder="Ej: 150.00"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-red-200 mt-2">
                    <button onClick={handleAddFalla} disabled={fallaSaving} className="flex-1 py-2.5 bg-red-600 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 shadow-sm">
                      {fallaSaving ? 'Guardando...' : 'Registrar Falla'}
                    </button>
                    <button onClick={() => setShowFallaForm(false)} className="px-5 py-2.5 border border-red-200 text-red-700 bg-red-100 hover:bg-red-200 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-colors shadow-sm">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowFallaForm(true)}
                  className="w-full py-3.5 border border-dashed border-zinc-300 hover:border-red-400 hover:bg-red-50 text-zinc-500 hover:text-red-600 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 bg-zinc-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Confirmar Falla
                </button>
              )}
            </div>
          )}

          {/* ════ Historial Horas ════ */}
          {activeTab === 'historial_horas' && (
            <HistorialHorasTab equipoId={equipo.id} />
          )}

          {/* ════ Adjuntos / Archivos ════ */}
          {activeTab === 'adjuntos' && (
            <div className="px-6 py-4">
              <ArchivosPanel attachableType="equipo" attachableId={equipo.id} />
            </div>
          )}

        </div>
      </div >

      {/* Modal dinámico para catálogos */}
      <NuevoCatalogoModal
        visible={catalogModal.visible}
        title={catalogModal.label}
        error={catalogModal.error}
        onClose={() => setCatalogModal({ visible: false, type: '', label: '', error: null })}
        onSave={handleSaveCatalog}
      />

      {/* Modal para resolver falla */}
      {resolverFallaModal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm shadow-xl"
            onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
            <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Resolver Falla</h3>
              <button
                onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Solución aplicada <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={resolverFallaModal.solucion}
                onChange={(e) => setResolverFallaModal({ ...resolverFallaModal, solucion: e.target.value })}
                placeholder="Describe la solución detallada que se aplicó para resolver esta falla..."
                autoFocus
              />
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3 justify-end items-center">
              <button
                onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (resolverFallaModal.solucion.trim()) {
                    handleUpdateFalla(resolverFallaModal.fallaId, { estado: 'RESUELTA', solucion: resolverFallaModal.solucion.trim() });
                    setResolverFallaModal({ visible: false, fallaId: null, solucion: '' });
                  }
                }}
                disabled={!resolverFallaModal.solucion.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-sm uppercase tracking-wider"
              >
                Resolver Falla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
