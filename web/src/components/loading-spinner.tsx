export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">
          Chargement des stations Vélib'
        </h2>
        <p className="text-gray-600 mt-2">
          Récupération des données...
        </p>
      </div>
    </div>
  );
}
