import InteractiveMap from './InteractiveMap';import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface RegionsChartProps {
  data: any[];
}

const REGION_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4'
];

export default function RegionsChart({ data }: RegionsChartProps) {
  // Données géographiques (latitude/longitude)
  const geoData = data
    .filter(region => region.latitude && region.longitude)
    .map((region, index) => ({
      nom: region.nom,
      latitude: region.latitude,
      longitude: region.longitude,
      index: index,
      description: region.description || ''
    }));

  // Données par zone géographique
  const zoneData = data.map((region, index) => {
    let zone = 'Centre';
    if (region.latitude) {
      if (region.latitude > 13) zone = 'Nord';
      else if (region.latitude < 11) zone = 'Sud';
      else if (region.longitude && region.longitude < -2) zone = 'Ouest';
      else if (region.longitude && region.longitude > 0) zone = 'Est';
    }
    
    return {
      nom: region.nom,
      zone: zone,
      hasGPS: !!(region.latitude && region.longitude),
      descriptionLength: region.description ? region.description.length : 0
    };
  });

  // Répartition par zone
  const zoneRepartition = zoneData.reduce((acc, region) => {
    const existing = acc.find(item => item.zone === region.zone);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ zone: region.zone, count: 1 });
    }
    return acc;
  }, []);

  // Nouvelles régions 2025
  const nouvellesRegions = ['Sirba', 'Soum', 'Tapoa', 'Sourou'];
  const regionsParStatut = [
    { statut: 'Anciennes', count: data.length - nouvellesRegions.length },
    { statut: 'Nouvelles 2025', count: nouvellesRegions.filter(nom => data.find(r => r.nom === nom)).length }
  ];

  // Tooltip personnalisé pour carte géographique
  const GeoTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{data.nom}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📍 {data.latitude}°N, {data.longitude}°E
          </p>
          {data.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.description.length > 100 
                ? data.description.substring(0, 100) + '...'
                : data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Carte géographique interactive des régions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InteractiveMap 
          data={data} 
          height="500px"
          className="shadow-xl"
        />
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par zone géographique */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🧭 Répartition par Zone
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneRepartition}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Anciennes vs Nouvelles régions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🆕 Réorganisation Territoriale 2025
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionsParStatut}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ statut, count, percent }) => `${statut}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                <Cell fill="#6B7280" /> {/* Gris pour anciennes */}
                <Cell fill="#10B981" /> {/* Vert pour nouvelles */}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Statistiques géographiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Analyse Territoriale
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Régions totales
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {nouvellesRegions.filter(nom => data.find(r => r.nom === nom)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Nouvelles 2025
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {geoData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avec coordonnées GPS
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round((geoData.length / data.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Couverture GPS
            </div>
          </div>
        </div>
        
        {/* Nouvelles régions highlight */}
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            🆕 Nouvelles Régions 2025
          </h4>
          <div className="flex flex-wrap gap-2">
            {nouvellesRegions.map(nom => (
              <span key={nom} className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-sm">
                {nom}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
