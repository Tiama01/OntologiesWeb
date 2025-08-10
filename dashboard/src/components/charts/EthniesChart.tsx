import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface EthniesChartProps {
  data: any[];
}

const COLORS = {
  MAJORITAIRE: '#10B981', // Vert
  MINORITAIRE: '#3B82F6', // Bleu
  'Groupe 1': '#8B5CF6', // Violet
  'Groupe 2': '#F59E0B', // Orange
  'Groupe 3': '#EF4444', // Rouge
  'Groupe 4': '#06B6D4', // Cyan
};

export default function EthniesChart({ data }: EthniesChartProps) {
  // Données pour graphique en secteurs - Répartition par statut
  const statutData = data.reduce((acc, ethnie) => {
    const statut = ethnie.statut_national || 'Non spécifié';
    const existing = acc.find(item => item.name === statut);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: statut, value: 1 });
    }
    return acc;
  }, []);

  // Données pour graphique en barres - Top 10 ethnies par longueur de tradition
  const traditionData = data
    .filter(ethnie => ethnie.tradition)
    .map(ethnie => ({
      nom: ethnie.nom,
      longueur_tradition: ethnie.tradition.length,
      statut: ethnie.statut_national
    }))
    .sort((a, b) => b.longueur_tradition - a.longueur_tradition)
    .slice(0, 10);

  // Tooltip personnalisé
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en secteurs - Répartition par statut */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          📊 Répartition par Statut National
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
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Graphique en barres - Richesse des traditions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          📚 Richesse des Traditions (Top 10)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={traditionData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="nom" 
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value: any, name: string) => [
                `${value} caractères`,
                'Longueur tradition'
              ]}
            />
            <Bar 
              dataKey="longueur_tradition" 
              fill="#3B82F6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Statistiques textuelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Insights des Données
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ethnies recensées
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statutData.find(s => s.name === 'MAJORITAIRE')?.value || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ethnies majoritaires
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.filter(e => e.tradition).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avec traditions documentées
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
