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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.rol === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Panel izquierdo — imagen, solo en pantallas lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80"
          alt="Planta industrial"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        {/* Texto sobre la imagen */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-3">LOGO</h2>
          <p className="text-white/80 text-lg font-light max-w-xs">
            Gestión inteligente del mantenimiento industrial.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-white">
        {/* Header */}
        <div className="flex justify-between items-center px-8 md:px-12 py-6">
          <span className="text-xl font-bold text-neutral-800 tracking-tight">LOGO</span>
        </div>

        {/* Contenido centrado */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 w-full max-w-lg mx-auto pb-12">
          {/* Logo / ícono */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">Bienvenido</h1>
            <p className="text-neutral-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-700 block">
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
                className="w-full h-12 px-4 bg-[#F3F4F6] border-0 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:ring-2 focus:ring-[#0047AB]/30 focus:outline-none focus:bg-[#E5E7EB] transition-colors duration-200 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-700 block">
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
                  className="w-full h-12 px-4 pr-12 bg-[#F3F4F6] border-0 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:ring-2 focus:ring-[#0047AB]/30 focus:outline-none focus:bg-[#E5E7EB] transition-colors duration-200 text-sm"
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

            {/* Olvidaste contraseña */}
            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-[#0047AB] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0047AB] hover:bg-[#003d96] disabled:bg-neutral-300 text-white font-semibold rounded-xl shadow-md shadow-[#0047AB]/20 transition-all active:scale-[0.98] focus:ring-2 focus:ring-[#0047AB]/40 text-sm"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer del formulario */}
          <div className="mt-10 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400">
              © 2026 Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
