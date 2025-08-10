import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  MapPin, 
  FileText,
  BarChart3,
  Hash,
  Globe,  Globe2,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import armoirie from '../../assets/armoirie.jpeg';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  children?: NavigationItem[];
}

interface Counts {
  ethnies: number;
  langues: number;
  regions: number;
  patronymes: number;
  dialectes: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onNavigate }) => {
  const [counts, setCounts] = useState<Counts>({
    ethnies: 0,
    langues: 0,
    regions: 0,
    patronymes: 0,
    dialectes: 0
  });

  // Récupération des compteurs depuis l'API
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const baseUrl = 'http://localhost:8000/api/neo4j';
        
        // Récupération parallèle de tous les compteurs
        const [ethniesRes, languesRes, regionsRes, patronymesRes, dialectesRes] = await Promise.all([
          fetch(`${baseUrl}/ethnies`),
          fetch(`${baseUrl}/langues`),
          fetch(`${baseUrl}/regions`),
          fetch(`${baseUrl}/patronymes`),
          fetch(`${baseUrl}/dialectes`)
        ]);

        const [ethniesData, languesData, regionsData, patronymesData, dialectesData] = await Promise.all([
          ethniesRes.json(),
          languesRes.json(),
          regionsRes.json(),
          patronymesRes.json(),
          dialectesRes.json()
        ]);

        setCounts({
          ethnies: ethniesData.length || 0,
          langues: languesData.length || 0,
          regions: regionsData.length || 0,
          patronymes: patronymesData.length || 0,
          dialectes: dialectesData.length || 0
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des compteurs:', error);
        // En cas d'erreur, on garde les valeurs par défaut
      }
    };

    fetchCounts();
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <Home className="h-5 w-5" />,
      path: 'dashboard',
    },
    {
      id: 'toutes-ethnies',
      label: 'Toutes les Ethnies',
      icon: <Users className="h-5 w-5" />,
      path: 'toutes-ethnies',
      badge: counts.ethnies,
    },

    {
      id: 'ethnies-par-region',
      label: 'Ethnies par Région',
      icon: <MapPin className="h-5 w-5" />,
      path: 'ethnies-par-region',
      badge: 'Carte',
    },
    
    {
      id: 'langues',
      label: 'Langues',
      icon: <MessageSquare className="h-5 w-5" />,
      path: 'langues',
      badge: counts.langues,
    },

    {
      id: 'regions',
      label: 'Régions',
      icon: <MapPin className="h-5 w-5" />,
      path: 'regions',
      badge: counts.regions,
    },
    {
      id: 'carte',
      label: 'Carte Interactive',
      icon: <Globe className="h-5 w-5" />,
      path: 'carte',
      badge: 'GPS',
    },
    
    {
      id: 'patronymes',
      label: 'Patronymes',
      icon: <Hash className="h-5 w-5" />,
      path: 'patronymes',
      badge: counts.patronymes,
    },
    {
      id: 'dialectes',
      label: 'Dialectes',
      icon: <Globe2 className="h-5 w-5" />,
      path: 'dialectes',
      badge: counts.dialectes,
    },
    {
      id: 'statistiques',
      label: 'Statistiques',
      icon: <BarChart3 className="h-5 w-5" />,
      path: 'statistiques',
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: <FileText className="h-5 w-5" />,
      path: 'documentation',
    },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => onNavigate(currentPage)}
        />
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:bg-white lg:dark:bg-dark-800 lg:border-r lg:border-gray-200 lg:dark:border-dark-700">
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
                <img
                  src={armoirie}
                  alt="Armoiries du Burkina Faso"
                  className="object-contain w-14 h-14"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Ontologie BF
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    currentPage === item.path
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`${
                      currentPage === item.path 
                        ? 'text-white' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                        currentPage === item.path
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        currentPage === item.path 
                          ? 'text-white rotate-90' 
                          : 'text-gray-400 group-hover:text-primary-500'
                      }`} />
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </nav>

        

          {/* Version et copyright */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Ontologie des langues et ethnies du BF Dashboard v1.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                © 2025 Burkina Faso
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile avec animation */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
                <img
                  src={armoirie}
                  alt="Armoiries du Burkina Faso"
                  className="object-contain w-14 h-14"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Ontologie BF
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    currentPage === item.path
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`${
                      currentPage === item.path 
                        ? 'text-white' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                        currentPage === item.path
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        currentPage === item.path 
                          ? 'text-white rotate-90' 
                          : 'text-gray-400 group-hover:text-primary-500'
                      }`} />
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </nav>

         
          {/* Version et copyright */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Ontologie Dashboard v1.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                © 2025 Burkina Faso
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar; 