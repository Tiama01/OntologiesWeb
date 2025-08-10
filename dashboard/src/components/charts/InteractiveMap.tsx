import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Users, Globe, Calendar } from 'lucide-react';
import L from 'leaflet';

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour les régions
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color}; 
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        📍
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Composant pour ajuster automatiquement la vue de la carte
const MapBounds = ({ regions }: { regions: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (regions.length > 0) {
      const validRegions = regions.filter(r => r.latitude && r.longitude);
      if (validRegions.length > 0) {
        const bounds = L.latLngBounds(
          validRegions.map(r => [r.latitude, r.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [regions, map]);

  return null;
};

interface InteractiveMapProps {
  data: any[];
  height?: string;
  className?: string;
}

export default function InteractiveMap({ data, height = '500px', className = '' }: InteractiveMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

  // Données des régions avec coordonnées GPS par défaut
  const defaultRegions = [
    { nom: 'Kadiogo', latitude: 12.3714, longitude: -1.5197, description: 'Région centrale, siège de Ouagadougou', ethnies: ['Mossi'], langues: ['Mooré', 'Français'], isNew: false },
    { nom: 'Yaadga', latitude: 13.4572, longitude: -2.0608, description: 'Région du Nord, terres sahéliennes', ethnies: ['Mossi', 'Peul'], langues: ['Mooré', 'Fulfulde'], isNew: false },
    { nom: 'Saaga', latitude: 10.7547, longitude: -3.2532, description: 'Région du Sud-Ouest, culture Lobi', ethnies: ['Lobi', 'Dagara'], langues: ['Lobi', 'Dagara'], isNew: false },
    { nom: 'Mouhoun', latitude: 12.2486, longitude: -3.0114, description: 'Boucles du Mouhoun, grenier céréalier', ethnies: ['Bobo', 'Mossi'], langues: ['Bobo', 'Mooré'], isNew: false },
    { nom: 'Wẽndmangré', latitude: 13.2167, longitude: -0.3667, description: 'Centre-Nord, berceau du royaume Mossi', ethnies: ['Mossi'], langues: ['Mooré'], isNew: false },
    { nom: 'Gulmu', latitude: 12.0364, longitude: 0.3556, description: 'Région de l\'Est, terres Gourmantché', ethnies: ['Gourmantché'], langues: ['Gourmantché'], isNew: false },
    { nom: 'Gourma', latitude: 11.1839, longitude: 0.2344, description: 'Centre-Est, coexistence pastorale', ethnies: ['Gourmantché', 'Peul'], langues: ['Gourmantché', 'Fulfulde'], isNew: false },
    { nom: 'Boulgou', latitude: 11.4000, longitude: -0.4500, description: 'Centre-Sud, agriculture intensive', ethnies: ['Bissa', 'Mossi'], langues: ['Bissa', 'Mooré'], isNew: false },
    { nom: 'Sirba', latitude: 14.5000, longitude: -0.5000, description: 'Nouvelle région 2025, zone frontalière', ethnies: ['Peul', 'Gourmantché'], langues: ['Fulfulde', 'Gourmantché'], isNew: true },
    { nom: 'Soum', latitude: 14.3289, longitude: -0.0431, description: 'Sahel remodelé 2025, commerce transsaharien', ethnies: ['Peul', 'Tuareg'], langues: ['Fulfulde', 'Tamasheq'], isNew: true },
    { nom: 'Tapoa', latitude: 12.0500, longitude: 2.1000, description: 'Nouvelle région 2025, Parc W du Niger', ethnies: ['Gourmantché', 'Hausa'], langues: ['Gourmantché', 'Hausa'], isNew: true },
    { nom: 'Sourou', latitude: 13.2000, longitude: -2.8000, description: 'Nouvelle région 2025, vallée fertile', ethnies: ['Mossi', 'Marka'], langues: ['Mooré', 'Marka'], isNew: true },
    { nom: 'Nayala', latitude: 12.6833, longitude: -2.8167, description: 'Nord-Ouest, populations Mossi et Marka', ethnies: ['Mossi', 'Marka'], langues: ['Mooré', 'Marka'], isNew: false },
    { nom: 'Bougouriba', latitude: 10.4333, longitude: -3.4667, description: 'Sud-Ouest, terres fertiles Dagara', ethnies: ['Dagara', 'Lobi'], langues: ['Dagara', 'Lobi'], isNew: false },
    { nom: 'Poni', latitude: 10.2833, longitude: -3.1000, description: 'Frontalière Sud-Ouest, échanges transfrontaliers', ethnies: ['Lobi', 'Dagara'], langues: ['Lobi', 'Dagara'], isNew: false },
    { nom: 'Ioba', latitude: 11.0167, longitude: -2.8333, description: 'Sud-Ouest aurifère, agriculture vivrière', ethnies: ['Dagara'], langues: ['Dagara'], isNew: false },
    { nom: 'Kouritenga', latitude: 12.1500, longitude: -0.2500, description: 'Centre-Est convergence, mélange ethnique', ethnies: ['Bissa', 'Mossi'], langues: ['Bissa', 'Mooré'], isNew: false }
  ];

  // Utiliser les données passées en props ou les données par défaut
  const regions = data.length > 0 ? data : defaultRegions;
  const validRegions = regions.filter(r => r.latitude && r.longitude);

  // Centre du Burkina Faso
  const centerBurkina: [number, number] = [12.2383, -1.5616];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              🗺️ Carte Interactive du Burkina Faso
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {validRegions.length} régions géolocalisées • Réorganisation territoriale 2025
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Anciennes</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Nouvelles 2025</span>
            </div>
          </div>
        </div>

        <div style={{ height }} className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <MapContainer
            center={centerBurkina}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapBounds regions={validRegions} />

            {validRegions.map((region, index) => (
              <Marker
                key={region.nom}
                position={[region.latitude, region.longitude]}
                icon={createCustomIcon(region.isNew ? '#10B981' : '#3B82F6')}
                eventHandlers={{
                  click: () => setSelectedRegion(region),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 min-w-64">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        {region.nom}
                      </h4>
                      {region.isNew && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Nouvelle 2025
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {region.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">Coordonnées:</span>
                        <span className="ml-1 text-gray-600">
                          {region.latitude.toFixed(4)}°N, {region.longitude.toFixed(4)}°E
                        </span>
                      </div>
                      
                      {region.ethnies && (
                        <div className="flex items-start text-sm">
                          <Users className="h-4 w-4 mr-2 text-purple-600 mt-0.5" />
                          <div>
                            <span className="font-medium">Ethnies principales:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {region.ethnies.slice(0, 3).map((ethnie: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                  {ethnie}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {region.langues && (
                        <div className="flex items-start text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-orange-600 mt-0.5" />
                          <div>
                            <span className="font-medium">Langues parlées:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {region.langues.slice(0, 3).map((langue: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                  {langue}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Statistiques de la carte */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {validRegions.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Régions localisées
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {validRegions.filter(r => r.isNew).length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Nouvelles 2025
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {[...new Set(validRegions.flatMap(r => r.ethnies || []))].length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Ethnies représentées
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {[...new Set(validRegions.flatMap(r => r.langues || []))].length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Langues parlées
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
