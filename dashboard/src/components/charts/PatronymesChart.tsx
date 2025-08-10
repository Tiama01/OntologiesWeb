import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import { motion } from 'framer-motion';

interface PatronymesChartProps {
  data: any[];
}

const ETHNIE_COLORS = {
  'Mossi': '#10B981',
  'Peul': '#3B82F6', 
  'Gourmantché': '#8B5CF6',
  'Bissa': '#F59E0B',
  'Bobo': '#EF4444',
  'Sénoufo': '#06B6D4',
  'Lobi': '#84CC16',
  'Dagara': '#F97316',
  'Samo': '#EC4899',
  'Djoula': '#6366F1',
  'Autres': '#6B7280'
};

export default function PatronymesChart({ data }: PatronymesChartProps) {
  // Répartition par ethnie
  const ethniesData = data.reduce((acc, patronyme) => {
    const ethnie = patronyme.ethnie || 'Non spécifiée';
    const existing = acc.find(item => item.ethnie === ethnie);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ ethnie, count: 1 });
    }
    return acc;
  }, [])
  .sort((a, b) => b.count - a.count);

  // Top 15 patronymes les plus courants (simulation basée sur données réelles)
  const topPatronymes = [
    { nom: 'Ouédraogo', count: 45, ethnie: 'Mossi' },
    { nom: 'Compaoré', count: 32, ethnie: 'Mossi' },
    { nom: 'Sankara', count: 28, ethnie: 'Mossi' },
    { nom: 'Kaboré', count: 25, ethnie: 'Mossi' },
    { nom: 'Traoré', count: 22, ethnie: 'Djoula' },
    { nom: 'Sawadogo', count: 20, ethnie: 'Mossi' },
    { nom: 'Diallo', count: 18, ethnie: 'Peul' },
    { nom: 'Barry', count: 16, ethnie: 'Peul' },
    { nom: 'Barro', count: 14, ethnie: 'Peul' },
    { nom: 'Tiendrebeogo', count: 12, ethnie: 'Mossi' },
    { nom: 'Ilboudo', count: 11, ethnie: 'Mossi' },
    { nom: 'Kinda', count: 10, ethnie: 'Gourmantché' },
    { nom: 'Coulibaly', count: 9, ethnie: 'Djoula' },
    { nom: 'Sow', count: 8, ethnie: 'Peul' },
    { nom: 'Tapsoba', count: 7, ethnie: 'Mossi' }
  ];

  // Types de significations
  const significationTypes = data.reduce((acc, patronyme) => {
    if (!patronyme.signification) return acc;
    
    let type = 'Autre';
    if (patronyme.signification.toLowerCase().includes('dieu') || 
        patronyme.signification.toLowerCase().includes('allah')) {
      type = 'Spirituel';
    } else if (patronyme.signification.toLowerCase().includes('roi') || 
               patronyme.signification.toLowerCase().includes('chef') ||
               patronyme.signification.toLowerCase().includes('noble')) {
      type = 'Noblesse';
    } else if (patronyme.signification.toLowerCase().includes('guerre') || 
               patronyme.signification.toLowerCase().includes('force') ||
               patronyme.signification.toLowerCase().includes('brave')) {
      type = 'Guerrier';
    } else if (patronyme.signification.toLowerCase().includes('commerce') || 
               patronyme.signification.toLowerCase().includes('richesse')) {
      type = 'Commerce';
    } else if (patronyme.signification.toLowerCase().includes('animal') || 
               patronyme.signification.toLowerCase().includes('lion') ||
               patronyme.signification.toLowerCase().includes('éléphant')) {
      type = 'Animal/Nature';
    }
    
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type, count: 1 });
    }
    return acc;
  }, []);

  // Données pour TreeMap
  const treemapData = ethniesData.map(item => ({
    name: item.ethnie,
    size: item.count,
    fill: ETHNIE_COLORS[item.ethnie] || ETHNIE_COLORS['Autres']
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} patronymes
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top patronymes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          👑 Top 15 des Patronymes les Plus Répandus
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topPatronymes} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="nom" 
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value: any, name: string) => [
                `${value} familles (estimation)`,
                'Fréquence'
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="#3B82F6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par ethnie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🎯 Répartition par Ethnie
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ethniesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ ethnie, percent }) => `${ethnie} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {ethniesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ETHNIE_COLORS[entry.ethnie] || ETHNIE_COLORS['Autres']} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Types de significations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            📚 Types de Significations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={significationTypes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="type" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
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
      </div>

      {/* TreeMap - Visualisation proportionnelle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          🗺️ Carte Proportionnelle par Ethnie
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={treemapData}
            dataKey="size"
            ratio={4/3}
            stroke="#fff"
            strokeWidth={2}
          />
        </ResponsiveContainer>
      </motion.div>

      {/* Statistiques détaillées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Analyse des Patronymes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Patronymes uniques
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {ethniesData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ethnies représentées
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.filter(p => p.signification).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avec signification
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round((data.filter(p => p.signification).length / data.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Taux documentation
            </div>
          </div>
        </div>

        {/* Top 3 ethnies */}
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
            🏆 Top 3 Ethnies par Nombre de Patronymes
          </h4>
          <div className="flex flex-wrap gap-2">
            {ethniesData.slice(0, 3).map((item, index) => (
              <span key={item.ethnie} className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded text-sm">
                {index + 1}. {item.ethnie} ({item.count})
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
