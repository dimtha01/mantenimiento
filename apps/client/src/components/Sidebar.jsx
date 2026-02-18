export const Sidebar = () => {
    return (
<aside className="w-[260px] bg-white border-r border-[#e5e7eb] flex flex-col flex-shrink-0">
  <div className="p-4 flex items-center gap-3 border-b border-[#e5e7eb]">
    <div className="bg-[#043487]/10 rounded-lg p-2">
      <svg className="w-6 h-6 text-[#043487]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    <div>
      <h1 className="text-[#111418] text-base font-bold leading-tight">Sistema Mantenimiento</h1>
      <p className="text-[#60718a] text-xs">Admin Empresarial</p>
    </div>
  </div>

  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/equipos">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <span className="text-sm font-medium">Inventario de Equipos</span>
    </a>
    
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/planes">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm font-medium">Programa de Mantenimiento</span>
    </a>

    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/certificaciones">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm font-medium">Certificaciones</span>
    </a>

    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/costos">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm font-medium">Costos e Indicadores</span>
    </a>

    <div className="mt-4 px-3 pt-4 pb-2 text-xs font-semibold text-[#60718a] uppercase tracking-wider">
      Administración
    </div>

    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#043487]/10 text-[#043487]" href="/usuarios">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span className="text-sm font-medium">Gestión de Usuarios</span>
    </a>

    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/dashboard">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span className="text-sm font-medium">Panel Principal</span>
    </a>

    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#60718a] hover:bg-gray-100 transition-colors" href="/config">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-sm font-medium">Configuración</span>
    </a>
  </nav>

  <div className="p-4 border-t border-[#e5e7eb] flex items-center justify-between">
    {/* User Info */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#043487] flex items-center justify-center text-white font-bold text-sm">
        AM
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111418] truncate">Alex Morgan</p>
        <p className="text-xs text-[#60718a] truncate">Administrador</p>
      </div>
    </div>

    {/* Logout Button */}
    <button
      onClick={() => {
        // Aquí va tu lógica de logout
        console.log('Cerrando sesión...');
        // Ejemplo: localStorage.removeItem('token');
        // window.location.href = '/login';
      }}
      className="w-12 h-12 flex items-center justify-center gap-2 py-2 rounded-full text-red-600 hover:bg-red-50 transition-colors group"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  </div>
</aside>
    )
}