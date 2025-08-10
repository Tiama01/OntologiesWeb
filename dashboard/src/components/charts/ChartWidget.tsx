import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Eye, EyeOff } from 'lucide-react';
import EthniesChart from './EthniesChart';
import LanguesChart from './LanguesChart';
import RegionsChart from './RegionsChart';
import PatronymesChart from './PatronymesChart';

interface ChartWidgetProps {
  title: string;
  type: 'ethnies' | 'langues' | 'regions' | 'patronymes';
  data: any[];
  className?: string;
  defaultExpanded?: boolean;
}

export default function ChartWidget({ 
  title, 
  type, 
  data, 
  className = '', 
  defaultExpanded = false 
}: ChartWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getIcon = () => {
    switch (type) {
      case 'ethnies': return '👥';
      case 'langues': return '🗣️';
      case 'regions': return '🗺️';
      case 'patronymes': return '👨‍👩‍👧‍👦';
      default: return '📊';
    }
  };

  const getChartComponent = () => {
    switch (type) {
      case 'ethnies':
        return <EthniesChart data={data} />;
      case 'langues':
        return <LanguesChart data={data} />;
      case 'regions':
        return <RegionsChart data={data} />;
      case 'patronymes':
        return <PatronymesChart data={data} />;
      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  const getStatsPreview = () => {
    switch (type) {
      case 'ethnies':
        const majoritaires = data.filter(e => e.statut_national === 'MAJORITAIRE').length;
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {data.length} ethnies • {majoritaires} majoritaire(s)
            </span>
          </div>
        );
      case 'langues':
        const totalLocuteurs = data.reduce((sum, l) => sum + (l.nombre_locuteurs || 0), 0);
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {data.length} langues • {(totalLocuteurs / 1000000).toFixed(1)}M locuteurs
            </span>
          </div>
        );
      case 'regions':
        const avecGPS = data.filter(r => r.latitude && r.longitude).length;
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {data.length} régions • {avecGPS} avec GPS
            </span>
          </div>
        );
      case 'patronymes':
        const avecSignification = data.filter(p => p.signification).length;
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {data.length} patronymes • {avecSignification} documentés
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* En-tête cliquable */}
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        className="p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getIcon()}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {getStatsPreview()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-3 w-3" />
              <PieChart className="h-3 w-3" />
              <TrendingUp className="h-3 w-3" />
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Contenu des graphiques */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {data.length > 0 ? (
                getChartComponent()
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune donnée disponible pour les graphiques
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
