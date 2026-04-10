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
  if (d === null) return { label: 'Sin fecha', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', alert: false };
  if (d < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', alert: true };
  if (d < 30) return { label: `${d}d`, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', alert: true };
  if (d < 90) return { label: `${d}d`, color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', alert: false };
  return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', alert: false };
};

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-VE') : '—';

/* ─── CertCard ────────────────────────────────────────────────── */
const CertCard = ({ cert, info, d, isExp, isSoon, onRenovar }) => {
  const [showFiles, setShowFiles] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden ${isExp ? 'border-red-200' : isSoon ? 'border-amber-200' : 'border-slate-200'}`}>
      {/* Header */}
      <div className={`p-4 ${isExp ? 'bg-red-50/50' : isSoon ? 'bg-amber-50/50' : 'bg-white'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>
                {isExp ? 'VENCIDO' : isSoon ? `${d}d para vencer` : 'VIGENTE'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{cert.nombre || 'Certificación'}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span>Emisión: <strong className="text-slate-700">{fmtDate(cert.fechaEmision)}</strong></span>
              <span>·</span>
              <span>Vence: <strong className={isExp ? 'text-red-700' : isSoon ? 'text-amber-700' : 'text-slate-700'}>{fmtDate(cert.vencimiento)}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isExp && (
              <button onClick={onRenovar}
                className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Renovar
              </button>
            )}
            <button
              onClick={() => setShowFiles(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${showFiles ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
        <div className="border-t border-slate-100 p-4 bg-slate-50/60">
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
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {onAdd && (
        <button
          onClick={onAdd}
          className="text-white bg-blue-600 hover:bg-blue-700 w-5 h-5 rounded-md flex items-center justify-center transition-colors shadow-sm"
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

const inputCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';
const selectCls = `${inputCls} pr-8`;

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
      <div className={`flex items-center border rounded-xl bg-white overflow-visible ${open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}>
        {selected && !open ? (
          <div className="flex items-center flex-1 pl-3 py-2.5 gap-2">
            <span className="text-sm text-slate-800 flex-1 truncate">{selected.nombre}</span>
            <button type="button" onClick={handleClear} className="mr-2 text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Quitar selección">
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
            className="flex-1 py-2.5 px-3 text-sm bg-transparent outline-none placeholder-slate-400"
          />
        )}
      </div>

      {open && (filtered.length > 0 || showCreate) && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(item => (
            <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 group">
              <span className="flex-1 cursor-pointer" onClick={() => handleSelect(item)}>{item.nombre}</span>
              {onDelete && (
                delConfirm === item.id ? (
                  <div className="flex items-center gap-1 ml-2">
                    <button type="button" onClick={() => { onDelete(item); setDelConfirm(null); setOpen(false); }} className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-bold">Eliminar</button>
                    <button type="button" onClick={() => setDelConfirm(null)} className="text-[10px] px-2 py-0.5 bg-slate-200 rounded font-bold">No</button>
                  </div>
                ) : (
                  <button type="button" onClick={e => { e.stopPropagation(); setDelConfirm(item.id); }}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all" title="Eliminar">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )
              )}
            </li>
          ))}
          {showCreate && (
            <li onClick={handleCreate} className="flex items-center gap-2 px-3 py-2.5 text-sm text-blue-700 font-semibold hover:bg-blue-50 cursor-pointer border-t border-slate-100">
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-xl"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          {error && <p className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
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
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            disabled={!nombre.trim() || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(nombre.trim());
              setSaving(false);
            }}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
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
  const [repuestosOptions, setRepuestosOptions] = useState([]);
  const [repuestosSeleccionados, setRepuestosSeleccionados] = useState([]);
  // ── Tab Repuestos: lista + CRUD ──
  const [repuestosDrawer, setRepuestosDrawer] = useState([]);
  const [repuestoSel, setRepuestoSel] = useState(null);
  const [repuestosLoading, setRepuestosLoading] = useState(false);
  const [repuestoForm, setRepuestoForm] = useState({ nombre: '', tipoRepuestoId: '', codigo: '', costo: '' });
  const [repuestoEditId, setRepuestoEditId] = useState(null);
  const [repuestoShowForm, setRepuestoShowForm] = useState(false);
  const [repuestoSaving, setRepuestoSaving] = useState(false);
  const [repuestoError, setRepuestoError] = useState(null);
  const [tiposRepuestoDrawer, setTiposRepuestoDrawer] = useState([]);

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

        // Cargar repuestos del equipo
        setRepuestosLoading(true);
        fetch(`/api/repuestos?equipoId=${equipo.id}`)
          .then(r => r.json())
          .then(json => {
            const data = json.data ?? [];
            setRepuestosOptions(data);
            setRepuestosDrawer(data);
            setRepuestosSeleccionados([]);
            setRepuestoSel(null);
            setRepuestoShowForm(false);
            setRepuestoEditId(null);
          })
          .catch(err => { console.error('Error cargando repuestos:', err); setRepuestosDrawer([]); setRepuestosOptions([]); })
          .finally(() => setRepuestosLoading(false));
        // Cargar tipos de repuesto
        fetch('/api/catalogos/tipos-repuestos')
          .then(r => r.json())
          .then(json => setTiposRepuestoDrawer(json.data ?? []))
          .catch(console.error);

        prevEquipoId.current = equipo.id;
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
      const payload = {
        ...newFalla,
        repuestos: repuestosSeleccionados.map(r => ({
          repuestoId: r.id,
          cantidad: r.cantidad,
        })),
      };
      const res = await fetch(`/api/equipos/${equipo.id}/fallas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      if (json.equipo) onSave(null, json.equipo);
      setNewFalla({ descripcion: '', severidad: 'MEDIA', fecha: new Date().toISOString().split('T')[0], responsable: '', costoReparacion: '' });
      setRepuestosSeleccionados([]);
      setShowFallaForm(false);
    } catch (e) {
      console.error('Error registrando falla:', e);
    } finally {
      setFallaSaving(false);
    }
  };

  /* ── handler: toggle repuesto en falla ── */
  const toggleRepuestoFalla = (repuesto) => {
    const yaSeleccionado = repuestosSeleccionados.find(r => r.id === repuesto.id);
    if (yaSeleccionado) {
      setRepuestosSeleccionados(prev => prev.filter(r => r.id !== repuesto.id));
    } else {
      setRepuestosSeleccionados(prev => [...prev, { id: repuesto.id, nombre: repuesto.nombre, codigo: repuesto.codigo, cantidad: 1 }]);
    }
  };

  const updateRepCantidadFalla = (repuestoId, cantidad) => {
    setRepuestosSeleccionados(prev =>
      prev.map(r =>
        r.id === repuestoId ? { ...r, cantidad: Math.max(1, Number(cantidad) || 1) } : r
      )
    );
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
    { id: 'repuestos', label: 'Repuestos', badge: 0 },
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-400">{isNew ? 'Nuevo equipo' : 'Editar equipo'}</span>
          </div>
          <div className="flex items-center gap-2">
            {saveError && (
              <span className="text-xs text-red-500 font-medium">{saveError}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              title={!hasChanges ? 'Sin cambios pendientes' : ''}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── CARD resumen del equipo (solo en modo edición) ── */}
        {!isNew && (
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                {equipo.codigo?.charAt(0) ?? 'E'}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{equipo.codigo}</h3>
                <p className="text-xs text-slate-400 truncate">
                  {equipo.marca?.nombre ?? '—'} · {equipo.modelo} · {equipo.ubicacion?.nombre ?? '—'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {equipo.estadoOperativo === 'NO_OPERATIVO' ? 'No Operativo' : 'Operativo'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${equipo.factura ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
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
                <button onClick={() => setActiveTab('planes')} className="mt-3 w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-red-100 transition-colors text-left">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-xs text-red-700 font-medium flex-1">
                    <strong>¡Mantenimiento requerido!</strong> {vencidos.length} Plan(es) vencido(s).
                  </p>
                  <span className="text-xs font-bold text-red-600 underline">Ver Planes</span>
                </button>
              );
              if (proximos.length > 0) return (
                <button onClick={() => setActiveTab('planes')} className="mt-3 w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-amber-100 transition-colors text-left">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xs text-amber-700 font-medium flex-1">
                    <strong>Mantenimiento próximo:</strong> {proximos.length} Plan(es) en margen de aviso.
                  </p>
                  <span className="text-xs font-bold text-amber-600 underline">Ver Planes</span>
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
        <div className="relative border-b border-slate-100 bg-white shrink-0 group">
          <div id="drawer-tabs-container" className="flex px-3 sm:px-5 pr-16 pl-12 gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth relative z-0">
            {TABS.filter(t => isNew ? t.id === 'general' : true).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-3 sm:px-4 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
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
                className="absolute right-0 top-0 bottom-0 px-2 bg-gradient-to-l from-white via-white/90 to-transparent flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-[-4px_0_8px_-2px_rgba(255,255,255,0.8)] z-10 transition-colors opacity-0 group-hover:opacity-100"
                title="Desplazar a la derecha"
              >
                <div className="bg-white rounded-full p-1 border border-slate-200 shadow-sm">
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

          {/* ════ Repuestos ════ */}
          {activeTab === 'repuestos' && (() => {
            const fetchRepuestosDrawer = () => {
              setRepuestosLoading(true);
              fetch(`/api/repuestos?equipoId=${equipo?.id}`)
                .then(r => r.json())
                .then(json => {
                  const data = json.data ?? [];
                  setRepuestosDrawer(data);
                  setRepuestosOptions(data);
                })
                .catch(console.error)
                .finally(() => setRepuestosLoading(false));
            };
            const handleRepSave = async () => {
              if (!repuestoForm.nombre.trim()) { setRepuestoError('El nombre es obligatorio'); return; }
              setRepuestoSaving(true); setRepuestoError(null);
              try {
                let tipoId = null;
                if (repuestoForm.tipoRepuestoId) {
                  const v = String(repuestoForm.tipoRepuestoId).trim();
                  if (/^\d+$/.test(v)) {
                    tipoId = Number(v);
                  } else {
                    const exist = tiposRepuestoDrawer.find(t => t.nombre.toLowerCase() === v.toLowerCase());
                    if (exist) { tipoId = exist.id; }
                    else {
                      const r2 = await fetch('/api/catalogos/tipos-repuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: v }) });
                      const j2 = await r2.json();
                      if (!j2.ok) throw new Error(j2.message);
                      tipoId = j2.data.id;
                      setTiposRepuestoDrawer(p => [...p, j2.data]);
                    }
                  }
                }
                const url = repuestoEditId ? `/api/repuestos/${repuestoEditId}` : '/api/repuestos';
                const method = repuestoEditId ? 'PUT' : 'POST';
                const body = { nombre: repuestoForm.nombre, tipoRepuestoId: tipoId, codigo: repuestoForm.codigo || null, costo: repuestoForm.costo !== '' ? Number(repuestoForm.costo) : null, ...(!repuestoEditId && { equipoId: equipo?.id }) };
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                const json = await res.json();
                if (!json.ok) throw new Error(json.message);
                fetchRepuestosDrawer();
                setRepuestoShowForm(false); setRepuestoEditId(null); setRepuestoForm({ nombre: '', tipoRepuestoId: '', codigo: '', costo: '' });
                if (repuestoSel && repuestoSel.id === repuestoEditId) setRepuestoSel(null);
              } catch (e) { setRepuestoError(e.message || 'Error al guardar'); }
              finally { setRepuestoSaving(false); }
            };
            const handleRepDelete = async (id) => {
              try {
                await fetch(`/api/repuestos/${id}`, { method: 'DELETE' });
                fetchRepuestosDrawer();
                if (repuestoSel?.id === id) setRepuestoSel(null);
              } catch (e) { console.error(e); }
            };
            const handleRepEdit = (r) => {
              setRepuestoSel(r);
              setRepuestoForm({ nombre: r.nombre, tipoRepuestoId: r.tipoRepuesto?.id ?? '', codigo: r.codigo || '', costo: r.costo ?? '' });
              setRepuestoEditId(r.id);
              setRepuestoShowForm(true);
              setRepuestoError(null);
            };
            const inputClsR = 'w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';
            return (
              <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                {/* Lista izquierda */}
                <div className="w-56 shrink-0 border-r border-slate-100 overflow-y-auto flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repuestos</p>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{repuestosDrawer.length}</span>
                  </div>
                  {repuestosLoading ? (
                    <div className="p-4 text-center text-xs text-slate-400">Cargando...</div>
                  ) : repuestosDrawer.length === 0 ? (
                    <div className="p-6 text-center">
                      <svg className="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <p className="text-xs text-slate-400">Sin repuestos</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 flex-1">
                      {repuestosDrawer.map(r => (
                        <button key={r.id} onClick={() => { setRepuestoSel(r); setRepuestoShowForm(false); setRepuestoEditId(null); }}
                          className={`w-full text-left px-4 py-3 transition-colors ${ repuestoSel?.id === r.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700' }`}
                        >
                          <p className={`text-xs font-semibold truncate ${repuestoSel?.id === r.id ? 'text-white' : 'text-slate-800'}`}>{r.nombre}</p>
                          {r.tipoRepuesto && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold mt-0.5 inline-block ${ repuestoSel?.id === r.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700' }`}>
                              {r.tipoRepuesto.nombre}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Botón agregar al pie de la lista */}
                  <button
                    onClick={() => { setRepuestoSel(null); setRepuestoForm({ nombre: '', tipoRepuestoId: '', codigo: '', costo: '' }); setRepuestoEditId(null); setRepuestoShowForm(true); setRepuestoError(null); }}
                    className="shrink-0 m-3 py-2 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Agregar
                  </button>
                </div>

                {/* Panel derecho: detalle / formulario */}
                <div className="flex-1 overflow-y-auto">
                  {repuestoShowForm ? (
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-sm font-bold text-slate-900">{repuestoEditId ? 'Editar Repuesto' : 'Nuevo Repuesto'}</p>
                      {repuestoError && <p className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{repuestoError}</p>}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre <span className="text-red-500">*</span></label>
                        <input value={repuestoForm.nombre} onChange={e => setRepuestoForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Filtro de aceite" className={inputClsR} autoFocus />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
                          <input value={repuestoForm.tipoRepuestoId} onChange={e => setRepuestoForm(p => ({ ...p, tipoRepuestoId: e.target.value }))} placeholder="Ej: Filtro" list="tipos-drawer-list" className={inputClsR} />
                          <datalist id="tipos-drawer-list">{tiposRepuestoDrawer.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}</datalist>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Código / Ref.</label>
                          <input value={repuestoForm.codigo} onChange={e => setRepuestoForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ej: HF-101" className={inputClsR} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Costo estimado unitario ($)</label>
                        <input type="number" min="0" step="0.01" value={repuestoForm.costo} onChange={e => setRepuestoForm(p => ({ ...p, costo: e.target.value }))} placeholder="45.00" className={inputClsR} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleRepSave} disabled={repuestoSaving} className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors">
                          {repuestoSaving ? 'Guardando...' : repuestoEditId ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button onClick={() => { setRepuestoShowForm(false); setRepuestoEditId(null); setRepuestoError(null); }} className="px-3 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  ) : !repuestoSel ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 px-4">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <p className="text-sm text-center">Seleccioná un repuesto para ver sus detalles</p>
                    </div>
                  ) : (
                    <div className="px-5 py-4 space-y-4">
                      {/* Encabezado con acciones */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{repuestoSel.nombre}</h3>
                          {repuestoSel.codigo && <p className="text-xs font-mono text-slate-400 bg-slate-50 inline-block px-2 py-0.5 rounded mt-0.5">{repuestoSel.codigo}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleRepEdit(repuestoSel)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => { if(window.confirm('¿Eliminar este repuesto?')) handleRepDelete(repuestoSel.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      {repuestoSel.tipoRepuesto && (
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{repuestoSel.tipoRepuesto.nombre}</span>
                      )}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Costo estimado unitario</p>
                        <p className={`text-2xl font-black ${repuestoSel.costo != null ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {repuestoSel.costo != null ? `$${Number(repuestoSel.costo).toFixed(2)}` : '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipo de Equipo</label>
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación</label>
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Propietario</label>
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
              <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/60">
                <input
                  id="factura-check"
                  type="checkbox"
                  checked={form.factura}
                  onChange={(e) => handleChange('factura', e.target.checked)}
                  className="w-4 h-4 rounded accent-slate-800"
                />
                <label htmlFor="factura-check" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
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
                <div className="border border-slate-200 rounded-xl p-3 text-center bg-white">
                  <p className="text-4xl font-black text-blue-600">{equipo.horasAcumuladas ?? 0}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Horómetro Actual</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">horas acumuladas de uso</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 text-center bg-white">
                  <p className="text-sm text-slate-500 mt-1">Último registro</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {equipo.ultimaFechaHoras ? new Date(equipo.ultimaFechaHoras).toLocaleDateString('es-VE') : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Planes preventivos: {(equipo.planes ?? []).length}</p>
                </div>
              </div>

              {/* Planes preventivos con Meta/Umbral */}
              {(equipo.planes ?? []).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Planes Preventivos</p>
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

                    const borderColor = nivelAlerta === 'critico' ? 'border-red-300 bg-red-50' :
                      nivelAlerta === 'advertencia' ? 'border-amber-300 bg-amber-50' :
                        nivelAlerta === 'precaucion' ? 'border-yellow-200 bg-yellow-50' :
                          'border-slate-200 bg-white';
                    const barColor = nivelAlerta === 'critico' ? 'bg-red-500' :
                      nivelAlerta === 'advertencia' ? 'bg-amber-500' :
                        nivelAlerta === 'precaucion' ? 'bg-yellow-500' : 'bg-emerald-500';

                    return (
                      <div key={plan.id} className={`border rounded-lg p-3 ${borderColor}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">{plan.descripcionTarea}</p>
                            {nivelAlerta !== 'normal' && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-yellow-500'}`}>
                                {nivelAlerta === 'critico' ? 'VENCIDO' : nivelAlerta === 'advertencia' ? 'EN AVISO PREVIO' : 'PRÓXIMO'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {nivelAlerta === 'critico' && (
                              <a href={`/admin/mantenimiento?equipo=${equipo.id}&plan=${plan.id}`} className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-[10px] font-bold rounded transition-colors whitespace-nowrap">
                                + Ejecutar Mant.
                              </a>
                            )}
                            <span className="text-xs font-mono text-slate-500">c/{frecuencia}h</span>
                          </div>
                        </div>

                        {/* Info Meta/Umbral */}
                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-2">
                          <div>
                            <p className="text-slate-400">Base</p>
                            <p className="font-bold text-slate-700">{base}h</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Meta</p>
                            <p className="font-bold text-blue-700">{meta}h</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Aviso Previo</p>
                            <p className="font-bold text-amber-600">{umbral}h</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Restantes</p>
                            <p className={`font-bold ${nivelAlerta === 'critico' ? 'text-red-600' : nivelAlerta === 'advertencia' ? 'text-amber-600' : 'text-emerald-600'}`}>{horasRestantes}h</p>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="relative">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          {/* Marca del umbral */}
                          <div
                            className="absolute top-0 w-0.5 h-2 bg-slate-800 opacity-40"
                            style={{ left: `${Math.max(0, ((frecuencia - umbral) / frecuencia) * 100)}%` }}
                            title={`Margen de aviso a las ${meta - umbral}h`}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{base}h (última ejec.)</span>
                          <span className="text-[10px] text-slate-400">{horasEquipo}h actual</span>
                          <span className="text-[10px] text-slate-400">{meta}h (meta)</span>
                        </div>
                        {plan.fechaUltimaEjecucion && (
                          <p className="text-[10px] text-slate-400 mt-1">Última ejecución: {new Date(plan.fechaUltimaEjecucion).toLocaleDateString('es-VE')}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">Sin planes preventivos configurados.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Crea planes desde el módulo de Mantenimiento para visualizar metas aquí.</p>
                </div>
              )}

              {/* Formulario para registrar horas */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <p className="text-sm font-bold text-slate-900 mb-2">Registrar Horas de Uso</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasInput}
                    onChange={(e) => setHorasInput(e.target.value)}
                    placeholder="Ej: 8 horas trabajadas hoy"
                    className="flex-1 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
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
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {horasSaving ? 'Guardando...' : 'Registrar'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
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
                  <div key={label} className={`border rounded-lg p-2 text-center ${color}`}>
                    <p className="text-2xl font-bold">{val}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Grid de tarjetas de certificaciones */}
              {certs.length === 0 ? (
                <div className="py-6 text-center">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-sm text-slate-400">Sin certificaciones registradas</p>
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
                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50">
                  <p className="text-sm font-bold text-slate-900">Nuevo Certificado</p>
                  {certError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-red-700">{certError}</p>
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
                  <div className="flex gap-2 pt-1 border-t border-slate-100 mt-2">
                    <button
                      onClick={handleAddCert}
                      disabled={certSaving}
                      className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 flex justify-center items-center gap-2"
                    >
                      {certSaving ? 'Guardando...' : '✓ Guardar Certificado'}
                    </button>
                    <button
                      onClick={() => setShowCertForm(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCertForm(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
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
                <div className="py-8 text-center">
                  <svg className="w-9 h-9 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-slate-400 font-medium">Sin registros de mantenimiento</p>
                  <p className="text-xs text-slate-300 mt-1">Los mantenimientos se gestionan desde el módulo de Mantenimiento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mantenimientos.map((m) => {
                    const tipoBg = {
                      PREVENTIVO: 'bg-blue-100 text-blue-700',
                      CORRECTIVO: 'bg-amber-100 text-amber-700',
                      PREDICTIVO: 'bg-cyan-100 text-cyan-700',
                    }[m.tipo?.nombre] ?? 'bg-slate-100 text-slate-600';
                    return (
                      <div key={m.id} className="border border-slate-100 rounded-xl p-3 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoBg}`}>
                            {m.tipo?.nombre ?? 'SIN TIPO'}
                          </span>
                          <span className="text-xs text-slate-400">{fmtDate(m.fechaServicio)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Lectura: </span>
                            <span className="font-semibold text-slate-700 font-mono">
                              {m.lecturaActual?.toLocaleString() ?? '—'} {equipo.parametro?.unidad ?? ''}
                            </span>
                          </div>
                          {m.costoTotal != null && (
                            <div>
                              <span className="text-slate-400">Costo: </span>
                              <span className="font-semibold text-slate-700">
                                ${Number(m.costoTotal).toLocaleString()}
                              </span>
                            </div>
                          )}

                        </div>
                        {m.observaciones && (
                          <p className="text-xs text-slate-500 mt-2 italic">"{m.observaciones}"</p>
                        )}
                        {m.repuestos && m.repuestos.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {m.repuestos.map(rr => (
                              <span key={rr.id} className="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-600 rounded">
                                <span className="bg-white px-1 py-0.5 rounded font-bold text-slate-900 border border-slate-200">{rr.cantidad}x</span>
                                {rr.repuesto?.nombre} {rr.repuesto?.codigo ? `(${rr.repuesto.codigo})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  Para registrar nuevos mantenimientos, ve al módulo de <strong>Mantenimiento</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ════ Planes Preventivos ════ */}
          {activeTab === 'planes' && (
            <div className="px-6 py-4 space-y-3">
              {planes.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="w-9 h-9 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-slate-400 font-medium">Sin planes preventivos</p>
                  <p className="text-xs text-slate-300 mt-1">Los planes se gestionan desde el módulo de Mantenimiento</p>
                </div>
              ) : (
                <div className="space-y-2">
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
                      <div key={plan.id} className={`border rounded-xl p-3 bg-white ${nivelAlerta === 'critico' ? 'border-red-200 bg-red-50' : nivelAlerta === 'advertencia' ? 'border-amber-200 bg-amber-50' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-800">
                            Plan #{plan.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Cada {plan.frecuenciaValor ?? '—'} {equipo.parametro?.unidad ?? ''}
                          </span>
                        </div>
                        {plan.descripcionTarea && (
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs text-slate-500 flex-1">{plan.descripcionTarea}</p>
                            {nivelAlerta !== 'normal' && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-yellow-500'}`}>
                                {nivelAlerta === 'critico' ? 'VENCIDO' : nivelAlerta === 'advertencia' ? 'EN AVISO PREVIO' : 'PRÓXIMO'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${nivelAlerta === 'critico' ? 'bg-red-500' : nivelAlerta === 'advertencia' ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  Los planes preventivos se crean y administran desde el módulo de <strong>Mantenimiento</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ════ Fallas ════ */}
          {activeTab === 'fallas' && (
            <div className="px-6 py-4 space-y-3">
              {/* Estado operativo */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div>
                    <p className={`text-sm font-bold ${equipo.estadoOperativo === 'NO_OPERATIVO' ? 'text-red-800' : 'text-emerald-800'}`}>
                      {equipo.estadoOperativo === 'NO_OPERATIVO' ? 'Equipo No Operativo' : 'Equipo Operativo'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{fallasAbiertas.length} falla{fallasAbiertas.length !== 1 ? 's' : ''} abierta{fallasAbiertas.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleEstado}
                  disabled={estadoSaving}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 ${equipo.estadoOperativo === 'NO_OPERATIVO'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                >
                  {estadoSaving ? '...' : equipo.estadoOperativo === 'NO_OPERATIVO' ? 'Marcar Operativo' : 'Marcar No Operativo'}
                </button>
              </div>

              {/* KPIs fallas */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total', val: fallas.length, color: 'bg-slate-50 text-slate-700 border-slate-200' },
                  { label: 'Abiertas', val: fallas.filter(f => f.estado === 'ABIERTA').length, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'En Proceso', val: fallas.filter(f => f.estado === 'EN_PROCESO').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Resueltas', val: fallas.filter(f => f.estado === 'RESUELTA').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-lg p-2 text-center ${color}`}>
                    <p className="text-2xl font-bold">{val}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Lista de fallas */}
              {fallas.length === 0 && !showFallaForm && (
                <div className="py-6 text-center">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-slate-400">Sin fallas registradas</p>
                </div>
              )}

              {fallas.map((falla) => {
                const sevCfg = {
                  BAJA: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
                  MEDIA: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
                  ALTA: { bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
                  CRITICA: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
                }[falla.severidad] ?? { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                const estCfg = {
                  ABIERTA: 'bg-orange-100 text-orange-700',
                  EN_PROCESO: 'bg-blue-100 text-blue-700',
                  RESUELTA: 'bg-emerald-100 text-emerald-700',
                }[falla.estado] ?? 'bg-slate-100 text-slate-600';

                return (
                  <div key={falla.id} className={`border rounded-xl p-3 ${falla.estado === 'RESUELTA' ? 'border-slate-100 bg-slate-50/40 opacity-70' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sevCfg.bg}`}>{falla.severidad}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estCfg}`}>{falla.estado}</span>
                      </div>
                      <span className="text-xs text-slate-400">{fmtDate(falla.fecha)}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{falla.descripcion}</p>
                    {falla.solucion && (
                      <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mb-2">
                        <span className="font-bold">Solución:</span> {falla.solucion}
                      </p>
                    )}
                    {falla.fechaResolucion && (
                      <p className="text-xs text-slate-400">Resuelta el {fmtDate(falla.fechaResolucion)}</p>
                    )}
                    {(falla.responsable || falla.costoReparacion) && (
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        {falla.responsable && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {falla.responsable}
                          </span>
                        )}
                        {falla.costoReparacion && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ${Number(falla.costoReparacion).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Repuestos estimados */}
                    {falla.repuestos && falla.repuestos.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 mb-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          Repuestos Estimados
                        </p>
                        <div className="space-y-1">
                          {falla.repuestos.map(rf => (
                            <div key={rf.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700">
                                {rf.repuesto?.nombre || 'Repuesto'} {rf.repuesto?.codigo ? `(${rf.repuesto.codigo})` : ''}
                              </span>
                              <span className="font-semibold text-blue-700">
                                x{rf.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {falla.estado !== 'RESUELTA' && (
                      <div className="flex gap-2 mt-3">
                        {falla.estado === 'ABIERTA' && (
                          <button onClick={() => handleUpdateFalla(falla.id, { estado: 'EN_PROCESO' })} className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">En Proceso</button>
                        )}
                        <button
                          onClick={() => setResolverFallaModal({ visible: true, fallaId: falla.id, solucion: '' })}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                        >✓ Resolver</button>
                      </div>
                    )}
                    <FallaArchivos fallaId={falla.id} />
                  </div>
                );
              })}


              {/* Formulario nueva falla */}
              {showFallaForm ? (
                <div className="border border-orange-200 rounded-2xl p-4 space-y-2 bg-orange-50/40">
                  <p className="text-sm font-bold text-slate-900">Registrar Nueva Falla</p>
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
                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-xl">
                      <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-xs text-red-700">Una falla <strong>{newFalla.severidad}</strong> marcará automáticamente el equipo como <strong>No Operativo</strong>.</p>
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

                  {/* Selector Multi-Repuestos */}
                  {repuestosOptions.length > 0 && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-white">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Repuestos Estimados</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {repuestosOptions.map(rep => {
                          const sel = repuestosSeleccionados.find(x => x.id === rep.id);
                          return (
                            <div key={rep.id} className={`flex items-center justify-between border rounded-lg px-2 py-1.5 transition-colors ${sel ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                <input type="checkbox" checked={!!sel} onChange={() => toggleRepuestoFalla(rep)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                                <span className="text-xs font-medium truncate">{rep.nombre} {rep.codigo ? `(${rep.codigo})` : ''}</span>
                              </label>
                              {sel && (
                                <input
                                  type="number" min="1" value={sel.cantidad}
                                  onChange={e => updateRepCantidadFalla(rep.id, e.target.value)}
                                  className="ml-2 w-16 text-xs px-2 py-0.5 border border-blue-200 rounded text-center focus:outline-none focus:border-blue-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={handleAddFalla} disabled={fallaSaving} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60">
                      {fallaSaving ? 'Guardando...' : 'Registrar Falla'}
                    </button>
                    <button onClick={() => setShowFallaForm(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowFallaForm(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Registrar Falla
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Resolver Falla</h3>
              <button
                onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Solución aplicada <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={resolverFallaModal.solucion}
                onChange={(e) => setResolverFallaModal({ ...resolverFallaModal, solucion: e.target.value })}
                placeholder="Describe la solución que se aplicó para resolver esta falla..."
                autoFocus
              />
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                onClick={() => setResolverFallaModal({ visible: false, fallaId: null, solucion: '' })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
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
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
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
