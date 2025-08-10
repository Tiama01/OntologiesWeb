import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ExportButton from '../ui/ExportButton';
import toast from 'react-hot-toast';

// EXEMPLE: Page Ethnies avec bouton d'export intégré
const EthniesPageWithExport = () => {
  const [ethnies, setEthnies] = useState([
    { nom: 'Mossi', synonyme: 'Moosé, Moaga', tradition: 'Royaume traditionnel', statut_national: 'MAJORITAIRE' },
    { nom: 'Peuls', synonyme: 'Fulbé, Foulbé', tradition: 'Élevage transhumant', statut_national: 'MINORITAIRE' },
    { nom: 'Gourmantché', synonyme: 'Gurma', tradition: 'Royaume traditionnel', statut_national: 'MINORITAIRE' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEthnies = ethnies.filter(ethnie =>
    ethnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ethnie.synonyme?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Gestion des Ethnies
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {filteredEthnies.length} ethnies • Export de données disponible
        </p>
      </div>

      {/* BARRE D'ACTIONS AVEC BOUTON EXPORT */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-80"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* BOUTON D'EXPORT */}
          <ExportButton
            data={filteredEthnies}
            filename="ethnies_burkina_faso"
            type="ethnies"
            title="Ethnies du Burkina Faso"
          />
          
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Ajouter une ethnie</span>
          </button>
        </div>
      </div>

      {/* Tableau simplifié */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Synonyme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEthnies.map((ethnie, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{ethnie.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{ethnie.synonyme}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    ethnie.statut_national === 'MAJORITAIRE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ethnie.statut_national}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-900 mr-2">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message de fonctionnalité */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="text-green-800 dark:text-green-200 font-medium mb-2">
          ✅ Export de données disponible !
        </h3>
        <p className="text-green-700 dark:text-green-300 text-sm">
          Utilisez le bouton "Exporter" pour télécharger les données en CSV, Excel ou PDF.
          Les exports incluent toutes les données filtrées actuellement affichées.
        </p>
      </div>
    </div>
  );
};

export default EthniesPageWithExport;
