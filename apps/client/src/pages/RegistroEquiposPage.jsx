import { useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';

export const RegistroEquipoPage = () => {
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [activeStatus, setActiveStatus] = useState(true);
  const [preventiveAlert, setPreventiveAlert] = useState(true);
  const [safetyAlert, setSafetyAlert] = useState(true);
  const [fetchedData, setFetchedData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'success' });

  const [form, setForm] = useState({
    equipment_name: '',
    category: '',
    location: '',
    brand: '',
    model: '',
    serial_number: '',
    acquisition_date: '',
    power: '',
    weight: '',
    year: '',
    fuel_capacity: '',
    additional_notes: '',
    preventive_interval: 250,
    safety_frequency: 12,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Simula un "fetch" al ingresar número de serial
  const handleSerialBlur = () => {
    if (form.serial_number.trim().length > 4) {
      setIsFetching(true);
      setFetchedData(null);
      setTimeout(() => {
        setIsFetching(false);
        setFetchedData({
          image: 'https://www.cat.com/content/dam/catdotcom/en_US/products/machines/excavators/small-excavators/small-excavators-plp/320gc-update/product-jumbotron-320gc-1920x1080.jpg',
          model: form.model || 'CAT 320 GC',
          brand: form.brand || 'Caterpillar',
          year: form.year || '2023',
          fuel: 'Diesel',
          power: form.power || '143 HP',
          weight: form.weight ? `${form.weight} kg` : '21,900 kg',
          transmission: 'Hidráulica',
        });
      }, 1800);
    }
  };

  // Manejo de fotos
  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
  };

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando equipo:', form);
    setModal({
      open: true,
      title: 'Éxito',
      message: 'Equipo guardado exitosamente',
      type: 'success',
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          title="Registrar Nuevo Equipo"
          subtitle="Complete el formulario para añadir un activo al inventario"
          showSearch={false}
          actionButton={
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Equipo
            </button>
          }
        />

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

          {/* GRID PRINCIPAL: Formulario (izq) + Panel Fetch (der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="lg:col-span-8 space-y-6">

              {/* Campos de identificación */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {/* Número de serie + Kilometraje - estilo Joymile top */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-emerald-600 z-10">
                      Número de Serial
                    </label>
                    <input
                      name="serial_number"
                      value={form.serial_number}
                      onChange={handleChange}
                      onBlur={handleSerialBlur}
                      placeholder="Ej. CAT0320GCJP"
                      className="w-full border-2 border-emerald-400 rounded-xl py-3 px-4 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
                    />
                    {form.serial_number && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="Modelo"
                      className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                {/* Precio / Nombre del Equipo + Categoría */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      name="equipment_name"
                      value={form.equipment_name}
                      onChange={handleChange}
                      placeholder="Nombre del Equipo"
                      className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900"
                    />
                  </div>
                  {/* Categoría con badge removible */}
                  <div className="flex items-center gap-2">
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="flex-1 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 bg-white"
                    >
                      <option value="">Categoría</option>
                      <option>Maquinaria Pesada</option>
                      <option>Vehículos Industriales</option>
                      <option>Generadores y Energía</option>
                      <option>Herramientas de Precisión</option>
                    </select>
                    {form.category && (
                      <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
                        {form.category.split(' ')[0]}
                        <button onClick={() => setForm(p => ({ ...p, category: '' }))} className="text-emerald-500 hover:text-emerald-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    <button className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Información General */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
                  </svg>
                  Información General
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
                    <input name="brand" value={form.brand} onChange={handleChange} placeholder="Ej. Caterpillar" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación / Sede</label>
                    <select name="location" value={form.location} onChange={handleChange} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white text-slate-900">
                      <option value="">Seleccionar Sede</option>
                      <option>Planta Principal - Norte</option>
                      <option>Almacén Central</option>
                      <option>Obra Bicentenario</option>
                      <option>Taller de Mantenimiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fecha de Adquisición</label>
                    <input name="acquisition_date" value={form.acquisition_date} onChange={handleChange} type="date" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Año de Fabricación</label>
                    <input name="year" value={form.year} onChange={handleChange} placeholder="2023" type="number" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
              </div>

              {/* Especificaciones Técnicas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Especificaciones Técnicas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Potencia (HP/kW)</label>
                    <input name="power" value={form.power} onChange={handleChange} placeholder="143 HP" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Peso Operativo (kg)</label>
                    <input name="weight" value={form.weight} onChange={handleChange} placeholder="21900" type="number" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cap. Tanque (L)</label>
                    <input name="fuel_capacity" value={form.fuel_capacity} onChange={handleChange} placeholder="345" type="number" className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div className="sm:col-span-3 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notas Adicionales</label>
                    <textarea name="additional_notes" value={form.additional_notes} onChange={handleChange} rows={3} placeholder="Detalles sobre configuración especial, accesorios incluidos, etc." className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
                  </div>
                </div>
              </div>

              {/* Galería de Fotos - estilo Joymile */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Galería de Fotos
                </h3>
                <div className="flex items-center gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 group flex-shrink-0">
                      <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-slate-900/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {/* Botón Add - estilo Joymile */}
                  {photos.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 bg-slate-50 hover:bg-slate-100"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs font-semibold">Agregar</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoAdd}
                  />
                  {photos.length === 0 && (
                    <p className="text-sm text-slate-400 ml-2">Sube hasta 4 fotos del equipo (PNG, JPG, máx. 5MB c/u)</p>
                  )}
                </div>
              </div>

              {/* Configuración de Alertas */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Configuración de Alertas
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setActiveStatus(!activeStatus)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${activeStatus ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${activeStatus ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Activar inmediatamente</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`border rounded-xl p-4 transition-colors ${preventiveAlert ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-800">Mantenimiento Preventivo</span>
                      <label className="relative w-9 h-5 cursor-pointer">
                        <input type="checkbox" checked={preventiveAlert} onChange={() => setPreventiveAlert(!preventiveAlert)} className="sr-only" />
                        <div className={`w-9 h-5 rounded-full transition-colors ${preventiveAlert ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${preventiveAlert ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </label>
                    </div>
                    <label className="block text-xs text-slate-500 mb-1.5">Intervalo (Horas)</label>
                    <input
                      type="number"
                      value={form.preventive_interval}
                      onChange={(e) => setForm(p => ({ ...p, preventive_interval: e.target.value }))}
                      disabled={!preventiveAlert}
                      className={`w-full text-sm rounded-lg border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${!preventiveAlert ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-300 bg-white'}`}
                    />
                  </div>
                  <div className={`border rounded-xl p-4 transition-colors ${safetyAlert ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-800">Inspección de Seguridad</span>
                      <label className="relative w-9 h-5 cursor-pointer">
                        <input type="checkbox" checked={safetyAlert} onChange={() => setSafetyAlert(!safetyAlert)} className="sr-only" />
                        <div className={`w-9 h-5 rounded-full transition-colors ${safetyAlert ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${safetyAlert ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </label>
                    </div>
                    <label className="block text-xs text-slate-500 mb-1.5">Frecuencia (Meses)</label>
                    <input
                      type="number"
                      value={form.safety_frequency}
                      onChange={(e) => setForm(p => ({ ...p, safety_frequency: e.target.value }))}
                      disabled={!safetyAlert}
                      className={`w-full text-sm rounded-lg border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${!safetyAlert ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-300 bg-white'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pb-4">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  Descartar y cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all text-sm flex items-center gap-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar y publicar equipo
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA: Panel de Datos Fetcheados - inspirado en Joymile */}
            <div className="lg:col-span-4">
              <div className="sticky top-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  {/* Estado del fetch */}
                  {!fetchedData && !isFetching && (
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">Datos del Equipo</h4>
                      <p className="text-sm text-slate-500 mb-4">Ingresa el número de serial para obtener los datos técnicos automáticamente.</p>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-200 rounded-full w-0"></div>
                      </div>
                      <div className="mt-8 flex items-center justify-center">
                        <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {isFetching && (
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">Obteniendo datos...</h4>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                      </div>
                      <div className="space-y-3 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-4 w-24 bg-slate-100 rounded"></div>
                            <div className="h-4 w-20 bg-slate-100 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fetchedData && !isFetching && (
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-3">Datos del Equipo</h4>
                      {/* Progress bar completa */}
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 w-full"></div>
                      </div>
                      {/* Imagen del equipo */}
                      <div className="rounded-xl overflow-hidden mb-6 bg-slate-50 border border-slate-100">
                        <img
                          src={fetchedData.image}
                          alt={fetchedData.model}
                          className="w-full h-44 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      {/* Especificaciones fetcheadas */}
                      <div className="space-y-3">
                        {[
                          { label: 'Modelo', value: fetchedData.model },
                          { label: 'Marca', value: fetchedData.brand },
                          { label: 'Año', value: fetchedData.year },
                          { label: 'Combustible', value: fetchedData.fuel },
                          { label: 'Potencia', value: fetchedData.power },
                          { label: 'Peso', value: fetchedData.weight },
                          { label: 'Transmisión', value: fetchedData.transmission },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-500 font-medium">{label}</span>
                            <span className={`text-sm font-semibold ${value ? 'text-slate-900' : 'text-slate-300'}`}>
                              {value || '• • •'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs font-medium text-emerald-700">Datos verificados automáticamente</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};
