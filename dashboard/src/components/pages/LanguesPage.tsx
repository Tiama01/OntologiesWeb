import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Users } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import CRUDModal from '../common/CRUDModal';
import CRUDActions from '../common/CRUDActions';
import toast from 'react-hot-toast';

// Service pour récupérer les langues depuis l'API Neo4j
const fetchLangues = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/neo4j/langues', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.langues || data.data || data };
  } catch (error) {
    console.error('❌ Erreur récupération langues:', error);
    return { 
      success: false, 
      data: [],
      error: 'Erreur de connexion à l\'API'
    };
  }
};

// Hook pour langues
const useLangues = () => {
  const [state, setState] = useState({
    data: [],
    isLoading: true,
    error: null,
    refetch: null
  });

  const loadLangues = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await fetchLangues();
    
    setState({
      data: result.data,
      isLoading: false,
      error: result.success ? null : result.error,
      refetch: loadLangues
    });
  };

  useEffect(() => {
    loadLangues();
  }, []);

  return state;
};

// Badge de statut
const StatutBadge = ({ statut }) => {
  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'principale':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'officielle':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'vehiculaire':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'liturgique':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'secondaire':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(statut)}`}>
      {statut}
    </span>
  );
};

// Page principale des langues
const LanguesPage = () => {
  const { data: langues, isLoading, error, refetch } = useLangues();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    entityType: 'langue',
    entityName: '',
    initialData: null
  });

  const filteredLangues = langues.filter(langue => {
    const matchesSearch = langue.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      langue.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      langue.famille_linguistique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      langue.regions?.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatut = !selectedStatut || langue.statut === selectedStatut;
    
    return matchesSearch && matchesStatut;
  });

  // Configuration des champs du formulaire
  const formFields = [
    {
      name: 'nom',
      label: 'Nom de la langue',
      type: 'text',
      required: true,
      placeholder: 'Ex: Mooré, Fulfulde, Gourmantché...'
    },
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      options: [
        { value: 'principale', label: 'Principale' },
        { value: 'secondaire', label: 'Secondaire' },
        { value: 'vehiculaire', label: 'Véhiculaire' },
        { value: 'officielle', label: 'Officielle' },
        { value: 'liturgique', label: 'Liturgique' },
        { value: 'minoritaire', label: 'Minoritaire' }
      ]
    },
    {
      name: 'nombre_locuteurs',
      label: 'Nombre de locuteurs',
      type: 'number',
      required: false,
      placeholder: 'Ex: 12600000'
    },
    {
      name: 'famille_linguistique',
      label: 'Famille linguistique',
      type: 'select',
      required: false,
      options: [
        { value: 'Niger-Congo', label: 'Niger-Congo' },
        { value: 'Nilo-Saharienne', label: 'Nilo-Saharienne' },
        { value: 'Afro-Asiatique', label: 'Afro-Asiatique' },
        { value: 'Indo-Européenne', label: 'Indo-Européenne' },
        { value: 'Khoisan', label: 'Khoisan' }
      ]
    },
    {
      name: 'regions',
      label: 'Régions parlées (séparées par des virgules)',
      type: 'text',
      required: false,
      placeholder: 'Ex: Kadiogo, Plateau-Central, Yaadga'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Description de la langue, caractéristiques, variantes dialectales...'
    }
  ];

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/api/neo4j/langues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création');
      }

      toast.success('Langue créée avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/langues/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      toast.success('Langue mise à jour avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/langues/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la suppression');
      }

      toast.success('Langue supprimée avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const openModal = (mode, langue = null) => {
    setModalConfig({
      isOpen: true,
      mode,
      entityType: 'langue',
      entityName: langue?.nom || '',
      initialData: langue ? {
        nom: langue.nom,
        statut: langue.statut || 'principale',
        nombre_locuteurs: langue.nombre_locuteurs || '',
        famille_linguistique: langue.famille_linguistique || '',
        regions: langue.regions ? langue.regions.join(', ') : '',
        description: langue.description || ''
      } : null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des langues..." />
      </div>
    );
  }

  const totalLocuteurs = langues.reduce((sum, langue) => sum + (langue.nombre_locuteurs || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Gestion des Langues
        </h1>
        <div className="flex items-center space-x-4 mt-2">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">{langues.length} langues recensées</span>
          </p>
          <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              {totalLocuteurs > 1000000 
                ? `${(totalLocuteurs / 1000000).toFixed(1)}M locuteurs`
                : totalLocuteurs.toLocaleString() + ' locuteurs'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Message d'erreur/info */}
      {error && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Barre d'actions et filtres */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, statut, famille..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 w-80"
            />
          </div>
          
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Tous les statuts</option>
            <option value="principale">Principales</option>
            <option value="secondaire">Secondaires</option>
            <option value="vehiculaire">Véhiculaires</option>
            <option value="officielle">Officielles</option>
            <option value="liturgique">Liturgiques</option>
          </select>
        </div>
        
        <CRUDActions
          onAdd={() => openModal('create')}
          showAdd={true}
          entityName="langue"
          size="md"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Locuteurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Famille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Régions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {filteredLangues.map((langue) => (
                <motion.tr
                  key={langue.nom}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {langue.nom}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatutBadge statut={langue.statut} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {langue.nombre_locuteurs ? (
                        langue.nombre_locuteurs > 1000000 
                          ? `${(langue.nombre_locuteurs / 1000000).toFixed(1)}M`
                          : langue.nombre_locuteurs.toLocaleString()
                      ) : 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {langue.famille_linguistique || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {langue.regions ? langue.regions.join(', ') : 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CRUDActions
                      onView={() => openModal('view', langue)}
                      onEdit={() => openModal('edit', langue)}
                      onDelete={() => openModal('delete', langue)}
                      showView={true}
                      showEdit={true}
                      showDelete={true}
                      entityName="langue"
                      size="sm"
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLangues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🗣️</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm || selectedStatut ? 'Aucune langue trouvée pour ces critères.' : 'Aucune langue disponible.'}
            </p>
            {(searchTerm || selectedStatut) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatut('');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      <CRUDModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        mode={modalConfig.mode}
        entityType={modalConfig.entityType}
        entityName={modalConfig.entityName}
        initialData={modalConfig.initialData}
        fields={formFields}
        onSubmit={modalConfig.mode === 'create' ? handleCreate : handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default LanguesPage; 