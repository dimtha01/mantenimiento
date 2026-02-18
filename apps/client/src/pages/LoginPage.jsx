import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Credenciales inválidas');
        return;
      }

      // Guarda token y usuario completo
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log(data.user);

      // Redirige según rol
      if (data.user.rol === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (data.user.rol === 'USER') {
        navigate('/app', { replace: true });
      } else {
        navigate('/app', { replace: true }); // fallback
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 md:p-10 border border-neutral-100">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-[#ec5b13]/10 p-3 rounded-xl mb-4 w-16 h-16 flex items-center justify-center">
              <span className="text-[#ec5b13] text-xs font-bold">LOGO</span>
            </div>
            <p className="text-neutral-500 text-sm mt-1">
              Gestión de Mantenimiento Industrial
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-700 ml-1 block">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@empresa.com"
                required
                disabled={loading}
                className="w-full h-12 px-4 bg-[#F3F4F6] border-0 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:ring-0 focus:outline-none focus:bg-[#E5E7EB] transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-700 ml-1 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full h-12 px-4 pr-12 bg-[#F3F4F6] border-0 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:ring-0 focus:outline-none focus:bg-[#E5E7EB] transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end text-sm">
              <a href="#" className="text-[#0047AB] font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0047AB] hover:bg-[#003d96] disabled:bg-neutral-400 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98] focus:ring-2 focus:ring-[#0047AB]/50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs">
            © 2024 CMMS Master Industrial Suite. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
