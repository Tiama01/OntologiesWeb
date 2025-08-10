import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Globe, Navigation, Map } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import CRUDModal from '../common/CRUDModal';
import CRUDActions from '../common/CRUDActions';
import toast from 'react-hot-toast';

interface Region {
  nom: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Service pour récupérer les régions depuis l'API Neo4j
const fetchRegions = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/neo4j/regions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.regions || data.data || data };
  } catch (error) {
    console.error('❌ Erreur récupération régions:', error);
    return { 
      success: false, 
      data: [],
      error: 'Erreur de connexion à l\'API'
    };
  }
};

// Hook pour régions
const useRegions = () => {
  const [state, setState] = useState({
    data: [],
    isLoading: true,
    error: null,
    refetch: null
  });

  const loadRegions = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await fetchRegions();
    
    setState({
      data: result.data,
      isLoading: false,
      error: result.success ? null : result.error,
      refetch: loadRegions
    });
  };

  useEffect(() => {
    loadRegions();
  }, []);

  return state;
};

export default function RegionsPage() {
  const { data: regions, isLoading, error, refetch } = useRegions();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    entityType: 'région',
    entityName: '',
    initialData: null
  });

  const filteredRegions = regions.filter(region =>
    region.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (region.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Configuration des champs du formulaire
  const formFields = [
    {
      name: 'nom',
      label: 'Nom de la région',
      type: 'text',
      required: true,
      placeholder: 'Ex: Kadiogo, Yaadga, Saaga...'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Description géographique, caractéristiques, population...'
    },
    {
      name: 'latitude',
      label: 'Latitude',
      type: 'number',
      required: false,
      placeholder: 'Ex: 12.3714',
      step: '0.0001'
    },
    {
      name: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: false,
      placeholder: 'Ex: -1.5197',
      step: '0.0001'
    }
  ];

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/api/neo4j/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création');
      }

      toast.success('Région créée avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/regions/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      toast.success('Région mise à jour avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/regions/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la suppression');
      }

      toast.success('Région supprimée avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const openModal = (mode, region = null) => {
    setModalConfig({
      isOpen: true,
      mode,
      entityType: 'région',
      entityName: region?.nom || '',
      initialData: region ? {
        nom: region.nom,
        description: region.description || '',
        latitude: region.latitude || '',
        longitude: region.longitude || ''
      } : null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des régions..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Régions</h1>
            <p className="text-gray-600 dark:text-gray-400">{filteredRegions.length} régions</p>
          </div>
        </div>
        <CRUDActions
          onAdd={() => openModal('create')}
          showAdd={true}
          entityName="région"
          size="md"
        />
      </motion.div>

      {/* Message d'erreur/info */}
      {error && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Rechercher par nom ou description..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="h-4 w-4" />
            <span>{filteredRegions.filter(r => r.latitude && r.longitude).length} avec GPS</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Région</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GPS</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredRegions.map((region, index) => (
                  <motion.tr key={region.nom} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {region.nom.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{region.nom}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Région administrative</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-md">
                        {region.description ? (
                          <div title={region.description}>
                            {region.description.length > 80 ? `${region.description.substring(0, 80)}...` : region.description}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Aucune description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {region.latitude && region.longitude ? (
                        <div className="flex items-center space-x-2">
                          <Navigation className="h-4 w-4 text-green-500" />
                          <div className="text-xs">
                            <div className="text-gray-900 dark:text-white">{region.latitude}°N</div>
                            <div className="text-gray-500 dark:text-gray-400">{region.longitude}°E</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Non localisée</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CRUDActions
                        onView={() => openModal('view', region)}
                        onEdit={() => openModal('edit', region)}
                        onDelete={() => openModal('delete', region)}
                        showView={true}
                        showEdit={true}
                        showDelete={true}
                        entityName="région"
                        size="sm"
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredRegions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🗺️</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'Aucune région trouvée pour ces critères.' : 'Aucune région disponible.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}
      </motion.div>

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
}
