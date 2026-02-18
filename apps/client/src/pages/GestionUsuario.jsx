import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';

export const GestionUsuario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState(null);

  const usuarios = [
    {
      id: 1,
      nombre: 'Carlos Ruiz',
      email: 'c.ruiz@industrial.com',
      telefono: '+58 600-000-001',
      cargo: 'Mecánico Senior',
      idUsuario: 'DRV-001',
      estado: 'Activo',
      colorBorde: 'border-l-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      avatar: 'https://i.pravatar.cc/150?img=12',
      cumplimiento: 94,
      tiempoRespuesta: '18m',
      tareasCompletadas: 45,
      tareasRetrasadas: 10,
    },
    {
      id: 2,
      nombre: 'Elena Marín',
      email: 'e.marin@industrial.com',
      telefono: '+58 600-000-002',
      cargo: 'Supervisor',
      idUsuario: 'DRV-002',
      estado: 'En Turno',
      colorBorde: 'border-l-[#1e40af]',
      badgeColor: 'bg-blue-100 text-[#1e40af]',
      avatar: 'https://i.pravatar.cc/150?img=5',
      cumplimiento: 98,
      tiempoRespuesta: '12m',
      tareasCompletadas: 52,
      tareasRetrasadas: 3,
    },
    {
      id: 3,
      nombre: 'Jorge Soto',
      email: 'j.soto@industrial.com',
      telefono: '+58 600-000-003',
      cargo: 'Técnico Eléctrico',
      idUsuario: 'DRV-003',
      estado: 'Fuera de Servicio',
      colorBorde: 'border-l-slate-300',
      badgeColor: 'bg-slate-100 text-slate-500',
      avatar: 'https://i.pravatar.cc/150?img=33',
      cumplimiento: 76,
      tiempoRespuesta: '25m',
      tareasCompletadas: 28,
      tareasRetrasadas: 8,
    },
    {
      id: 4,
      nombre: 'Ana Belén',
      email: 'a.belen@industrial.com',
      telefono: '+58 600-000-004',
      cargo: 'Mantenimiento',
      idUsuario: 'DRV-004',
      estado: 'Activo',
      colorBorde: 'border-l-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      avatar: 'https://i.pravatar.cc/150?img=47',
      cumplimiento: 91,
      tiempoRespuesta: '20m',
      tareasCompletadas: 38,
      tareasRetrasadas: 5,
    },
    {
      id: 5,
      nombre: 'Miguel Ángel',
      email: 'm.angel@industrial.com',
      telefono: '+58 600-000-005',
      cargo: 'Ing. Planta',
      idUsuario: 'DRV-005',
      estado: 'En Turno',
      colorBorde: 'border-l-[#1e40af]',
      badgeColor: 'bg-blue-100 text-[#1e40af]',
      avatar: 'https://i.pravatar.cc/150?img=15',
      cumplimiento: 89,
      tiempoRespuesta: '22m',
      tareasCompletadas: 41,
      tareasRetrasadas: 7,
    },
    {
      id: 6,
      nombre: 'Lucía Torres',
      email: 'l.torres@industrial.com',
      telefono: '+58 600-000-006',
      cargo: 'Técnico',
      idUsuario: 'DRV-006',
      estado: 'Activo',
      colorBorde: 'border-l-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      avatar: 'https://i.pravatar.cc/150?img=32',
      cumplimiento: 96,
      tiempoRespuesta: '15m',
      tareasCompletadas: 50,
      tareasRetrasadas: 2,
    },
  ];

  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || user.estado === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] relative">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Directorio de Usuarios</h2>
            <div className="relative group">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1e40af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-[#1e40af]/20 focus:bg-white text-sm transition-all outline-none"
                placeholder="Buscar por nombre, ID o cargo..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="absolute right-8 top-8 flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Añadir Nuevo Usuario
          </button>
        </header>

        {/* Filters & Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-200 pb-0">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                selectedFilter === 'todos'
                  ? 'text-[#1e40af] border-[#1e40af]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('Activo')}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                selectedFilter === 'Activo'
                  ? 'text-[#1e40af] border-[#1e40af]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setSelectedFilter('En Turno')}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                selectedFilter === 'En Turno'
                  ? 'text-[#1e40af] border-[#1e40af]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              En Turno
            </button>
            <button
              onClick={() => setSelectedFilter('Fuera de Servicio')}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                selectedFilter === 'Fuera de Servicio'
                  ? 'text-[#1e40af] border-[#1e40af]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              Fuera de Servicio
            </button>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsuarios.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer border-l-4 ${user.colorBorde}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-16 h-16 rounded-full border-2 border-white ring-2 ring-slate-100 bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  ></div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.badgeColor}`}>
                    {user.estado}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1e40af] transition-colors">
                  {user.nombre}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  ID: {user.idUsuario} • {user.cargo}
                </p>
                <div className="space-y-2 border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-[13px]">{user.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[13px] truncate">{user.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* BACKDROP - Fondo oscuro cuando está abierto el panel */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSelectedUser(null)}
        />
      )}

      {/* RIGHT SIDEBAR DETALLES - OVERLAY (encima de todo) */}
      {selectedUser && (
        <aside className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-50 animate-slide-in">
          <div className="p-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button className="text-[#1e40af] text-xs font-bold uppercase tracking-widest hover:underline">
                Editar Perfil
              </button>
            </div>

            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedUser.avatar})` }}
              ></div>
              <h3 className="text-xl font-bold text-slate-900">{selectedUser.nombre}</h3>
              <p className="text-sm text-slate-500 mb-2">
                {selectedUser.cargo} • ID: {selectedUser.idUsuario}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedUser.badgeColor}`}>
                {selectedUser.estado.toUpperCase()} AHORA
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* Stats */}
            <div className="mb-10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Rendimiento Mensual
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Tasa de Cumplimiento</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-slate-900">{selectedUser.cumplimiento}%</span>
                    <span className="text-emerald-500 text-[10px] font-bold pb-1">↑ 2%</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Tiempo Respuesta</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-slate-900">{selectedUser.tiempoRespuesta}</span>
                    <span className="text-emerald-500 text-[10px] font-bold pb-1">↓ 3m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tareas */}
            <div className="mb-10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Estado de Tareas</h4>
              <div className="flex items-center gap-8">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10"></circle>
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="transparent"
                      stroke="#ec5b13"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - selectedUser.cumplimiento / 100)}
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">{selectedUser.cumplimiento}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ec5b13]"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Completadas</span>
                        <span className="text-slate-900">{selectedUser.tareasCompletadas}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Retrasadas</span>
                        <span className="text-slate-900">{selectedUser.tareasRetrasadas}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver Historial de Servicios
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Asignar Nueva Tarea
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
