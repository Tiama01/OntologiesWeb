import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Search, Globe, Navigation, Map } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ExportButton from '../ui/ExportButton';

interface Region {
  nom: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const { data, loading } = useApi<{regions: Region[]}>('/api/regions');

  // 17 régions administratives avec noms endogènes
  const demoRegions: Region[] = [
    { nom: "Kadiogo", description: "Région centrale, ancien Centre, abritant Ouagadougou capitale.", latitude: 12.3714, longitude: -1.5197 },
    { nom: "Yaadga", description: "Région du Nord, terres sahéliennes. Population Mossi et Fulbé.", latitude: 13.4572, longitude: -2.0608 },
    { nom: "Saaga", description: "Région du Sud, ancien Sud-Ouest. Culture traditionnelle Lobi.", latitude: 10.7547, longitude: -3.2532 },
    { nom: "Mouhoun", description: "Région Boucles du Mouhoun. Grenier à céréales du pays.", latitude: 12.2486, longitude: -3.0114 },
    { nom: "Wẽndmangré", description: "Centre-Nord, terre d'origine Mossi. Berceau royaume Tenkodogo.", latitude: 13.2167, longitude: -0.3667 },
    { nom: "Gulmu", description: "Région de l'Est. Populations Gourmantché majoritaires.", latitude: 12.0364, longitude: 0.3556 },
    { nom: "Gourma", description: "Centre-Est, terres pastorales. Coexistence Gourmantché-Peul.", latitude: 11.1839, longitude: 0.2344 },
    { nom: "Boulgou", description: "Centre-Sud. Agriculture intensive et élevage traditionnel.", latitude: 11.4000, longitude: -0.4500 },
    { nom: "Sirba", description: "Nouvelle région 2025. Zone frontalière Niger-Mali.", latitude: 14.5000, longitude: -0.5000 },
    { nom: "Soum", description: "Région Sahel remodelée 2025. Commerce transsaharien.", latitude: 14.3289, longitude: -0.0431 },
    { nom: "Tapoa", description: "Nouvelle région 2025. Parc W du Niger et réserves.", latitude: 12.0500, longitude: 2.1000 },
    { nom: "Sourou", description: "Nouvelle région 2025. Vallée fertile et hydraulique.", latitude: 13.2000, longitude: -2.8000 },
    { nom: "Nayala", description: "Nord-Ouest. Populations Mossi et Marka traditionnelles.", latitude: 12.6833, longitude: -2.8167 },
    { nom: "Bougouriba", description: "Sud-Ouest, terres fertiles. Dagara et Lobi.", latitude: 10.4333, longitude: -3.4667 },
    { nom: "Poni", description: "Sud-Ouest frontalière. Échanges transfrontaliers.", latitude: 10.2833, longitude: -3.1000 },
    { nom: "Ioba", description: "Sud-Ouest. Terres aurifères et agriculture vivrière.", latitude: 11.0167, longitude: -2.8333 },
    { nom: "Kouritenga", description: "Centre-Est, terre de convergence. Mélange ethnique riche.", latitude: 12.1500, longitude: -0.2500 }
  ];

  useEffect(() => {
    const regionsData = data?.regions?.length ? data.regions : demoRegions;
    setRegions(regionsData);
    setFilteredRegions(regionsData);
  }, [data]);

  useEffect(() => {
    const filtered = regions.filter(region =>
      region.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (region.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredRegions(filtered);
  }, [searchTerm, regions]);

  const resetForm = () => {
    setFormData({ nom: '', description: '', latitude: null, longitude: null });
    setEditingRegion(null);
    setShowForm(false);
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      nom: region.nom,
      description: region.description || '',
      latitude: region.latitude,
      longitude: region.longitude
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.nom.trim()) return;
    if (editingRegion) {
      setRegions(regions.map(r => r.nom === editingRegion.nom ? { ...formData } : r));
    } else {
      setRegions([...regions, { ...formData }]);
    }
    resetForm();
  };

  const handleDelete = (nom: string) => {
    if (deleteConfirm === nom) {
      setRegions(regions.filter(r => r.nom !== nom));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(nom);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec bouton export */}
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
        
        <div className="flex items-center space-x-3">
          {/* BOUTON D'EXPORT */}
          <ExportButton
            data={filteredRegions}
            filename="regions_burkina_faso"
            type="regions"
            title="Régions Administratives du Burkina Faso"
          />
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)} 
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg">
            <Plus className="h-4 w-4" /><span>Nouvelle Région</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recherche et stats */}
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

      {/* Message informatif */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
          📊 Export de données disponible
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Exportez les données des régions en CSV, Excel ou PDF. Les coordonnées GPS et descriptions complètes sont incluses.
        </p>
      </div>

      {/* Tableau des régions - reste identique */}
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
                      <div className="flex items-center space-x-2 justify-end">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(region)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(region.nom)}
                          className={`p-2 rounded-lg transition-colors ${deleteConfirm === region.nom ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                          title={deleteConfirm === region.nom ? 'Confirmer' : 'Supprimer'}>
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal formulaire - reste identique */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-xl">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingRegion ? 'Modifier' : 'Nouvelle'} région
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                  <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Kadiogo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Description géographique..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                    <input type="number" step="0.0001" value={formData.latitude || ''} 
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="12.3714" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                    <input type="number" step="0.0001" value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="-1.5197" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={!formData.nom.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-lg disabled:opacity-50 shadow-lg">
                  {editingRegion ? 'Mettre à jour' : 'Ajouter'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
