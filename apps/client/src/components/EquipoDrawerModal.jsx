// EquipoDrawerModal.jsx
// Tabs: Info General | Especificaciones | Certificaciones | Traslados
// OTs removidas → viven en MantenimientoPage
import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS   = ['Activo', 'En Revisión', 'Fuera de Servicio'];
const CATEGORY_OPTIONS = ['Maquinaria Pesada', 'Vehículos Industriales', 'Generadores y Energía', 'Herramientas de Precisión'];
const LOCATION_OPTIONS = ['Planta Principal - Norte', 'Almacén Central', 'Obra Bicentenario', 'Taller de Mantenimiento'];

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
};

const certStatusInfo = (dateStr) => {
  const d = daysUntil(dateStr);
  if (d === null) return { label: 'Sin fecha', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', alert: false };
  if (d < 0)   return { label: 'Vencido',          color: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    alert: true  };
  if (d < 30)  return { label: `${d}d`,             color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',  alert: true  };
  if (d < 90)  return { label: `${d}d`,             color: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-500', alert: false };
  return             { label: 'Vigente',            color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', alert: false };
};

const getAlertaUmbral = (lecturas) => {
  if (!lecturas?.umbralProximo) return null;
  const r = lecturas.umbralProximo - lecturas.valor;
  if (r <= 0)  return { label: `Umbral vencido por ${Math.abs(r)}${lecturas.unidad}`, color: 'bg-red-50 border-red-200 text-red-700' };
  if (r <= 50) return { label: `Mantenimiento en ${r}${lecturas.unidad}`,             color: 'bg-amber-50 border-amber-200 text-amber-700' };
  return null;
};

// Mocks
const CERT_MOCK = [
  { id: 'CERT-001', type: 'Certificado de Operación', code: 'CERT-OP-2024', issuedBy: 'INPSASEL',    issuedDate: '2024-02-15', expiryDate: '2026-02-15', file: 'cert-operacion2024.pdf', notes: 'Renovación anual obligatoria por normas COVENIN.' },
  { id: 'CERT-002', type: 'Inspección de Seguridad',  code: 'CERT-SEG-2025', issuedBy: 'MINPPTRASS', issuedDate: '2025-01-10', expiryDate: '2026-03-10', file: 'inspeccion-seg2025.pdf', notes: 'Requiere inspección física anual.' },
  { id: 'CERT-003', type: 'Certificado Ambiental',    code: 'CERT-AMB-2023', issuedBy: 'MINAMB',     issuedDate: '2023-06-01', expiryDate: '2025-06-01', file: null, notes: '' },
];

const TRASLADOS_MOCK = [
  { id: 'TRS-001', tipo: 'salida',  estado: 'completado',  fecha: '2026-02-15', hora: '08:30', origenSede: 'Planta Principal - Norte', destinoSede: 'Taller de Mantenimiento', responsable: 'Carlos Ruiz',  placaTransporte: 'ABC-123', observacion: 'Equipo enviado para mantenimiento correctivo.',   fotos: [{ id: 'f1', label: 'Vista frontal', color: 'bg-slate-200' }], anomalias: [] },
  { id: 'TRS-002', tipo: 'llegada', estado: 'conanomalia', fecha: '2026-02-15', hora: '14:45', origenSede: 'Planta Principal - Norte', destinoSede: 'Taller de Mantenimiento', responsable: 'Jorge Soto',   placaTransporte: 'ABC-123', observacion: 'Equipo recibido con golpe en panel lateral.', fotos: [{ id: 'f3', label: 'Daño panel',  color: 'bg-red-200'   }], anomalias: [{ tipo: 'Daño físico', descripcion: 'Golpe en panel lateral derecho' }] },
];

const TRASLADO_CONFIG = {
  salida:  { label: 'Salida',  dotBg: 'bg-blue-500',    pill: 'bg-blue-100 text-blue-700',
    icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg> },
  llegada: { label: 'Llegada', dotBg: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700',
    icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg> },
};

const ESTADO_CONFIG = {
  completado:  { label: 'Completado',   color: 'bg-emerald-100 text-emerald-700' },
  entransito:  { label: 'En Tránsito',  color: 'bg-blue-100 text-blue-700'      },
  conanomalia: { label: 'Con Anomalía', color: 'bg-red-100 text-red-700'        },
};

export const EquipoDrawerModal = ({ equipo, onClose, onSave }) => {
  const fotoInputRef = useRef(null);

  const [form, setForm]           = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [visible, setVisible]     = useState(false);

  // Certs
  const [certs, setCerts]                     = useState(CERT_MOCK);
  const [showNewCertForm, setShowNewCertForm]  = useState(false);
  const [newCert, setNewCert]                 = useState({ type: '', code: '', issuedBy: '', issuedDate: '', expiryDate: '', file: null, notes: '' });

  // Traslados
  const [traslados, setTraslados]               = useState(TRASLADOS_MOCK);
  const [expandedId, setExpandedId]             = useState(null);
  const [showNewTraslado, setShowNewTraslado]   = useState(false);
  const [newTraslado, setNewTraslado]           = useState({ tipo: 'salida', destinoSede: '', responsable: '', placaTransporte: '', observacion: '', fotos: [], anomalias: [], nuevaAnomalia: '' });

  useEffect(() => {
    if (equipo) {
      setForm({ ...equipo });
      setActiveTab('general');
      setTimeout(() => setVisible(true), 10);
    }
  }, [equipo]);

  const handleClose = () => {
    setVisible(false);
    setShowNewCertForm(false);
    setShowNewTraslado(false);
    setTimeout(onClose, 280);
  };

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const handleSave   = () => { onSave(form); handleClose(); };

  // Cert handlers
  const handleAddCert = () => {
    if (!newCert.type || !newCert.expiryDate) return;
    setCerts((p) => [...p, { ...newCert, id: `CERT-${Date.now()}` }]);
    setNewCert({ type: '', code: '', issuedBy: '', issuedDate: '', expiryDate: '', file: null, notes: '' });
    setShowNewCertForm(false);
  };
  const handleDeleteCert = (id) => setCerts((p) => p.filter((c) => c.id !== id));

  // Traslado handlers
  const handleGuardarTraslado = () => {
    if (!newTraslado.destinoSede || !newTraslado.responsable) return;
    setTraslados((p) => [{
      ...newTraslado,
      id: `TRS-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      origenSede: form?.location ?? 'Sede actual',
      estado: newTraslado.anomalias.length > 0 ? 'conanomalia' : 'completado',
    }, ...p]);
    setNewTraslado({ tipo: 'salida', destinoSede: '', responsable: '', placaTransporte: '', observacion: '', fotos: [], anomalias: [], nuevaAnomalia: '' });
    setShowNewTraslado(false);
  };

  if (!equipo) return null;

  const alertCerts        = certs.filter((c) => certStatusInfo(c.expiryDate).alert);
  const anomaliaTraslados = traslados.filter((t) => t.estado === 'conanomalia').length;
  const alertaUmbral      = getAlertaUmbral(form?.lecturas);

  // ── Tabs: sin OTs ───────────────────────────────────────────
  const TABS = [
    { id: 'general',         label: 'Info General',    badge: 0 },
    { id: 'specs',           label: 'Especificaciones', badge: 0 },
    { id: 'certificaciones', label: 'Certificaciones', badge: alertCerts.length },
    { id: 'traslados',       label: 'Traslados',       badge: anomaliaTraslados },
  ];

  return (
    <>
      <div onClick={handleClose} className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      <div className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">ID</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{form?.id ?? '—'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-400">Registro de equipo</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Guardar
            </button>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* CARD INFO EQUIPO */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {form?.name?.charAt(0) ?? 'E'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{form?.name}</h3>
                <p className="text-xs text-slate-400">{form?.brand} {form?.model} · {form?.location}</p>
              </div>
            </div>
            <select
              value={form?.estadoOperativo ?? ''}
              onChange={(e) => handleChange('estadoOperativo', e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Banners de alerta */}
          <div className="space-y-2 mt-3">
            {alertaUmbral && (
              <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${alertaUmbral.color}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs font-medium flex-1">{alertaUmbral.label} — ver Plan en Mantenimiento</p>
              </div>
            )}
            {alertCerts.length > 0 && (
              <div onClick={() => setActiveTab('certificaciones')} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-amber-100 transition-colors">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs text-amber-700 font-medium flex-1">{alertCerts.length} certificado{alertCerts.length > 1 ? 's' : ''} por vencer o vencido.</p>
                <span className="text-xs font-bold text-amber-600 underline">Ver ahora</span>
              </div>
            )}
            {anomaliaTraslados > 0 && (
              <div onClick={() => setActiveTab('traslados')} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-red-100 transition-colors">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-red-700 font-medium flex-1">{anomaliaTraslados} traslado{anomaliaTraslados > 1 ? 's' : ''} con anomalías.</p>
                <span className="text-xs font-bold text-red-600 underline">Revisar</span>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-100 px-6 gap-1 bg-white shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Info General ───────────────────────────────── */}
          {activeTab === 'general' && form && (
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Equipo</label>
                <input value={form.name ?? ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Número de Serie', field: 'serial', mono: true },
                  { label: 'Marca',           field: 'brand' },
                  { label: 'Año de Fabricación', field: 'year', type: 'number' },
                  { label: 'Fecha Adquisición',  field: 'acquisitionDate', type: 'date' },
                ].map(({ label, field, mono, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type={type ?? 'text'} value={form[field] ?? ''} onChange={(e) => handleChange(field, e.target.value)} className={`w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${mono ? 'font-mono' : ''}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Categoría</label>
                  <select value={form.category ?? ''} onChange={(e) => handleChange('category', e.target.value)} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white">
                    <option value="">Seleccionar</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación</label>
                  <select value={form.location ?? ''} onChange={(e) => handleChange('location', e.target.value)} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white">
                    <option value="">Seleccionar</option>
                    {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Lecturas del contador */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lecturas del Contador</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">El umbral define cuándo se dispara la alerta de mantenimiento</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-400 mb-1">Lectura Actual</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.lecturas?.valor ?? ''} onChange={(e) => handleChange('lecturas', { ...form.lecturas, valor: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-300" />
                      <span className="text-sm text-slate-400 whitespace-nowrap">{form.lecturas?.unidad ?? 'h'}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-400 mb-1">Umbral Próximo</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.lecturas?.umbralProximo ?? ''} onChange={(e) => handleChange('lecturas', { ...form.lecturas, umbralProximo: Number(e.target.value) || null })} placeholder="ej. 500" className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                      <span className="text-sm text-slate-400 whitespace-nowrap">{form.lecturas?.unidad ?? 'h'}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-blue-50/40 flex items-center justify-between">
                  <p className="text-[11px] text-blue-600">
                    Alerta automática ≤50{form.lecturas?.unidad ?? 'h'} antes del umbral.
                  </p>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Plan en Mantenimiento →</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notas Adicionales</label>
                <textarea value={form.notes ?? ''} onChange={(e) => handleChange('notes', e.target.value)} rows={3} placeholder="Detalles especiales, accesorios..." className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
              </div>
            </div>
          )}

          {/* ── Especificaciones ───────────────────────────── */}
          {activeTab === 'specs' && form && (
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Potencia (HP/kW)',     field: 'power',        placeholder: '143 HP' },
                { label: 'Modelo',               field: 'model',        placeholder: '320 GC' },
                { label: 'Peso Operativo (kg)',   field: 'weight',       placeholder: '21,900' },
                { label: 'Cap. Tanque (L)',       field: 'fuelCapacity', placeholder: '345' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input value={form[field] ?? ''} onChange={(e) => handleChange(field, e.target.value)} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
              ))}
              <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  OTs y planes preventivos se gestionan desde el módulo de Mantenimiento.
                </p>
              </div>
            </div>
          )}

          {/* ── Certificaciones ────────────────────────────── */}
          {activeTab === 'certificaciones' && (
            <div className="px-6 py-5 space-y-4">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Vigentes',   val: certs.filter((c) => { const d = daysUntil(c.expiryDate); return d !== null && d >= 90; }).length,              color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Por vencer', val: certs.filter((c) => { const d = daysUntil(c.expiryDate); return d !== null && d >= 0 && d < 90; }).length,     color: 'bg-amber-50 text-amber-700 border-amber-200'   },
                  { label: 'Vencidos',   val: certs.filter((c) => { const d = daysUntil(c.expiryDate); return d !== null && d < 0; }).length,                 color: 'bg-red-50 text-red-700 border-red-200'         },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{val}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Lista certs */}
              <div className="relative">
                <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200 z-0" />
                <div className="space-y-3 relative z-10">
                  {certs.map((cert) => {
                    const info  = certStatusInfo(cert.expiryDate);
                    const days  = daysUntil(cert.expiryDate);
                    const isExp  = days !== null && days < 0;
                    const isSoon = days !== null && days >= 0 && days < 90;
                    return (
                      <div key={cert.id} className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${info.dot} z-10`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          </div>
                        </div>
                        <div className={`flex-1 border rounded-2xl p-4 mb-1 ${isExp ? 'border-red-200 bg-red-50/40' : isSoon ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-bold text-slate-900">{cert.type}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${info.color}`}>
                                  {isExp ? 'VENCIDO' : isSoon ? `${days}d` : 'VIGENTE'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">{cert.code} · {cert.issuedBy}</p>
                            </div>
                            <button onClick={() => handleDeleteCert(cert.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-slate-400">Emisión: </span><span className="font-semibold text-slate-700">{cert.issuedDate}</span></div>
                            <div><span className="text-slate-400">Vence: </span><span className={`font-semibold ${isExp ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-slate-700'}`}>{cert.expiryDate}</span></div>
                          </div>
                          {cert.notes && <p className="text-xs text-slate-400 mt-2 italic">{cert.notes}</p>}
                          {cert.file && (
                            <div className="mt-2 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" /></svg>
                              <span className="text-xs text-slate-600 font-mono">{cert.file}</span>
                              <button className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Descargar</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formulario nuevo cert */}
              {showNewCertForm ? (
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                  <p className="text-sm font-bold text-slate-900">Nuevo Certificado</p>
                  {[
                    { label: 'Tipo de Certificado', field: 'type',       placeholder: 'Ej: Certificado de Operación' },
                    { label: 'Código / N° Cert.',   field: 'code',       placeholder: 'CERT-OP-2026' },
                    { label: 'Emitido por',         field: 'issuedBy',   placeholder: 'INPSASEL' },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                      <input value={newCert[field]} onChange={(e) => setNewCert((p) => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'Fecha Emisión', field: 'issuedDate' }, { label: 'Fecha Vencimiento', field: 'expiryDate' }].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                        <input type="date" value={newCert[field]} onChange={(e) => setNewCert((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas</label>
                    <textarea value={newCert.notes} onChange={(e) => setNewCert((p) => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none bg-white" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleAddCert} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">Guardar Certificado</button>
                    <button onClick={() => setShowNewCertForm(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewCertForm(true)} className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Agregar Certificado
                </button>
              )}
            </div>
          )}

          {/* ── Traslados ──────────────────────────────────── */}
          {activeTab === 'traslados' && (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Traslados',    val: traslados.length,                                          color: 'bg-slate-50 text-slate-700 border-slate-200' },
                  { label: 'Completados',  val: traslados.filter((t) => t.estado === 'completado').length,  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Con Anomalía', val: traslados.filter((t) => t.estado === 'conanomalia').length, color: 'bg-red-50 text-red-700 border-red-200' },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{val}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Timeline traslados */}
              <div className="relative">
                <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-300 via-slate-200 to-emerald-300 z-0" />
                <div className="space-y-3 relative z-10">
                  {traslados.map((t) => {
                    const cfg       = TRASLADO_CONFIG[t.tipo];
                    const estadoCfg = ESTADO_CONFIG[t.estado];
                    const isExp     = expandedId === t.id;
                    return (
                      <div key={t.id} className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-9 h-9 rounded-full ${cfg.dotBg} border-4 border-white shadow-md flex items-center justify-center z-10`}>
                            {cfg.icon}
                          </div>
                        </div>
                        <div className={`flex-1 border rounded-2xl overflow-hidden mb-1 ${t.estado === 'conanomalia' ? 'border-red-200' : 'border-slate-100'}`}>
                          <div
                            className={`flex items-start justify-between px-4 py-3 cursor-pointer ${t.estado === 'conanomalia' ? 'bg-red-50/50' : 'bg-white'}`}
                            onClick={() => setExpandedId(isExp ? null : t.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-center min-w-[36px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.fecha + 'T00:00:00').toLocaleString('es-VE', { month: 'short' })}</p>
                                <p className="text-xl font-black text-slate-800 leading-none">{new Date(t.fecha + 'T00:00:00').getDate()}</p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label.toUpperCase()}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoCfg.color}`}>{estadoCfg.label}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-slate-700">{t.origenSede}</span>
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                  <span className="text-xs font-semibold text-slate-700">{t.destinoSede}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{t.hora} · Resp. {t.responsable}{t.placaTransporte && ` · Placa ${t.placaTransporte}`}</p>
                              </div>
                            </div>
                            <svg className={`w-4 h-4 text-slate-400 mt-1 flex-shrink-0 transition-transform ${isExp ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>

                          {isExp && (
                            <div className={`px-4 pb-4 border-t ${t.estado === 'conanomalia' ? 'border-red-100' : 'border-slate-100'}`}>
                              {t.observacion && <p className="text-xs text-slate-600 mt-3 italic">"{t.observacion}"</p>}
                              {t.anomalias.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Anomalías</p>
                                  {t.anomalias.map((a, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                      <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                                      <p className="text-xs text-red-700">{a.descripcion}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {t.fotos.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                  {t.fotos.map((f) => (
                                    <div key={f.id} className={`${f.color} rounded-xl h-16 flex items-end p-2`}>
                                      <span className="text-[10px] font-semibold text-slate-600 bg-white/70 rounded px-1">{f.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nuevo traslado */}
              {showNewTraslado ? (
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                  <p className="text-sm font-bold text-slate-900">Registrar Traslado</p>
                  <div className="flex gap-2">
                    {['salida', 'llegada'].map((tipo) => (
                      <button key={tipo} onClick={() => setNewTraslado((p) => ({ ...p, tipo }))} className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-colors ${newTraslado.tipo === tipo ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{tipo}</button>
                    ))}
                  </div>
                  {[
                    { label: 'Sede Destino',        field: 'destinoSede',    opts: LOCATION_OPTIONS, isSelect: true },
                  ].map(({ label, field, opts, isSelect }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                      {isSelect ? (
                        <select value={newTraslado[field]} onChange={(e) => setNewTraslado((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white">
                          <option value="">Seleccionar</option>
                          {opts.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={newTraslado[field]} onChange={(e) => setNewTraslado((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: 'Responsable', field: 'responsable' }, { label: 'Placa Transporte', field: 'placaTransporte' }].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                        <input value={newTraslado[field]} onChange={(e) => setNewTraslado((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                    <textarea value={newTraslado.observacion} onChange={(e) => setNewTraslado((p) => ({ ...p, observacion: e.target.value }))} rows={2} className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none bg-white" />
                  </div>
                  {/* Anomalías inline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Anomalías</label>
                    <div className="flex gap-2">
                      <input value={newTraslado.nuevaAnomalia} onChange={(e) => setNewTraslado((p) => ({ ...p, nuevaAnomalia: e.target.value }))} placeholder="Describe la anomalía..." className="flex-1 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                      <button onClick={() => { if (!newTraslado.nuevaAnomalia.trim()) return; setNewTraslado((p) => ({ ...p, anomalias: [...p.anomalias, { tipo: 'Anomalía', descripcion: p.nuevaAnomalia }], nuevaAnomalia: '' })); }} className="px-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-xl hover:bg-red-200 transition-colors">+ Agregar</button>
                    </div>
                    {newTraslado.anomalias.map((a, i) => (
                      <div key={i} className="mt-1.5 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                        <p className="text-xs text-red-700 flex-1">{a.descripcion}</p>
                        <button onClick={() => setNewTraslado((p) => ({ ...p, anomalias: p.anomalias.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleGuardarTraslado} className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">Registrar Traslado</button>
                    <button onClick={() => setShowNewTraslado(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewTraslado(true)} className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Registrar Traslado
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};
