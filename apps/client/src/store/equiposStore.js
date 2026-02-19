// store/equiposStore.js
// ─── Catálogo central de equipos/activos ──────────────────────
// GestionEquiposPage y MantenimientoPage importan de aquí.
// Nunca duplicar este array en otro módulo.

export const EQUIPOS_CATALOG = [
  {
    id: 'EQ-001', name: 'Excavadora Hidráulica 320', serial: '321444400',
    brand: 'Caterpillar', model: '320 GC', category: 'Maquinaria Pesada',
    location: 'Planta Principal - Norte',
    estadoOperativo: 'Activo',
    lecturas: { valor: 480, unidad: 'h', umbralProximo: 500 },
    otActiva:  { tipo: 'Preventivo', descripcion: 'Cambio de aceite 500h programado', fecha: '2026-02-18' },
    ultimaOT:  { descripcion: 'Lubricación de componentes', fecha: '2025-11-10' },
  },
  {
    id: 'EQ-002', name: 'Generador Industrial 500kVA', serial: '400357911',
    brand: 'Cummins', model: 'QSK19', category: 'Generadores y Energía',
    location: 'Planta Principal - Norte',
    estadoOperativo: 'En Revisión',
    lecturas: { valor: 1240, unidad: 'h', umbralProximo: null },
    otActiva:  { tipo: 'Correctivo', descripcion: 'Falla en alternador detectada', fecha: '2026-02-17' },
    ultimaOT:  { descripcion: 'Revisión general semestral', fecha: '2025-08-15' },
  },
  {
    id: 'EQ-003', name: 'Compresor de Tornillo 75HP', serial: '2000003344',
    brand: 'Atlas Copco', model: 'GA75', category: 'Maquinaria Pesada',
    location: 'Almacén Central',
    estadoOperativo: 'Activo',
    lecturas: { valor: 950, unidad: 'h', umbralProximo: 1000 },
    otActiva:  { tipo: 'Preventivo', descripcion: 'Cambio de filtros programado', fecha: '2026-02-16' },
    ultimaOT:  { descripcion: 'Cambio de aceite compresor', fecha: '2025-10-20' },
  },
  {
    id: 'EQ-004', name: 'Montacargas Eléctrico 3T', serial: '333505551',
    brand: 'Toyota', model: '8FBE30', category: 'Vehículos Industriales',
    location: 'Almacén Central',
    estadoOperativo: 'En Revisión',
    lecturas: { valor: 320, unidad: 'h', umbralProximo: null },
    otActiva:  null,
    ultimaOT:  { descripcion: 'Inspección de seguridad anual', fecha: '2026-02-15' },
  },
  {
    id: 'EQ-005', name: 'Grúa Puente 10T', serial: '753955369',
    brand: 'Demag', model: 'KBK-II', category: 'Maquinaria Pesada',
    location: 'Planta Principal - Norte',
    estadoOperativo: 'Activo',
    lecturas: { valor: 2100, unidad: 'h', umbralProximo: null },
    otActiva:  { tipo: 'Predictivo', descripcion: 'Calibración de sensores de carga', fecha: '2026-02-14' },
    ultimaOT:  { descripcion: 'Engrase de cadenas y rodillos', fecha: '2025-09-03' },
  },
  {
    id: 'EQ-006', name: 'Bomba Centrífuga 50HP', serial: '321444400',
    brand: 'Grundfos', model: 'NK 65-315', category: 'Maquinaria Pesada',
    location: 'Obra Bicentenario',
    estadoOperativo: 'Fuera de Servicio',
    lecturas: { valor: 670, unidad: 'h', umbralProximo: null },
    otActiva:  null,
    ultimaOT:  { descripcion: 'Revisión por vencimiento de certificado', fecha: '2026-02-13' },
  },
  {
    id: 'EQ-007', name: 'Torno CNC 350', serial: '200333244',
    brand: 'Haas', model: 'ST-30', category: 'Herramientas de Precisión',
    location: 'Taller de Mantenimiento',
    estadoOperativo: 'Activo',
    lecturas: { valor: 130, unidad: 'h', umbralProximo: null },
    otActiva:  null,
    ultimaOT:  { descripcion: 'Lubricación de husillos completada', fecha: '2026-02-12' },
  },
];

// Planes por equipoId — separados del catálogo base
// MantenimientoPage lee/escribe aquí (en real: API)
export const PLANES_INICIALES = {
  'EQ-001': {
    nombre: 'Cambio de Aceite 500h', trigger: 'Por Medidor', umbral: 500,
    unidad: 'h', recurrencia: 'Cada 3 meses',
    checklist: ['Drenar aceite', 'Sustituir filtro', 'Rellenar 15W40', 'Verificar nivel'],
    repuestos: [
      { item: 'Aceite Motor SAE 15W40 (Galón)', cant: 5 },
      { item: 'Filtro Aceite Cummins LF9009',   cant: 1 },
    ],
    duracionEst: 2.5, costoEst: 420,
  },
  'EQ-002': {
    nombre: 'Revisión General Anual', trigger: 'Por Tiempo', umbral: 365,
    unidad: 'd', recurrencia: 'Anual',
    checklist: ['Inspección visual general', 'Verificar conexiones eléctricas', 'Prueba de carga', 'Revisión de refrigeración'],
    repuestos: [
      { item: 'Filtro de aire industrial', cant: 2 },
      { item: 'Correa de alternador',      cant: 1 },
    ],
    duracionEst: 6, costoEst: 780,
  },
  'EQ-003': {
    nombre: 'Cambio de Filtros 1000h', trigger: 'Por Medidor', umbral: 1000,
    unidad: 'h', recurrencia: 'Mensual',
    checklist: ['Cambiar filtro de aire', 'Cambiar filtro de aceite', 'Revisar separador', 'Limpiar trampa de agua'],
    repuestos: [
      { item: 'Filtro de aire GA75',          cant: 1 },
      { item: 'Filtro de aceite Atlas Copco', cant: 1 },
    ],
    duracionEst: 1.5, costoEst: 180,
  },
  'EQ-005': {
    nombre: 'Calibración Semestral Sensores', trigger: 'Por Tiempo', umbral: 180,
    unidad: 'd', recurrencia: 'Semestral',
    checklist: ['Verificar sensores de carga', 'Calibrar límites de seguridad', 'Prueba con carga de prueba'],
    repuestos: [], duracionEst: 4, costoEst: 200,
  },
  // EQ-004, EQ-006, EQ-007 → sin plan (CrearPlanForm)
};

// Historial OTs por equipoId
export const HISTORIAL_OTS = {
  'EQ-001': [
    { id: 'OT-0031', tipo: 'Preventivo', descripcion: 'Lubricación general',        estado: 'Cerrada', fecha: '2025-11-10', costoEstimado: 80,  costoReal: 80  },
    { id: 'OT-0025', tipo: 'Predictivo', descripcion: 'Revisión vibración anómala', estado: 'Cerrada', fecha: '2025-09-03', costoEstimado: 200, costoReal: 190 },
  ],
  'EQ-002': [
    { id: 'OT-0020', tipo: 'Preventivo', descripcion: 'Revisión semestral completa', estado: 'Cerrada', fecha: '2025-08-15', costoEstimado: 780, costoReal: 380 },
  ],
  'EQ-003': [
    { id: 'OT-0028', tipo: 'Preventivo', descripcion: 'Cambio de aceite compresor', estado: 'Cerrada', fecha: '2025-10-20', costoEstimado: 120, costoReal: 120 },
  ],
  'EQ-004': [], 'EQ-005': [], 'EQ-006': [], 'EQ-007': [],
};

// OTs activas con checklist completo — extendidas del campo otActiva del catálogo
export const OTS_ACTIVAS = {
  'EQ-001': {
    id: 'OT-0042', tipo: 'Preventivo', descripcion: 'Cambio de aceite 500h',
    estado: 'Abierta', fecha: '2026-02-18', tecnico: 'Carlos Ruiz',
    prioridad: 'Alta', costoEstimado: 420, costoReal: null,
    checklist: [
      { id: 1, texto: 'Drenar aceite usado del cárter',       done: true  },
      { id: 2, texto: 'Sustituir filtro de aceite LF9009',    done: true  },
      { id: 3, texto: 'Llenar con aceite 15W40 hasta máximo', done: false },
      { id: 4, texto: 'Verificar nivel final y arrancar',     done: false },
    ],
  },
  'EQ-002': {
    id: 'OT-0039', tipo: 'Correctivo', descripcion: 'Falla en alternador detectada',
    estado: 'Abierta', fecha: '2026-02-17', tecnico: 'Jorge Soto',
    prioridad: 'Crítica', costoEstimado: 950, costoReal: null,
    checklist: [
      { id: 1, texto: 'Diagnóstico eléctrico del alternador', done: true  },
      { id: 2, texto: 'Reemplazo de bobinado interno',        done: false },
      { id: 3, texto: 'Prueba de carga al 80%',               done: false },
    ],
  },
  'EQ-003': {
    id: 'OT-0041', tipo: 'Preventivo', descripcion: 'Cambio de filtros programado',
    estado: 'Abierta', fecha: '2026-02-16', tecnico: 'Ana Belén',
    prioridad: 'Media', costoEstimado: 180, costoReal: null,
    checklist: [
      { id: 1, texto: 'Cambiar filtro de aire',      done: false },
      { id: 2, texto: 'Cambiar filtro de aceite',    done: false },
      { id: 3, texto: 'Revisar separador de aceite', done: false },
    ],
  },
  'EQ-005': {
    id: 'OT-0040', tipo: 'Predictivo', descripcion: 'Calibración de sensores de carga',
    estado: 'Abierta', fecha: '2026-02-14', tecnico: 'Carlos Ruiz',
    prioridad: 'Media', costoEstimado: 200, costoReal: null,
    checklist: [
      { id: 1, texto: 'Desmontaje de sensores',          done: true  },
      { id: 2, texto: 'Calibración en banco de pruebas', done: false },
      { id: 3, texto: 'Reinstalación y prueba de carga', done: false },
    ],
  },
};
