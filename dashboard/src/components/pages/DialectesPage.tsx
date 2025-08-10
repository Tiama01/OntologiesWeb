import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, Filter, Volume2, MapPin, Languages } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import CRUDModal from '../common/CRUDModal';
import CRUDActions from '../common/CRUDActions';
import toast from 'react-hot-toast';

interface Dialecte {
  nom: string;
  description: string | null;
  langue_principale: string | null;
  localite: string | null;
}

// Service pour récupérer les dialectes depuis l'API Neo4j
const fetchDialectes = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/neo4j/dialectes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.dialectes || data.data || data };
  } catch (error) {
    console.error('❌ Erreur récupération dialectes:', error);
    return { 
      success: false, 
      data: [],
      error: 'Erreur de connexion à l\'API'
    };
  }
};

// Hook pour dialectes
const useDialectes = () => {
  const [state, setState] = useState({
    data: [],
    isLoading: true,
    error: null,
    refetch: null
  });

  const loadDialectes = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await fetchDialectes();
    
    setState({
      data: result.data,
      isLoading: false,
      error: result.success ? null : result.error,
      refetch: loadDialectes
    });
  };

  useEffect(() => {
    loadDialectes();
  }, []);

  return state;
};

export default function DialectesPage() {
  const { data: dialectes, isLoading, error, refetch } = useDialectes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLangue, setFilterLangue] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    entityType: 'dialecte',
    entityName: '',
    initialData: null
  });

  const filteredDialectes = dialectes.filter(dialecte =>
    dialecte.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dialecte.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (dialecte.localite?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ).filter(dialecte => !filterLangue || dialecte.langue_principale === filterLangue);

  const langues = [...new Set(dialectes.map(d => d.langue_principale).filter(Boolean))].sort();

  // Configuration des champs du formulaire
  const formFields = [
    {
      name: 'nom',
      label: 'Nom du dialecte',
      type: 'text',
      required: true,
      placeholder: 'Ex: Mooré de Ouagadougou, Fulfulde du Sahel...'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Caractéristiques du dialecte, particularités...'
    },
    {
      name: 'langue_principale',
      label: 'Langue principale',
      type: 'select',
      required: false,
      options: [
        { value: 'Mooré', label: 'Mooré' },
        { value: 'Fulfulde', label: 'Fulfulde' },
        { value: 'Gourmantchéma', label: 'Gourmantchéma' },
        { value: 'Bissa', label: 'Bissa' },
        { value: 'Dioula', label: 'Dioula' },
        { value: 'Bobo', label: 'Bobo' },
        { value: 'Dagara', label: 'Dagara' },
        { value: 'Lobi', label: 'Lobi' },
        { value: 'Sénoufo', label: 'Sénoufo' },
        { value: 'Kassem', label: 'Kassem' },
        { value: 'Nuni', label: 'Nuni' },
        { value: 'Lyélé', label: 'Lyélé' },
        { value: 'Goin', label: 'Goin' },
        { value: 'Samo', label: 'Samo' },
        { value: 'Marka', label: 'Marka' },
        { value: 'Bwamu', label: 'Bwamu' },
        { value: 'Ko', label: 'Ko' },
        { value: 'Winyé', label: 'Winyé' },
        { value: 'Nankana', label: 'Nankana' },
        { value: 'Zarma', label: 'Zarma' },
        { value: 'Hausa', label: 'Hausa' }
      ]
    },
    {
      name: 'localite',
      label: 'Localité',
      type: 'text',
      required: false,
      placeholder: 'Ex: Kadiogo, Boulkiemdé, Boulgou...'
    }
  ];

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/api/neo4j/dialectes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création');
      }

      toast.success('Dialecte créé avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/dialectes/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      toast.success('Dialecte mis à jour avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/dialectes/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la suppression');
      }

      toast.success('Dialecte supprimé avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const openModal = (mode, dialecte = null) => {
    setModalConfig({
      isOpen: true,
      mode,
      entityType: 'dialecte',
      entityName: dialecte?.nom || '',
      initialData: dialecte ? {
        nom: dialecte.nom,
        description: dialecte.description || '',
        langue_principale: dialecte.langue_principale || '',
        localite: dialecte.localite || ''
      } : null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getLangueColor = (langue: string | null) => {
    if (!langue) return 'bg-gray-500';
    if (langue === 'Mooré') return 'bg-yellow-500';
    if (langue === 'Fulfulde') return 'bg-blue-500';
    if (langue === 'Gourmantchéma') return 'bg-green-500';
    if (langue === 'Bissa') return 'bg-purple-500';
    if (langue === 'Dioula') return 'bg-orange-500';
    if (langue === 'Bobo') return 'bg-red-500';
    return 'bg-indigo-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des dialectes..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Dialectes</h1>
            <p className="text-gray-600 dark:text-gray-400">{filteredDialectes.length} dialectes • Diversité linguistique régionale</p>
          </div>
        </div>
        <CRUDActions
          onAdd={() => openModal('create')}
          showAdd={true}
          entityName="dialecte"
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
            <input type="text" placeholder="Rechercher nom, description, localité..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select value={filterLangue} onChange={(e) => setFilterLangue(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white">
              <option value="">Toutes langues</option>
              {langues.map(langue => (
                <option key={langue} value={langue}>{langue}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dialecte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Langue Principale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Localité</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredDialectes.map((dialecte, index) => (
                  <motion.tr key={dialecte.nom} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3">
                          <Volume2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{dialecte.nom}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Variante régionale</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        {dialecte.description ? (
                          <div title={dialecte.description}>
                            {dialecte.description.length > 50 ? `${dialecte.description.substring(0, 50)}...` : dialecte.description}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dialecte.langue_principale ? (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getLangueColor(dialecte.langue_principale)}`}>
                            <Languages className="h-3 w-3 mr-1" />
                            {dialecte.langue_principale}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Non définie</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {dialecte.localite ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{dialecte.localite}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Non localisé</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CRUDActions
                        onView={() => openModal('view', dialecte)}
                        onEdit={() => openModal('edit', dialecte)}
                        onDelete={() => openModal('delete', dialecte)}
                        showView={true}
                        showEdit={true}
                        showDelete={true}
                        entityName="dialecte"
                        size="sm"
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredDialectes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🗣️</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm || filterLangue ? 'Aucun dialecte trouvé pour ces critères.' : 'Aucun dialecte disponible.'}
            </p>
            {(searchTerm || filterLangue) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterLangue('');
                }}
                className="mt-2 text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
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
