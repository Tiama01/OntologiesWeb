import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Save, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ExportButton from '../ui/ExportButton';
import CRUDModal from '../common/CRUDModal';
import CRUDActions from '../common/CRUDActions';
import toast from 'react-hot-toast';

// Service pour récupérer les ethnies
const fetchEthnies = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/neo4j/ethnies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000), // 15 secondes pour les gros datasets
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.ethnies || data.data || data };
  } catch (error) {
    console.error('❌ Erreur ethnies:', error);
    return { 
      success: false, 
      data: [
        { id: '1', nom: 'Mossi', synonyme: 'Moosé, Moaga, Moose', tradition: 'Royaume traditionnel avec hiérarchie nobles-roturiers, agriculture', statut_national: 'MAJORITAIRE' },
        { id: '2', nom: 'Peuls', synonyme: 'Fulbé, Foulbé, Fula, Pular', tradition: 'Élevage transhumant, tradition islamique, organisation en castes', statut_national: 'MINORITAIRE' },
        { id: '3', nom: 'Gourmantché', synonyme: 'Gurma, Gulmanceba, Gulmance', tradition: 'Royaume traditionnel, agriculture, chefferie traditionnelle', statut_national: 'MINORITAIRE' },
        { id: '4', nom: 'Bissa', synonyme: null, tradition: 'Agriculture, commerce, organisation similaire aux Mossi', statut_national: 'MINORITAIRE' },
        { id: '5', nom: 'Bobo', synonyme: 'Bobo-Fing, Bobo-Madaare', tradition: 'Agriculture, artisanat, masques traditionnels, forge', statut_national: 'MINORITAIRE' },
        { id: '6', nom: 'Sénoufo', synonyme: 'Siéna, Sénar', tradition: 'Agriculture, société initiatique du Poro, sculpture sur bois', statut_national: 'MINORITAIRE' },
        { id: '7', nom: 'Lobi', synonyme: 'Lobiri, Loron', tradition: 'Architecture défensive, fétiches, résistance à l\'islamisation', statut_national: 'MINORITAIRE' },
        { id: '8', nom: 'Dagara', synonyme: 'Dagaara, Dagarti', tradition: 'Agriculture, rites funéraires, résistance traditionnelle', statut_national: 'MINORITAIRE' },
        { id: '9', nom: 'Samo', synonyme: 'San, Samogo', tradition: 'Commerce, islam, agriculture', statut_national: 'MINORITAIRE' },
        { id: '10', nom: 'Djoula', synonyme: 'Dyula, Jula', tradition: 'Commerce, Islam, artisanat, langue véhiculaire', statut_national: 'MINORITAIRE' },
      ]
    };
  }
};

// Hook pour ethnies
const useEthnies = () => {
  const [state, setState] = useState({
    data: [], // Toujours un tableau
    isLoading: true,
    error: null,
    refetch: null
  });

  const loadEthnies = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await fetchEthnies();
    
    setState({
      data: result.data,
      isLoading: false,
      error: result.success ? null : 'Utilisation de données de démonstration',
      refetch: loadEthnies
    });
  };

  useEffect(() => {
    loadEthnies();
  }, []);

  return state;
};

// Composant principal
const EthniesPage = () => {
  const { data: ethnies, isLoading, error, refetch } = useEthnies();
  const [searchTerm, setSearchTerm] = useState('');
  const [crudModal, setCrudModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit' | 'delete',
    data: null
  });

  // Filtrage des ethnies
  const filteredEthnies = ethnies.filter(ethnie =>
    ethnie.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ethnie.synonyme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ethnie.tradition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion des opérations CRUD
  const handleCreate = async (formData: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/neo4j/ethnies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      await refetch();
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/ethnies/${crudModal.data.nom}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await refetch();
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/ethnies/${crudModal.data.nom}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await refetch();
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la suppression');
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'delete', data?: any) => {
    setCrudModal({
      isOpen: true,
      mode,
      data: data || null
    });
  };

  const closeModal = () => {
    setCrudModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  // Configuration des champs du formulaire
  const formFields = [
    { name: 'nom', label: 'Nom', type: 'text' as const, required: true, placeholder: 'Nom de l\'ethnie' },
    { name: 'synonyme', label: 'Synonyme', type: 'text' as const, placeholder: 'Autres noms ou variantes' },
    { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Description détaillée' },
    { name: 'tradition', label: 'Tradition', type: 'textarea' as const, placeholder: 'Traditions et coutumes' },
    { name: 'population_estimee', label: 'Population estimée', type: 'number' as const, placeholder: 'Nombre d\'habitants' },
    { name: 'pourcentage_national', label: 'Pourcentage national', type: 'number' as const, placeholder: 'Pourcentage de la population' },
    { 
      name: 'statut_national', 
      label: 'Statut national', 
      type: 'select' as const, 
      options: [
        { value: 'MAJORITAIRE', label: 'Majoritaire' },
        { value: 'MINORITAIRE', label: 'Minoritaire' }
      ]
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🏛️ Ethnies du Burkina Faso
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion complète des ethnies avec opérations CRUD
          </p>
        </div>

        {/* Barre d'outils */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une ethnie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => openModal('create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter une ethnie
              </button>
              <ExportButton data={filteredEthnies} filename="ethnies-burkina-faso" />
            </div>
          </div>
        </div>

        {/* Tableau des ethnies */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Synonyme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tradition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {filteredEthnies.map((ethnie, index) => (
                  <motion.tr
                    key={ethnie.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ethnie.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {ethnie.synonyme || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {ethnie.tradition || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ethnie.statut_national === 'MAJORITAIRE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {ethnie.statut_national || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CRUDActions
                        onEdit={() => openModal('edit', ethnie)}
                        onDelete={() => openModal('delete', ethnie)}
                        entityName={ethnie.nom}
                        size="sm"
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal CRUD */}
        <CRUDModal
          isOpen={crudModal.isOpen}
          onClose={closeModal}
          mode={crudModal.mode}
          entityType="ethnie"
          entityName={crudModal.data?.nom}
          initialData={crudModal.data}
          fields={formFields}
          onSubmit={crudModal.mode === 'create' ? handleCreate : handleUpdate}
          onDelete={crudModal.mode === 'delete' ? handleDelete : undefined}
        />
      </div>
    </div>
  );
};

export default EthniesPage; 