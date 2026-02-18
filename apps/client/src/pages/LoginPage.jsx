import { useState } from 'react';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email, password: formData.password }),
    })

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert('Login error: ' + data.error);
      return;
    }

    alert('Login OK: ' + data.token); // { token, user }
  };

  return (
    <>
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        {/* Main Container */}
        <div className="w-full max-w-[440px]">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 md:p-10 border border-neutral-100">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="bg-[#ec5b13]/10 p-3 rounded-xl mb-4">
                <span className="material-symbols-outlined text-[#ec5b13] text-4xl">
                  factory
                </span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-800 tracking-tight font-['Public_Sans']">
                CMMS Master
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                Gestión de Mantenimiento Industrial
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-neutral-700 ml-1 block"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@empresa.com"
                    required
                    className="w-full h-12 px-4 bg-[#F3F4F6] border-0 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:ring-0 focus:outline-none focus:shadow-none focus:bg-[#E5E7EB] transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-neutral-700 block"
                  >
                    Contraseña
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 px-4 pr-12 bg-[#F3F4F6] border-0 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:ring-0 focus:outline-none focus:shadow-none focus:bg-[#E5E7EB] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-[20px] select-none">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-neutral-300 text-[#ec5b13] focus:ring-[#ec5b13]/20 focus:ring-2 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span className="text-neutral-600 group-hover:text-neutral-800 transition-colors select-none">
                    Recordarme
                  </span>
                </label>
                <a
                  href="#"
                  className="text-[#0047AB] font-medium hover:underline transition-all focus:outline-none focus:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 bg-[#0047AB] hover:bg-[#003d96] text-white font-bold rounded-lg shadow-md shadow-[#0047AB]/20 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0047AB]/50 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-neutral-500 text-xs">
              © 2024 CMMS Master Industrial Suite. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
