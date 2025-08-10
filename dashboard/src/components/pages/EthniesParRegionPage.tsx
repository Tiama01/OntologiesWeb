import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Ethnie {
  nom: string;
  synonyme?: string;
  description?: string;
  population_estimee?: number;
  pourcentage_national?: number;
  statut_national?: string;
}

interface Region {
  region: string;
  description_region?: string;
  latitude?: number;
  longitude?: number;
  ethnies: Ethnie[];
}

const EthniesParRegionPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'carte' | 'liste'>('carte');

  useEffect(() => {
    const fetchEthniesParRegion = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/neo4j/ethnies-par-region');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setRegions(data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEthniesParRegion();
  }, []);

  // Couleurs pour les régions
  const regionColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

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

  const totalEthnies = regions.reduce((acc, region) => acc + region.ethnies.length, 0);
  const regionsAvecCoordonnees = regions.filter(r => r.latitude && r.longitude);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-blue-600">{regions.length}</div>
          <div className="text-sm text-blue-600/80">Régions</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-green-600">{totalEthnies}</div>
          <div className="text-sm text-green-600/80">Ethnies totales</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-purple-600">
            {regionsAvecCoordonnees.length}
          </div>
          <div className="text-sm text-purple-600/80">Régions cartographiées</div>
        </div>
      </div>

      {/* Interface principale */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors"
            onClick={() => setActiveTab('carte')}
          >
            Carte Interactive
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setActiveTab('liste')}
          >
            Liste par Région
          </button>
        </div>

        {activeTab === 'carte' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Carte des Ethnies par Région</h3>
              </div>
              <div className="p-6">
              <div className="h-[600px] w-full rounded-lg overflow-hidden">
                <MapContainer
                  center={[12.2383, -1.5616]} // Centre du Burkina Faso
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {regionsAvecCoordonnees.map((region, index) => (
                    <CircleMarker
                      key={region.region}
                      center={[region.latitude!, region.longitude!]}
                      radius={Math.max(8, Math.min(20, region.ethnies.length * 2))}
                      fillColor={regionColors[index % regionColors.length]}
                      color={regionColors[index % regionColors.length]}
                      weight={2}
                      opacity={0.8}
                      fillOpacity={0.6}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-2">{region.region}</h3>
                          {region.description_region && (
                            <p className="text-sm text-gray-600 mb-3">{region.description_region}</p>
                          )}
                          <div className="mb-2">
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded mb-1">
                              {region.ethnies.length} ethnie{region.ethnies.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {region.ethnies.map((ethnie, ethnieIndex) => (
                              <div key={ethnieIndex} className="mb-2 p-2 bg-gray-50 rounded">
                                <div className="font-medium">{ethnie.nom}</div>
                                {ethnie.synonyme && (
                                  <div className="text-sm text-gray-600">Synonyme: {ethnie.synonyme}</div>
                                )}
                                {ethnie.population_estimee && (
                                  <div className="text-sm text-gray-600">
                                    Population: {ethnie.population_estimee.toLocaleString()}
                                  </div>
                                )}
                                {ethnie.pourcentage_national && (
                                  <div className="text-sm text-gray-600">
                                    {ethnie.pourcentage_national.toFixed(1)}% de la population
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'liste' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Liste des Ethnies par Région</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {regions.map((region, index) => (
                    <div key={region.region} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: regionColors[index % regionColors.length] }}
                          />
                          <span className="font-semibold">{region.region}</span>
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            {region.ethnies.length} ethnie{region.ethnies.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                      
                      {selectedRegion === region.region && (
                        <div className="px-4 pb-4">
                          {region.description_region && (
                            <p className="text-gray-600 mb-4">{region.description_region}</p>
                          )}
                          
                          {region.ethnies.length === 0 ? (
                            <p className="text-gray-500 italic">Aucune ethnie enregistrée pour cette région</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {region.ethnies.map((ethnie, ethnieIndex) => (
                                <div key={ethnieIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <h4 className="font-semibold text-lg mb-2">{ethnie.nom}</h4>
                                  
                                  {ethnie.synonyme && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      <span className="font-medium">Synonyme:</span> {ethnie.synonyme}
                                    </p>
                                  )}
                                  
                                  {ethnie.description && (
                                    <p className="text-sm text-gray-700 mb-3">{ethnie.description}</p>
                                  )}
                                  
                                  <div className="space-y-1">
                                    {ethnie.population_estimee && (
                                      <div className="flex justify-between text-sm">
                                        <span>Population:</span>
                                        <span className="font-medium">
                                          {ethnie.population_estimee.toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {ethnie.pourcentage_national && (
                                      <div className="flex justify-between text-sm">
                                        <span>Pourcentage:</span>
                                        <span className="font-medium">
                                          {ethnie.pourcentage_national.toFixed(1)}%
                                        </span>
                                      </div>
                                    )}
                                    
                                    {ethnie.statut_national && (
                                      <div className="flex justify-between text-sm">
                                        <span>Statut:</span>
                                        <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                          {ethnie.statut_national}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EthniesParRegionPage; 