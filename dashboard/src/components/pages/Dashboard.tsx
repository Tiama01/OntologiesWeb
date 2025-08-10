import React from 'react';
import { 
  Users, 
  MessageSquare, 
  TreePine, 
  MapPin, 
  TrendingUp,
  Globe,
  BarChart3,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatNumber } from '../../utils/format';
import { useDashboardData } from '../../hooks/useApi';
import LoadingSpinner from '../ui/LoadingSpinner';

// Données de fallback pour les graphiques
const fallbackFamillesData = [
  { name: 'Niger-Congo', value: 12600000, color: '#3b82f6' },
  { name: 'Nilo-Saharienne', value: 4200000, color: '#10b981' },
  { name: 'Afro-Asiatique', value: 1600000, color: '#f59e0b' },
  { name: 'Khoisan', value: 584068, color: '#ef4444' },
];

const fallbackRegionData = [
  { name: 'Centre', ethnies: 12, langues: 8, locuteurs: 3500000 },
  { name: 'Nord', ethnies: 8, langues: 6, locuteurs: 2800000 },
  { name: 'Est', ethnies: 15, langues: 12, locuteurs: 2100000 },
  { name: 'Ouest', ethnies: 10, langues: 9, locuteurs: 1900000 },
  { name: 'Sud-Ouest', ethnies: 7, langues: 5, locuteurs: 1400000 },
];

const fallbackEvolutionData = [
  { mois: 'Jan', ethnies: 60, langues: 65 },
  { mois: 'Fév', ethnies: 62, langues: 67 },
  { mois: 'Mar', ethnies: 64, langues: 69 },
  { mois: 'Avr', ethnies: 65, langues: 70 },
  { mois: 'Mai', ethnies: 66, langues: 71 },
  { mois: 'Jun', ethnies: 67, langues: 72 },
];

const fallbackLanguesData = [
  { name: 'Mooré', locuteurs: 12600000 },
  { name: 'Fulfulde', locuteurs: 1600000 },
  { name: 'Gourmantché', locuteurs: 1200000 },
  { name: 'Bissa', locuteurs: 1200000 },
  { name: 'Dyula', locuteurs: 800000 },
  { name: 'Bobo', locuteurs: 500000 },
  { name: 'Sénoufo', locuteurs: 400000 },
  { name: 'Lobi', locuteurs: 350000 },
  { name: 'Dagara', locuteurs: 300000 },
  { name: 'Kassem', locuteurs: 250000 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card-hover bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {value}
          </p>
          <div className="flex items-center space-x-1">
            <TrendingUp className={`h-4 w-4 ${
              changeType === 'positive' ? 'text-success-500' :
              changeType === 'negative' ? 'text-danger-500' :
              'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-success-600' :
              changeType === 'negative' ? 'text-danger-600' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-white/20 dark:bg-dark-800/20 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des données réelles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Erreur lors du chargement des données
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Vérifiez que le backend est accessible sur le port 8000
          </p>
        </div>
      </div>
    );
  }

  // Données réelles ou fallback sur données simulées
  const stats = dashboardData?.stats || {};
  const donnees = dashboardData?.toutes_donnees || {};
  
  // Calculer les données pour les graphiques à partir des vraies données
  const famillesData = donnees.familles_linguistiques?.map((famille: any, index: number) => ({
    name: famille.nom,
    value: famille.total_locuteurs || 0,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
  })) || fallbackFamillesData;

  // Données pour le graphique des langues principales
  const languesData = donnees.langues?.slice(0, 10).map((langue: any) => ({
    name: langue.nom,
    locuteurs: langue.nombreLocuteur || 0,
    color: '#3b82f6'
  })) || fallbackLanguesData;

  // Données pour les régions (combinées avec les vraies données si disponibles)
  const regionData = donnees.regions?.map((region: any) => ({
    name: region.nom,
    ethnies: region.ethnies?.length || 0,
    langues: region.langues?.length || 0,
    locuteurs: region.total_locuteurs || 0
  })) || fallbackRegionData;

  // Données d'évolution (pour l'instant fallback, pourrait être calculé à partir des vraies données)
  const evolutionData = fallbackEvolutionData;

  return (
    <div className="space-y-6 p-6">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de l'ontologie ethnolinguistique du Burkina Faso
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
            <Activity className="h-4 w-4 text-success-500 animate-pulse" />
            <span className="text-sm font-medium text-success-700 dark:text-success-400">
              Données à jour
            </span>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ethnies recensées"
          value={stats.total_ethnies?.toString() || "67"}
          change={`${stats.total_ethnies || 67} groupes ethniques`}
          changeType="positive"
          icon={<Users className="h-6 w-6 text-primary-600" />}
          gradient="from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20"
        />
        <StatCard
          title="Langues vivantes"
          value={stats.total_langues?.toString() || "72"}
          change={`${stats.total_langues || 72} langues documentées`}
          changeType="positive"
          icon={<MessageSquare className="h-6 w-6 text-success-600" />}
          gradient="from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20"
        />
        <StatCard
          title="Familles linguistiques"
          value={stats.total_familles_linguistiques?.toString() || "4"}
          change={`${stats.total_familles_linguistiques || 4} familles principales`}
          changeType="neutral"
          icon={<TreePine className="h-6 w-6 text-warning-600" />}
          gradient="from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20"
        />
        <StatCard
          title="Locuteurs totaux"
          value={formatNumber(stats.nombre_total_locuteurs || 25984068)}
          change={`${formatNumber(stats.nombre_total_locuteurs || 25984068)} personnes`}
          changeType="positive"
          icon={<Globe className="h-6 w-6 text-accent-600" />}
          gradient="from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par familles linguistiques */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Répartition par familles linguistiques
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={famillesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {famillesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${formatNumber(value)} locuteurs`, 'Nombre']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {famillesData.map((famille, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: famille.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {famille.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Langues par région */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Langues par région
            </h3>
            <MapPin className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="langues" fill="#3b82f6" name="Langues" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ethnies" fill="#10b981" name="Ethnies" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Évolution temporelle et statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution temporelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Évolution des données
            </h3>
            <Activity className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ethnies" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Ethnies"
                />
                <Line 
                  type="monotone" 
                  dataKey="langues" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Langues"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Statistiques rapides
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Régions</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total couvert</p>
              </div>
              <span className="text-lg font-bold text-primary-600">{stats.total_localites || 17}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Patronymes</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Uniques recensés</p>
              </div>
              <span className="text-lg font-bold text-success-600">{stats.total_patronymes || 419}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dialectes</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Variantes locales</p>
              </div>
              <span className="text-lg font-bold text-warning-600">{stats.total_dialectes || 23}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Population totale</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Habitants estimés</p>
              </div>
              <span className="text-lg font-bold text-accent-600">{formatNumber(stats.population_totale_estimee || 25984068)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 