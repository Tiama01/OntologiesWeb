import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import CRUDModal from '../common/CRUDModal';
import toast from 'react-hot-toast';

interface Ethnie {
  nom: string;
  synonyme?: string;
  description?: string;
  tradition?: string;
  population?: number;
  pourcentage?: number;
  statut?: string;
}

const ToutesEthniesPage: React.FC = () => {
  const [ethnies, setEthnies] = useState<Ethnie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('TOUS');
  const [sortBy, setSortBy] = useState<'nom' | 'population' | 'pourcentage'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [crudModal, setCrudModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit' | 'delete',
    data: null
  });

  useEffect(() => {
    const fetchEthnies = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/neo4j/ethnies');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setEthnies(data);
      } catch (err) {
        setError('Erreur lors du chargement des ethnies');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEthnies();
  }, []);

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

      toast.success('Ethnie créée avec succès');
      setCrudModal({ isOpen: false, mode: 'create', data: null });
      // Recharger les données
      const newResponse = await fetch('http://localhost:8000/api/neo4j/ethnies');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        setEthnies(newData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/neo4j/ethnies/${formData.nom}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      toast.success('Ethnie mise à jour avec succès');
      setCrudModal({ isOpen: false, mode: 'create', data: null });
      // Recharger les données
      const newResponse = await fetch('http://localhost:8000/api/neo4j/ethnies');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        setEthnies(newData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
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

      toast.success('Ethnie supprimée avec succès');
      setCrudModal({ isOpen: false, mode: 'create', data: null });
      // Recharger les données
      const newResponse = await fetch('http://localhost:8000/api/neo4j/ethnies');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        setEthnies(newData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
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
    { name: 'population', label: 'Population estimée', type: 'number' as const, placeholder: 'Nombre d\'habitants' },
    { name: 'pourcentage', label: 'Pourcentage national', type: 'number' as const, placeholder: 'Pourcentage de la population' },
    { 
      name: 'statut', 
      label: 'Statut national', 
      type: 'select' as const, 
      options: [
        { value: 'MAJORITAIRE', label: 'Majoritaire' },
        { value: 'MINORITAIRE', label: 'Minoritaire' }
      ]
    }
  ];

  // Filtrage et tri des ethnies
  const filteredAndSortedEthnies = ethnies
    .filter(ethnie => {
      const matchesSearch = ethnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (ethnie.synonyme && ethnie.synonyme.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (ethnie.description && ethnie.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatut = filterStatut === 'TOUS' || ethnie.statut === filterStatut;
      
      return matchesSearch && matchesStatut;
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy] || '';
      let bValue: string | number = b[sortBy] || '';
      
      if (sortBy === 'population' || sortBy === 'pourcentage') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Statistiques
  const totalEthnies = ethnies.length;
  const ethniesMajoritaires = ethnies.filter(e => e.statut === 'MAJORITAIRE').length;
  const ethniesMinoritaires = ethnies.filter(e => e.statut === 'MINORITAIRE').length;
  const totalPopulation = ethnies.reduce((sum, e) => sum + (e.population || 0), 0);
  const moyennePopulation = totalPopulation / totalEthnies;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-blue-600">{totalEthnies}</div>
          <div className="text-sm text-blue-600/80">Total Ethnies</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-green-600">{ethniesMajoritaires}</div>
          <div className="text-sm text-green-600/80">Ethnies Majoritaires</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-purple-600">{ethniesMinoritaires}</div>
          <div className="text-sm text-purple-600/80">Ethnies Minoritaires</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(moyennePopulation / 1000)}k
          </div>
          <div className="text-sm text-orange-600/80">Population Moyenne</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtres et recherche
          </h3>
          <button
            onClick={() => openModal('create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une ethnie
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom, synonyme, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              <option value="TOUS">Toutes les ethnies</option>
              <option value="MAJORITAIRE">Majoritaires</option>
              <option value="MINORITAIRE">Minoritaires</option>
            </select>
          </div>

          {/* Tri par */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'nom' | 'population' | 'pourcentage')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              <option value="nom">Nom</option>
              <option value="population">Population</option>
              <option value="pourcentage">Pourcentage</option>
            </select>
          </div>

          {/* Ordre de tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordre
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Toutes les Ethnies du Burkina Faso ({filteredAndSortedEthnies.length} résultats)
          </h3>
        </div>
        
        <div className="p-6">
          {filteredAndSortedEthnies.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Aucune ethnie trouvée avec les critères sélectionnés.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEthnies.map((ethnie, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {ethnie.nom}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        ethnie.statut === 'MAJORITAIRE' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {ethnie.statut}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openModal('edit', ethnie)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openModal('delete', ethnie)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {ethnie.synonyme && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Synonyme:</span> {ethnie.synonyme}
                    </p>
                  )}
                  
                  {ethnie.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {ethnie.description}
                    </p>
                  )}
                  
                  {ethnie.tradition && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium">Tradition:</span> {ethnie.tradition}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {ethnie.population && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Population:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {ethnie.population.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {ethnie.pourcentage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Pourcentage:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {ethnie.pourcentage.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
  );
};

export default ToutesEthniesPage; 