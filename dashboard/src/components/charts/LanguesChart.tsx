import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface LanguesChartProps {
  data: any[];
}

const STATUT_COLORS = {
  'principale': '#10B981', // Vert
  'secondaire': '#F59E0B', // Orange  
  'vehiculaire': '#3B82F6', // Bleu
  'officielle': '#8B5CF6', // Violet
  'liturgique': '#EF4444', // Rouge
  'minoritaire': '#6B7280', // Gris
};

const FAMILLE_COLORS = {
  'Niger-Congo': '#10B981',
  'Afro-Asiatique': '#F59E0B', 
  'Indo-Européenne': '#3B82F6',
  'Nilo-Saharienne': '#8B5CF6',
  'Khoisan': '#EF4444',
};

export default function LanguesChart({ data }: LanguesChartProps) {
  // Données pour graphique locuteurs (en millions)
  const locuteursData = data
    .filter(langue => langue.nombre_locuteurs && langue.nombre_locuteurs > 0)
    .map(langue => ({
      nom: langue.nom,
      locuteurs: langue.nombre_locuteurs / 1000000, // Convertir en millions
      statut: langue.statut
    }))
    .sort((a, b) => b.locuteurs - a.locuteurs)
    .slice(0, 12);

  // Données pour répartition par statut
  const statutData = data.reduce((acc, langue) => {
    const statut = langue.statut || 'Non spécifié';
    const existing = acc.find(item => item.name === statut);
    if (existing) {
      existing.value += 1;
      existing.locuteurs += langue.nombre_locuteurs || 0;
    } else {
      acc.push({ 
        name: statut, 
        value: 1,
        locuteurs: langue.nombre_locuteurs || 0
      });
    }
    return acc;
  }, []);

  // Données pour familles linguistiques
  const familleData = data.reduce((acc, langue) => {
    const famille = langue.famille_linguistique || 'Non spécifiée';
    const existing = acc.find(item => item.name === famille);
    if (existing) {
      existing.value += 1;
      existing.locuteurs += langue.nombre_locuteurs || 0;
    } else {
      acc.push({ 
        name: famille, 
        value: 1,
        locuteurs: langue.nombre_locuteurs || 0
      });
    }
    return acc;
  }, []);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.name === 'locuteurs' 
                  ? `${entry.value.toFixed(1)}M locuteurs`
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalLocuteurs = data.reduce((sum, langue) => sum + (langue.nombre_locuteurs || 0), 0);

  return (
    <div className="space-y-6">
      {/* Graphique des locuteurs par langue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          👥 Nombre de Locuteurs par Langue (millions)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={locuteursData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="nom" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Millions de locuteurs', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value: any) => [`${value.toFixed(1)}M`, 'Locuteurs']}
            />
            <Bar 
              dataKey="locuteurs" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🏷️ Répartition par Statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUT_COLORS[entry.name] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Répartition par famille linguistique */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🌍 Familles Linguistiques
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={familleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {familleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FAMILLE_COLORS[entry.name] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Statistiques enrichies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Analyse Linguistique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Langues recensées
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(totalLocuteurs / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total locuteurs
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {familleData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Familles linguistiques
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.filter(l => l.statut === 'principale').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Langues principales
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
