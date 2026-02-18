import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const DashboardPage = () => {
  const [selectedYear, setSelectedYear] = useState(2024);

  // Datos para las gráficas (simulados, reemplaza con tu API)
  const ordersData = [
    { month: 'Jan', orders: 45, profit: 38 },
    { month: 'Feb', orders: 52, profit: 45 },
    { month: 'Mar', orders: 68, profit: 58 },
    { month: 'Apr', orders: 75, profit: 68 },
    { month: 'May', orders: 85, profit: 78 },
    { month: 'Jun', orders: 72, profit: 65 },
    { month: 'Jul', orders: 58, profit: 52 },
    { month: 'Aug', orders: 62, profit: 55 },
    { month: 'Sep', orders: 48, profit: 42 },
    { month: 'Oct', orders: 42, profit: 38 },
    { month: 'Nov', orders: 38, profit: 35 },
    { month: 'Dec', orders: 45, profit: 40 },
  ];

  const salesData = [
    { label: 'Total Sales', value: 9586 },
    { label: 'This Month', value: 10986 },
    { label: 'Today', value: 1068 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          title="Resumen de Mantenimiento"
          subtitle="Monitorea las métricas clave del sistema"
          showSearch={false}
        />

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* METRICS CARDS */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Total Revenue - Costos Totales */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm opacity-90">Costos Totales</span>
              </div>
              <p className="text-4xl font-bold mb-2">$45,500</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  10.5%
                </span>
                <span className="opacity-70">From Last Day</span>
              </div>
            </div>

            {/* Total Orders - Órdenes de Trabajo */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600">Órdenes de Trabajo</span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-2">700</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  10.9%
                </span>
                <span className="text-slate-500">From Last Day</span>
              </div>
            </div>

            {/* Total Customers - Equipos Activos */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600">Equipos Activos</span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-2">230</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  12.5%
                </span>
                <span className="text-slate-500">From Last Day</span>
              </div>
            </div>

            {/* Customer Growth - Eficiencia */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600">Eficiencia</span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-2">110</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  0.5%
                </span>
                <span className="text-slate-500">From Last Day</span>
              </div>
            </div>
          </div>

          {/* CHARTS - 2 GRÁFICAS EN GRID */}
          <div className="grid grid-cols-3 gap-6">
            {/* Orders Overview - Gráfica de Líneas (ocupa 2 columnas) */}
            <div className="col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Órdenes de Trabajo</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Órdenes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Completadas</span>
                  </div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="text-sm border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-medium"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>

              {/* Line Chart */}
              <div className="relative h-96">
                <svg className="w-full h-full" viewBox="0 0 1000 350">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5eead4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#5eead4" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((y) => (
                    <line
                      key={y}
                      x1="60"
                      y1={300 - y * 2.5}
                      x2="950"
                      y2={300 - y * 2.5}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Orders line with area */}
                  <path
                    d={`M 60 ${300 - ordersData[0].orders * 2.5} ${ordersData.map((d, i) => `L ${60 + (i * 75)} ${300 - d.orders * 2.5}`).join(' ')} L ${60 + (ordersData.length - 1) * 75} 300 L 60 300 Z`}
                    fill="url(#purpleGradient)"
                  />
                  <path
                    d={`M 60 ${300 - ordersData[0].orders * 2.5} ${ordersData.map((d, i) => `L ${60 + (i * 75)} ${300 - d.orders * 2.5}`).join(' ')}`}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Profit line with area */}
                  <path
                    d={`M 60 ${300 - ordersData[0].profit * 2.5} ${ordersData.map((d, i) => `L ${60 + (i * 75)} ${300 - d.profit * 2.5}`).join(' ')} L ${60 + (ordersData.length - 1) * 75} 300 L 60 300 Z`}
                    fill="url(#tealGradient)"
                  />
                  <path
                    d={`M 60 ${300 - ordersData[0].profit * 2.5} ${ordersData.map((d, i) => `L ${60 + (i * 75)} ${300 - d.profit * 2.5}`).join(' ')}`}
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {ordersData.map((d, i) => (
                    <g key={i}>
                      <circle cx={60 + i * 75} cy={300 - d.orders * 2.5} r="5" fill="#c084fc" />
                      <circle cx={60 + i * 75} cy={300 - d.profit * 2.5} r="5" fill="#5eead4" />
                    </g>
                  ))}

                  {/* Tooltip on May */}
                  <circle cx={60 + 4 * 75} cy={300 - ordersData[4].orders * 2.5} r="8" fill="#c084fc" />
                  <circle cx={60 + 4 * 75} cy={300 - ordersData[4].orders * 2.5} r="4" fill="white" />

                  {/* Tooltip box */}
                  <g transform={`translate(${60 + 4 * 75 - 50}, ${300 - ordersData[4].orders * 2.5 - 70})`}>
                    <rect width="100" height="55" rx="8" fill="#1e293b" />
                    <text x="50" y="25" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">$45.6k</text>
                    <text x="50" y="42" fill="#94a3b8" fontSize="12" textAnchor="middle">$100k Goal</text>
                  </g>

                  {/* Month labels */}
                  {ordersData.map((d, i) => (
                    <text
                      key={d.month}
                      x={60 + i * 75}
                      y="330"
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="14"
                      fontWeight="500"
                    >
                      {d.month}
                    </text>
                  ))}

                  {/* Y-axis labels */}
                  {[0, 20, 40, 60, 80, 100].map((y) => (
                    <text
                      key={y}
                      x="40"
                      y={300 - y * 2.5 + 5}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="14"
                    >
                      {y}k
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Resumen de Costos - Sparkline (ocupa 1 columna) */}
            <div className="col-span-1 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Análisis de Mantenimiento</h3>

              {/* Donut Chart */}
              <div className="relative w-56 h-56 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    fill="transparent"
                    stroke="#e5e7eb"
                    strokeWidth="22"
                  />
                  {/* Completed - 70% (purple) */}
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    fill="transparent"
                    stroke="#7c3aed"
                    strokeWidth="22"
                    strokeDasharray="565"
                    strokeDashoffset="170"
                    strokeLinecap="round"
                  />
                  {/* In Progress - 15% (pink) */}
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="22"
                    strokeDasharray="565"
                    strokeDashoffset="85"
                    strokeLinecap="round"
                  />
                  {/* Pending - 15% (teal) */}
                  <circle
                    cx="112"
                    cy="112"
                    r="90"
                    fill="transparent"
                    stroke="#14b8a6"
                    strokeWidth="22"
                    strokeDasharray="565"
                    strokeDashoffset="28"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-slate-900">90%</p>
                    <p className="text-sm text-slate-500 mt-1">Total completado</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Completadas</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-pink-600 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">En Progreso</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-teal-600 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Pendientes</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
