import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Search, Filter, Info, Download } from 'lucide-react';
import InteractiveMap from '../charts/InteractiveMap';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Region {
  nom: string;
  latitude: number | null;
  longitude: number | null;
  description?: string;
  ethnies?: string[];
  langues?: string[];
  isNew?: boolean;
}

// Service pour récupérer les données des régions
const fetchRegions = async (): Promise<Region[]> => {
  try {
    const response = await fetch('http://localhost:8000/api/regions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.regions || data.data || [];
    }
  } catch (error) {
    console.error('Erreur récupération régions:', error);
  }

  // Données de fallback avec toutes les régions
  return [
    { nom: 'Kadiogo', latitude: 12.3714, longitude: -1.5197, description: 'Région centrale, siège de Ouagadougou', ethnies: ['Mossi'], langues: ['Mooré', 'Français'], isNew: false },
    { nom: 'Yaadga', latitude: 13.4572, longitude: -2.0608, description: 'Région du Nord, terres sahéliennes', ethnies: ['Mossi', 'Peul'], langues: ['Mooré', 'Fulfulde'], isNew: false },
    { nom: 'Saaga', latitude: 10.7547, longitude: -3.2532, description: 'Région du Sud-Ouest, culture traditionnelle Lobi', ethnies: ['Lobi', 'Dagara'], langues: ['Lobi', 'Dagara'], isNew: false },
    { nom: 'Mouhoun', latitude: 12.2486, longitude: -3.0114, description: 'Boucles du Mouhoun, grenier céréalier du pays', ethnies: ['Bobo', 'Mossi'], langues: ['Bobo', 'Mooré'], isNew: false },
    { nom: 'Wẽndmangré', latitude: 13.2167, longitude: -0.3667, description: 'Centre-Nord, berceau du royaume Mossi traditionnel', ethnies: ['Mossi'], langues: ['Mooré'], isNew: false },
    { nom: 'Gulmu', latitude: 12.0364, longitude: 0.3556, description: 'Région de l\'Est, terres ancestrales Gourmantché', ethnies: ['Gourmantché'], langues: ['Gourmantché'], isNew: false },
    { nom: 'Gourma', latitude: 11.1839, longitude: 0.2344, description: 'Centre-Est, coexistence pastorale et agricole', ethnies: ['Gourmantché', 'Peul'], langues: ['Gourmantché', 'Fulfulde'], isNew: false },
    { nom: 'Boulgou', latitude: 11.4000, longitude: -0.4500, description: 'Centre-Sud, agriculture intensive et élevage', ethnies: ['Bissa', 'Mossi'], langues: ['Bissa', 'Mooré'], isNew: false },
    { nom: 'Sirba', latitude: 14.5000, longitude: -0.5000, description: 'Nouvelle région 2025, zone frontalière Niger-Mali', ethnies: ['Peul', 'Gourmantché'], langues: ['Fulfulde', 'Gourmantché'], isNew: true },
    { nom: 'Soum', latitude: 14.3289, longitude: -0.0431, description: 'Sahel remodelé 2025, commerce transsaharien historique', ethnies: ['Peul', 'Tuareg'], langues: ['Fulfulde', 'Tamasheq'], isNew: true },
    { nom: 'Tapoa', latitude: 12.0500, longitude: 2.1000, description: 'Nouvelle région 2025, Parc W du Niger et réserves', ethnies: ['Gourmantché', 'Hausa'], langues: ['Gourmantché', 'Hausa'], isNew: true },
    { nom: 'Sourou', latitude: 13.2000, longitude: -2.8000, description: 'Nouvelle région 2025, vallée fertile et aménagements hydrauliques', ethnies: ['Mossi', 'Marka'], langues: ['Mooré', 'Marka'], isNew: true },
    { nom: 'Nayala', latitude: 12.6833, longitude: -2.8167, description: 'Nord-Ouest, populations Mossi et Marka traditionnelles', ethnies: ['Mossi', 'Marka'], langues: ['Mooré', 'Marka'], isNew: false },
    { nom: 'Bougouriba', latitude: 10.4333, longitude: -3.4667, description: 'Sud-Ouest, terres fertiles et culture Dagara', ethnies: ['Dagara', 'Lobi'], langues: ['Dagara', 'Lobi'], isNew: false },
    { nom: 'Poni', latitude: 10.2833, longitude: -3.1000, description: 'Frontalière Sud-Ouest, échanges transfrontaliers intenses', ethnies: ['Lobi', 'Dagara'], langues: ['Lobi', 'Dagara'], isNew: false },
    { nom: 'Ioba', latitude: 11.0167, longitude: -2.8333, description: 'Sud-Ouest aurifère, agriculture vivrière diversifiée', ethnies: ['Dagara'], langues: ['Dagara'], isNew: false },
    { nom: 'Kouritenga', latitude: 12.1500, longitude: -0.2500, description: 'Centre-Est terre de convergence, mélange ethnique riche', ethnies: ['Bissa', 'Mossi'], langues: ['Bissa', 'Mooré'], isNew: false }
  ];
};

export default function CartePage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'old'>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    const loadRegions = async () => {
      setIsLoading(true);
      const data = await fetchRegions();
      setRegions(data);
      setFilteredRegions(data);
      setIsLoading(false);
    };
    loadRegions();
  }, []);

  useEffect(() => {
    let filtered = regions;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(region =>
        region.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.ethnies?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
        region.langues?.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrage par type
    if (filterType === 'new') {
      filtered = filtered.filter(region => region.isNew);
    } else if (filterType === 'old') {
      filtered = filtered.filter(region => !region.isNew);
    }

    setFilteredRegions(filtered);
  }, [regions, searchTerm, filterType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement de la carte géographique..." />
      </div>
    );
  }

  const stats = {
    total: regions.length,
    nouvelles: regions.filter(r => r.isNew).length,
    avec_gps: regions.filter(r => r.latitude && r.longitude).length,
    ethnies_total: [...new Set(regions.flatMap(r => r.ethnies || []))].length,
    langues_total: [...new Set(regions.flatMap(r => r.langues || []))].length
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Globe className="h-8 w-8 mr-3 text-blue-600" />
            Carte Géographique Interactive
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Exploration interactive des {stats.total} régions administratives du Burkina Faso
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stats.avec_gps}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Géolocalisées
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.nouvelles}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Nouvelles 2025
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, description, ethnie ou langue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les régions</option>
              <option value="new">Nouvelles 2025 ({stats.nouvelles})</option>
              <option value="old">Anciennes ({stats.total - stats.nouvelles})</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📍 {filteredRegions.length} régions affichées sur {stats.total} total
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>👥 {stats.ethnies_total} ethnies</span>
            <span>🗣️ {stats.langues_total} langues</span>
          </div>
        </div>
      </motion.div>

      {/* Carte interactive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <InteractiveMap 
          data={filteredRegions} 
          height="600px"
          className="shadow-xl"
        />
      </motion.div>

     
    </div>
  );
}
