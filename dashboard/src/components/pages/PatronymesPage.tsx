import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, Crown, Heart, Star } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import CRUDModal from '../common/CRUDModal';
import CRUDActions from '../common/CRUDActions';
import toast from 'react-hot-toast';

interface Patronyme {
  nom: string;
  signification: string | null;
  origine: string | null;
  ethnie: string | null;
}

// Service pour récupérer les patronymes depuis l'API Neo4j
const fetchPatronymes = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/neo4j/patronymes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.patronymes || data.data || data };
  } catch (error) {
    console.error('❌ Erreur récupération patronymes:', error);
    return { 
      success: false, 
      data: [],
      error: 'Erreur de connexion à l\'API'
    };
  }
};

// Hook pour patronymes
const usePatronymes = () => {
  const [state, setState] = useState({
    data: [],
    isLoading: true,
    error: null,
    refetch: null
  });

  const loadPatronymes = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await fetchPatronymes();
    
    setState({
      data: result.data,
      isLoading: false,
      error: result.success ? null : result.error,
      refetch: loadPatronymes
    });
  };

  useEffect(() => {
    loadPatronymes();
  }, []);

  return state;
};

export default function PatronymesPage() {
  const { data: patronymes, isLoading, error, refetch } = usePatronymes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEthnie, setFilterEthnie] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    entityType: 'patronyme',
    entityName: '',
    initialData: null
  });

  const filteredPatronymes = patronymes.filter(patronyme =>
    patronyme.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patronyme.signification?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (patronyme.origine?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ).filter(patronyme => !filterEthnie || patronyme.ethnie === filterEthnie);

  const ethnies = [...new Set(patronymes.map(p => p.ethnie).filter(Boolean))].sort();

  // Configuration des champs du formulaire
  const formFields = [
    {
      name: 'nom',
      label: 'Nom du patronyme',
      type: 'text',
      required: true,
      placeholder: 'Ex: Ouédraogo, Sankara, Compaoré...'
    },
    {
      name: 'signification',
      label: 'Signification',
      type: 'text',
      required: false,
      placeholder: 'Ex: Celui qui apporte l\'honneur'
    },
    {
      name: 'origine',
      label: 'Origine',
      type: 'text',
      required: false,
      placeholder: 'Ex: Patronyme royal mossi'
    },
    {
      name: 'ethnie',
      label: 'Ethnie',
      type: 'select',
      required: false,
      options: [
        { value: 'Mossi', label: 'Mossi' },
        { value: 'Peul', label: 'Peul' },
        { value: 'Mandé', label: 'Mandé' },
        { value: 'Gourmantché', label: 'Gourmantché' },
        { value: 'Bissa', label: 'Bissa' },
        { value: 'Bobo', label: 'Bobo' },
        { value: 'Sénoufo', label: 'Sénoufo' },
        { value: 'Lobi', label: 'Lobi' },
        { value: 'Dagara', label: 'Dagara' },
        { value: 'Gourounsi', label: 'Gourounsi' },
        { value: 'Hausa', label: 'Hausa' },
        { value: 'Adja', label: 'Adja' }
      ]
    }
  ];

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/api/neo4j/patronymes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création');
      }

      toast.success('Patronyme créé avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/patronymes/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      toast.success('Patronyme mis à jour avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/patronymes/${encodeURIComponent(modalConfig.entityName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la suppression');
      }

      toast.success('Patronyme supprimé avec succès !');
      refetch && refetch();
      return true;
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const openModal = (mode, patronyme = null) => {
    setModalConfig({
      isOpen: true,
      mode,
      entityType: 'patronyme',
      entityName: patronyme?.nom || '',
      initialData: patronyme ? {
        nom: patronyme.nom,
        signification: patronyme.signification || '',
        origine: patronyme.origine || '',
        ethnie: patronyme.ethnie || ''
      } : null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getEthnieIcon = (ethnie: string | null) => {
    if (!ethnie) return <Users className="h-4 w-4" />;
    if (ethnie === 'Mossi') return <Crown className="h-4 w-4" />;
    if (ethnie === 'Peul') return <Star className="h-4 w-4" />;
    return <Heart className="h-4 w-4" />;
  };

  const getEthnieColor = (ethnie: string | null) => {
    if (!ethnie) return 'bg-gray-500';
    if (ethnie === 'Mossi') return 'bg-yellow-500';
    if (ethnie === 'Peul') return 'bg-blue-500';
    if (ethnie === 'Mandé') return 'bg-green-500';
    if (ethnie === 'Gourmantché') return 'bg-purple-500';
    return 'bg-indigo-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des patronymes..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Patronymes</h1>
            <p className="text-gray-600 dark:text-gray-400">{filteredPatronymes.length} noms de famille • Héritage culturel burkinabé</p>
          </div>
        </div>
        <CRUDActions
          onAdd={() => openModal('create')}
          showAdd={true}
          entityName="patronyme"
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
            <input type="text" placeholder="Rechercher nom, signification, origine..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select value={filterEthnie} onChange={(e) => setFilterEthnie(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
              <option value="">Toutes ethnies</option>
              {ethnies.map(ethnie => (
                <option key={ethnie} value={ethnie}>{ethnie}</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Patronyme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Signification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Origine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ethnie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredPatronymes.map((patronyme, index) => (
                  <motion.tr key={patronyme.nom} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`${getEthnieColor(patronyme.ethnie)} w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3`}>
                          {getEthnieIcon(patronyme.ethnie)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{patronyme.nom}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Nom de famille</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        {patronyme.signification ? (
                          <div title={patronyme.signification}>
                            {patronyme.signification.length > 40 ? `${patronyme.signification.substring(0, 40)}...` : patronyme.signification}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        {patronyme.origine ? (
                          <div title={patronyme.origine}>
                            {patronyme.origine.length > 30 ? `${patronyme.origine.substring(0, 30)}...` : patronyme.origine}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {patronyme.ethnie ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getEthnieColor(patronyme.ethnie)}`}>
                          {patronyme.ethnie}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Non définie</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CRUDActions
                        onView={() => openModal('view', patronyme)}
                        onEdit={() => openModal('edit', patronyme)}
                        onDelete={() => openModal('delete', patronyme)}
                        showView={true}
                        showEdit={true}
                        showDelete={true}
                        entityName="patronyme"
                        size="sm"
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredPatronymes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm || filterEthnie ? 'Aucun patronyme trouvé pour ces critères.' : 'Aucun patronyme disponible.'}
            </p>
            {(searchTerm || filterEthnie) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterEthnie('');
                }}
                className="mt-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
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
