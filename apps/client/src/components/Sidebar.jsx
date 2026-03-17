import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Sidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (isMobile && isOpen && onClose) {
      onClose();
    }
  }, [location.pathname]);

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/admin',
      label: 'Dashboard',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      path: '/admin/gestion-equipos',
      label: 'Equipos',
    },
    // {
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    //     </svg>
    //   ),
    //   path: '/reportes',
    //   label: 'Reportes',
    // },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/admin/mantenimiento',
      label: 'Mantenimiento',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polygon points="12,2 21,8 21,16 12,22 3,16 3,8" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      ),
      path: '/admin/repuestos',
      label: 'Repuestos',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/admin/usuarios',
      label: 'Usuarios',
    },
    // {
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   path: '/config',
    //   label: 'Config',
    // },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-20
        bg-white border-r border-gray-200
        flex flex-col lg:items-center py-6 px-4 lg:px-0 gap-4
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 lg:hidden mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <h1>BD</h1>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">Mantenimiento</h2>
            <p className="text-xs text-slate-500">BD Maintenance</p>
          </div>
        </div>
        {/* Logo solo icono en desktop */}
        <div className="hidden lg:flex w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl items-center justify-center text-white font-bold text-xl shadow-lg mb-4">
          <h1>BD</h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col items-center lg:items-stretch gap-2 w-full lg:w-auto lg:px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`
              flex items-center gap-3 px-3 py-2.5 lg:w-12 lg:h-12 lg:justify-center lg:p-0 rounded-xl transition-all duration-200
              ${activeItem === item.path
                  ? 'bg-slate-900 text-white shadow-lg lg:scale-105'
                  : 'text-slate-600 hover:bg-slate-100 lg:text-slate-400 lg:hover:bg-slate-100 lg:hover:text-slate-700'
                }
            `}
              onClick={() => {
                setActiveItem(item.path);
                navigate(item.path);
                // Cerrar sidebar en móvil después de navegar
                if (isMobile && onClose) onClose();
              }}
            >
              <span className="lg:hidden">{item.label}</span>
              <span className="hidden lg:flex">{item.icon}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          title="Cerrar sesión"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>
    </>
  );
};
