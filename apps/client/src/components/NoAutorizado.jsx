export const NoAutorizado = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        <a href="/" className="mt-4 inline-block text-[#0047AB] hover:underline">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
