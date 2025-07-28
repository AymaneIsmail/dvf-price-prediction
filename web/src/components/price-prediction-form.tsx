import type React from "react"
import { useState } from "react"

export default function PricePredictionForm() {
  const [formData, setFormData] = useState({
    adresse: "",
    type_local: "Appartement",
    surface_reelle_bati: 0,
    nombre_pieces_principales: 1,
    surface_terrain: 0,
    code_departement: "",
    CODE_COMMUNE: "",
    annee: 2024,
    mois: 1,
    jour: 1,
  })

  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("surface") || name.includes("nombre") || name === "mois" || name === "jour" || name === "annee"
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch("http://localhost:8000/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur pendant la prédiction")
      }

      setPrediction(data.prediction)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl text-white">🏠</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Estimateur Immobilier
          </h1>
          <p className="text-gray-600 text-lg">
            Obtenez une estimation précise de votre bien immobilier en quelques clics
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Adresse du bien</label>
              <input
                type="text"
                name="adresse"
                placeholder="Ex: 123 Rue de la Paix, Paris"
                value={formData.adresse}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
              />
            </div>

            {/* Property Type */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Type de bien</label>
              <select
                name="type_local"
                value={formData.type_local}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300 cursor-pointer"
              >
                <option value="Appartement">🏠 Appartement</option>
                <option value="Maison">🏡 Maison</option>
              </select>
            </div>

            {/* Surface and Rooms Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📐 Surface bâtie (m²)</label>
                <input
                  type="number"
                  name="surface_reelle_bati"
                  placeholder="Ex: 75"
                  value={formData.surface_reelle_bati || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🚪 Nombre de pièces</label>
                <input
                  type="number"
                  name="nombre_pieces_principales"
                  placeholder="Ex: 3"
                  value={formData.nombre_pieces_principales || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                />
              </div>
            </div>

            {/* Terrain Surface */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🌿 Surface terrain (m²)</label>
              <input
                type="number"
                name="surface_terrain"
                placeholder="Ex: 200 (optionnel pour appartements)"
                value={formData.surface_terrain || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
              />
            </div>

            {/* Location Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🗺️ Code département</label>
                <input
                  type="text"
                  name="code_departement"
                  placeholder="Ex: 75"
                  value={formData.code_departement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏘️ Code commune</label>
                <input
                  type="text"
                  name="CODE_COMMUNE"
                  placeholder="Ex: 75101"
                  value={formData.CODE_COMMUNE}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date de création du bien</label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="annee"
                  placeholder="Année"
                  value={formData.annee || ""}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-center"
                />
                <input
                  type="number"
                  name="mois"
                  placeholder="Mois"
                  value={formData.mois || ""}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-center"
                />
                <input
                  type="number"
                  name="jour"
                  placeholder="Jour"
                  value={formData.jour || ""}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-center"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <span>💰</span>
                  <span>Estimer mon bien</span>
                </>
              )}
            </button>
          </form>

          {/* Results */}
          {prediction !== null && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4">
                  <span className="text-xl text-white">✨</span>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Estimation de votre bien</h3>
                <div className="text-3xl font-bold text-green-700 mb-2">{prediction.toLocaleString()} €</div>
                <p className="text-green-600 text-sm">
                  Cette estimation est basée sur les données du marché immobilier
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-full mb-4">
                  <span className="text-xl text-white">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Erreur lors de l'estimation</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
