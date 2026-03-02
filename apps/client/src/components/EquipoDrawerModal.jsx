// EquipoDrawerModal.jsx
// Tabs: Info General | Certificaciones | Mantenimientos | Planes
import { useState, useEffect, useCallback, useRef } from 'react';
import { FichaTecnicaEditor } from './FichaTecnicaEditor';

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

const FORM_EMPTY = {
  codigo: '', modelo: '', serial: '', factura: false,
  marcaId: '', tipoId: '', unidadNegocioId: '', propietarioId: '', parametroId: '',
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
  const [newFalla, setNewFalla] = useState({ descripcion: '', severidad: 'MEDIA', fecha: new Date().toISOString().split('T')[0] });
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

    // Validación client-side
    const required = [
      { key: 'codigo', label: 'Código' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'serial', label: 'Serial' },
      { key: 'marcaId', label: 'Marca' },
      { key: 'tipoId', label: 'Tipo' },
      { key: 'unidadNegocioId', label: 'Ubicación' },
      { key: 'propietarioId', label: 'Propietario' },
      { key: 'parametroId', label: 'Parámetro' },
    ];
    const missing = required.filter(({ key }) => !form[key] || form[key] === '');
    if (missing.length) {
      setSaveError(`Completa los campos requeridos: ${missing.map(m => m.label).join(', ')}`);
      return;
    }

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
        <div className="relative border-b border-slate-100 bg-white shrink-0">
          <div id="drawer-tabs-container" className="flex px-3 sm:px-5 gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
            {TABS.filter(t => isNew ? t.id === 'general' : true).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-3 sm:px-4 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
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
            <button
              onClick={() => {
                const el = document.getElementById('drawer-tabs-container');
                if (el) el.scrollLeft += 250;
              }}
              className="absolute right-0 top-0 bottom-0 px-2 bg-gradient-to-l from-white via-white/80 to-transparent flex items-center justify-center text-slate-400 hover:text-slate-800 sm:hidden"
              title="Ver más pestañas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
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
                    va lue={form.modelo}
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
                <Field
                  label="Marca"
                  onAdd={() => setCatalogModal({ visible: true, type: 'marcas', label: 'Nueva Marca', error: null })}
                >
                  <select
                    value={form.marcaId}
                    onChange={(e) => handleChange('marcaId', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar marca...</option>
                    {catalogos.marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </Field>

                {/* Tipo */}
                <Field
                  label="Tipo de Equipo"
                  onAdd={() => setCatalogModal({ visible: true, type: 'tipos', label: 'Nuevo Tipo', error: null })}
                >
                  <select
                    value={form.tipoId}
                    onChange={(e) => handleChange('tipoId', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {catalogos.tipos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ubicación */}
                <Field
                  label="Ubicación / Unidad"
                  onAdd={() => setCatalogModal({ visible: true, type: 'ubicaciones', label: 'Nueva Ubicación', error: null })}
                >
                  <select
                    value={form.unidadNegocioId}
                    onChange={(e) => handleChange('unidadNegocioId', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar ubicación...</option>
                    {catalogos.ubicaciones.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>
                </Field>

                {/* Propietario */}
                <Field
                  label="Propietario"
                  onAdd={() => setCatalogModal({ visible: true, type: 'propietarios', label: 'Nuevo Propietario', error: null })}
                >
                  <select
                    value={form.propietarioId}
                    onChange={(e) => handleChange('propietarioId', e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar propietario...</option>
                    {catalogos.propietarios.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Parámetro de control */}
              <Field label="Parámetro de Control (unidad de medición)">
                <select
                  value={form.parametroId}
                  onChange={(e) => handleChange('parametroId', e.target.value)}
                  className={selectCls}
                >
                  <option value="">Seleccionar unidad...</option>
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

              {/* Lista certificaciones */}
              {certs.length === 0 ? (
                <div className="py-6 text-center">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-sm text-slate-400">Sin certificaciones registradas</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200 z-0" />
                  <div className="space-y-2 relative z-10">
                    {certs.map((cert) => {
                      const info = certBadge(cert.vencimiento);
                      const d = daysUntil(cert.vencimiento);
                      const isExp = d !== null && d < 0;
                      const isSoon = d !== null && d >= 0 && d < 90;
                      return (
                        <div key={cert.id} className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${info.dot}`}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                          </div>
                          <div className={`flex-1 border rounded-xl p-3 mb-1 ${isExp ? 'border-red-200 bg-red-50/40' : isSoon ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>
                                    {isExp ? 'VENCIDO' : isSoon ? `${d}d` : 'VIGENTE'}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{cert.nombre || 'Certificación'}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Duración: <span className="font-semibold text-slate-700">{cert.duracionMeses} meses</span>
                                </p>
                              </div>
                              {isExp && (
                                <button
                                  onClick={() => {
                                    setNewCert({ nombre: cert.nombre || '', fechaEmision: '', duracionMeses: String(cert.duracionMeses), vencimiento: '' });
                                    setShowCertForm(true);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors self-start"
                                >Renovar</button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400">Emisión: </span>
                                <span className="font-semibold text-slate-700">{fmtDate(cert.fechaEmision)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Vence: </span>
                                <span className={`font-semibold ${isExp ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                                  {fmtDate(cert.vencimiento)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
