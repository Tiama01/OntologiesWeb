import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  TreePine, 
  MapPin, 
  TrendingUp,
  Globe,
  BarChart3,
  Activity,
  Crown,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { formatNumber } from '../../utils/format';
import { useDashboardData } from '../../hooks/useApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ChartWidget from '../charts/ChartWidget';

// Services pour récupérer les données
const fetchAllData = async () => {
  try {
    const [ethniesRes, languesRes, regionsRes, patronymesRes] = await Promise.all([
      fetch('http://localhost:8000/api/ethnies', { signal: AbortSignal.timeout(10000) }),
      fetch('http://localhost:8000/api/langues', { signal: AbortSignal.timeout(10000) }),
      fetch('http://localhost:8000/api/regions', { signal: AbortSignal.timeout(10000) }),
      fetch('http://localhost:8000/api/patronymes', { signal: AbortSignal.timeout(10000) })
    ]);

    const [ethniesData, languesData, regionsData, patronymesData] = await Promise.all([
      ethniesRes.ok ? ethniesRes.json() : { ethnies: [] },
      languesRes.ok ? languesRes.json() : { langues: [] },
      regionsRes.ok ? regionsRes.json() : { regions: [] },
      patronymesRes.ok ? patronymesRes.json() : { patronymes: [] }
    ]);

    return {
      ethnies: ethniesData.ethnies || ethniesData.data || [],
      langues: languesData.langues || languesData.data || [],
      regions: regionsData.regions || regionsData.data || [],
      patronymes: patronymesData.patronymes || patronymesData.data || []
    };
  } catch (error) {
    console.error('Erreur récupération données:', error);
    return {
      ethnies: [
        { nom: 'Mossi', statut_national: 'MAJORITAIRE', tradition: 'Royaume traditionnel' },
        { nom: 'Peul', statut_national: 'MINORITAIRE', tradition: 'Élevage transhumant' },
        { nom: 'Gourmantché', statut_national: 'MINORITAIRE', tradition: 'Agriculture traditionnelle' }
      ],
      langues: [
        { nom: 'Mooré', nombre_locuteurs: 12600000, statut: 'principale', famille_linguistique: 'Niger-Congo' },
        { nom: 'Fulfulde', nombre_locuteurs: 1600000, statut: 'principale', famille_linguistique: 'Niger-Congo' },
        { nom: 'Français', nombre_locuteurs: 5000000, statut: 'officielle', famille_linguistique: 'Indo-Européenne' }
      ],
      regions: [
        { nom: 'Kadiogo', latitude: 12.3714, longitude: -1.5197, description: 'Région centrale' },
        { nom: 'Yaadga', latitude: 13.4572, longitude: -2.0608, description: 'Région du Nord' }
      ],
      patronymes: [
        { nom: 'Ouédraogo', ethnie: 'Mossi', signification: 'Descendant de roi' },
        { nom: 'Diallo', ethnie: 'Peul', signification: 'Audacieux' }
      ]
    };
  }
};

// Composant de carte statistique améliorée
interface StatCardEnhancedProps {
  title: string;
  value: string;
  subtitle?: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  isExpandable?: boolean;
}

const StatCardEnhanced: React.FC<StatCardEnhancedProps> = ({ 
  title, 
  value, 
  subtitle,
  change, 
  changeType, 
  icon, 
  gradient,
  onClick,
  isExpandable = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} card-hover bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}
      whileHover={onClick ? { scale: 1.02 } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            {isExpandable && (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {subtitle}
            </p>
          )}
          <div className="flex items-center space-x-1">
            <TrendingUp className={`h-4 w-4 ${
              changeType === 'positive' ? 'text-green-500' :
              changeType === 'negative' ? 'text-red-500' :
              'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
              changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-white/20 dark:bg-gray-800/20 rounded-lg ml-4">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Composant principal Dashboard enrichi
const DashboardEnhanced: React.FC = () => {
  const [allData, setAllData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWidget, setExpandedWidget] = useState<string | null>('ethnies');
  const [showAllCharts, setShowAllCharts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchAllData();
      setAllData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des données enrichies..." />
      </div>
    );
  }

  // Calculs statistiques avancés
  const stats = {
    total_ethnies: allData.ethnies?.length || 0,
    total_langues: allData.langues?.length || 0,
    total_regions: allData.regions?.length || 0,
    total_patronymes: allData.patronymes?.length || 0,
    total_locuteurs: allData.langues?.reduce((sum: number, l: any) => sum + (l.nombre_locuteurs || 0), 0) || 0,
    ethnies_majoritaires: allData.ethnies?.filter((e: any) => e.statut_national === 'MAJORITAIRE').length || 0,
    langues_principales: allData.langues?.filter((l: any) => l.statut === 'principale').length || 0,
    regions_avec_gps: allData.regions?.filter((r: any) => r.latitude && r.longitude).length || 0,
    patronymes_documentes: allData.patronymes?.filter((p: any) => p.signification).length || 0
  };

  // Données pour graphiques de synthèse
  const diversiteData = [
    { category: 'Ethnies', total: stats.total_ethnies, majoritaires: stats.ethnies_majoritaires },
    { category: 'Langues', total: stats.total_langues, principales: stats.langues_principales },
    { category: 'Régions', total: stats.total_regions, avec_gps: stats.regions_avec_gps },
    { category: 'Patronymes', total: stats.total_patronymes, documentes: stats.patronymes_documentes }
  ];

  const handleStatCardClick = (type: string) => {
    setExpandedWidget(expandedWidget === type ? null : type);
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête enrichi */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ontologie Burkina Faso
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Analyse interactive des données ethnolinguistiques • {stats.total_locuteurs > 0 && `${formatNumber(stats.total_locuteurs)} locuteurs`}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowAllCharts(!showAllCharts)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
          >
            {showAllCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {showAllCharts ? 'Masquer' : 'Afficher'} tous les graphiques
            </span>
          </button>
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Données en temps réel
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cartes de statistiques interactives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardEnhanced
          title="Ethnies recensées"
          value={stats.total_ethnies.toString()}
          subtitle={`${stats.ethnies_majoritaires} majoritaire(s)`}
          change={`${stats.ethnies_majoritaires} groupes majoritaires`}
          changeType="positive"
          icon={<Users className="h-6 w-6 text-blue-600" />}
          gradient="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
          onClick={() => handleStatCardClick('ethnies')}
          isExpandable={true}
        />
        
        <StatCardEnhanced
          title="Langues vivantes"
          value={stats.total_langues.toString()}
          subtitle={`${formatNumber(stats.total_locuteurs)} locuteurs`}
          change={`${stats.langues_principales} langues principales`}
          changeType="positive"
          icon={<MessageSquare className="h-6 w-6 text-green-600" />}
          gradient="from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
          onClick={() => handleStatCardClick('langues')}
          isExpandable={true}
        />
        
        <StatCardEnhanced
          title="Régions administratives"
          value={stats.total_regions.toString()}
          subtitle={`${stats.regions_avec_gps} avec coordonnées GPS`}
          change="Réorganisation 2025"
          changeType="neutral"
          icon={<MapPin className="h-6 w-6 text-purple-600" />}
          gradient="from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
          onClick={() => handleStatCardClick('regions')}
          isExpandable={true}
        />
        
        <StatCardEnhanced
          title="Patronymes uniques"
          value={stats.total_patronymes.toString()}
          subtitle={`${stats.patronymes_documentes} avec signification`}
          change={`${Math.round((stats.patronymes_documentes / stats.total_patronymes) * 100)}% documentés`}
          changeType="positive"
          icon={<Crown className="h-6 w-6 text-orange-600" />}
          gradient="from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
          onClick={() => handleStatCardClick('patronymes')}
          isExpandable={true}
        />
      </div>

      {/* Graphique de synthèse diversité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            🌍 Vue d'ensemble de la Diversité Culturelle
          </h3>
          <BarChart3 className="h-5 w-5 text-gray-500" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diversiteData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="total" fill="#3B82F6" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="majoritaires" fill="#10B981" name="Majoritaires" radius={[4, 4, 0, 0]} />
              <Bar dataKey="principales" fill="#10B981" name="Principales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avec_gps" fill="#8B5CF6" name="Avec GPS" radius={[4, 4, 0, 0]} />
              <Bar dataKey="documentes" fill="#F59E0B" name="Documentés" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Widgets de graphiques interactifs */}
      {(showAllCharts || expandedWidget) && (
        <div className="space-y-6">
          {(showAllCharts || expandedWidget === 'ethnies') && (
            <ChartWidget
              title="📊 Analyse des Ethnies"
              type="ethnies"
              data={allData.ethnies || []}
              defaultExpanded={expandedWidget === 'ethnies'}
            />
          )}
          
          {(showAllCharts || expandedWidget === 'langues') && (
            <ChartWidget
              title="🗣️ Analyse des Langues"
              type="langues"
              data={allData.langues || []}
              defaultExpanded={expandedWidget === 'langues'}
            />
          )}
          
          {(showAllCharts || expandedWidget === 'regions') && (
            <ChartWidget
              title="🗺️ Analyse des Régions"
              type="regions"
              data={allData.regions || []}
              defaultExpanded={expandedWidget === 'regions'}
            />
          )}
          
          {(showAllCharts || expandedWidget === 'patronymes') && (
            <ChartWidget
              title="👨‍👩‍👧‍👦 Analyse des Patronymes"
              type="patronymes"
              data={allData.patronymes || []}
              defaultExpanded={expandedWidget === 'patronymes'}
            />
          )}
        </div>
      )}

      {/* Message d'aide */}
      {!showAllCharts && !expandedWidget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                �� Explorez les données interactives
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Cliquez sur les cartes statistiques ci-dessus pour voir des graphiques détaillés, ou utilisez le bouton 
                "Afficher tous les graphiques" pour une vue complète.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                  Graphiques en secteurs
                </span>
                <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                  Cartes géographiques
                </span>
                <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                  Analyses statistiques
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardEnhanced;
