// Types principaux pour l'ontologie du Burkina Faso

export interface Ethnie {
  id: string;
  nom: string;
  nom_endogene?: string;
  langue_principale: string;
  langues_secondaires?: string[];
  famille_linguistique: string;
  region: string;
  population?: number;
  description?: string;
  traditions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Langue {
  id: string;
  nom: string;
  nom_endogene?: string;
  famille_linguistique: string;
  statut: 'principale' | 'secondaire' | 'vehiculaire' | 'liturgique';
  nombre_locuteurs: number;
  regions: string[];
  dialectes?: string[];
  ecriture?: string;
  iso_code?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FamilleLinguistique {
  id: string;
  nom: string;
  nom_endogene?: string;
  origine: string;
  langues: string[];
  nombre_locuteurs_total: number;
  regions_principales: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  nom: string;
  nom_endogene?: string;
  chef_lieu: string;
  provinces: string[];
  population?: number;
  superficie?: number;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  langues_principales: string[];
  ethnies_principales: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Province {
  id: string;
  nom: string;
  nom_endogene?: string;
  chef_lieu: string;
  region: string;
  population?: number;
  superficie?: number;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Patronyme {
  id: string;
  nom: string;
  origine_ethnique: string;
  famille_linguistique: string;
  regions: string[];
  signification?: string;
  variantes?: string[];
  frequence?: 'très_courant' | 'courant' | 'rare' | 'très_rare';
  created_at?: string;
  updated_at?: string;
}

export interface Dialecte {
  id: string;
  nom: string;
  langue_mere: string;
  regions: string[];
  nombre_locuteurs?: number;
  particularites?: string[];
  created_at?: string;
  updated_at?: string;
}

// Types pour les statistiques
export interface StatistiqueGenerale {
  nombre_total_ethnies: number;
  nombre_total_langues: number;
  nombre_total_familles: number;
  nombre_total_regions: number;
  nombre_total_provinces: number;
  nombre_total_patronymes: number;
  nombre_total_dialectes: number;
  nombre_total_locuteurs: number;
  pourcentage_langues_principales: number;
  pourcentage_langues_vehiculaires: number;
  updated_at: string;
}

export interface StatistiqueFamille {
  famille: string;
  nombre_langues: number;
  nombre_locuteurs: number;
  pourcentage_total: number;
  langues_principales: string[];
}

export interface StatistiqueRegion {
  region: string;
  nombre_ethnies: number;
  nombre_langues: number;
  population_totale: number;
  famille_dominante: string;
}

// Types pour les graphiques
export interface DataChart {
  name: string;
  value: number;
  color?: string;
}

export interface DataBarChart {
  name: string;
  langues: number;
  ethnies: number;
  locuteurs: number;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface ApiError {
  error: string;
  details?: string;
  status: number;
  timestamp: string;
}

// Types pour les filtres et recherche
export interface FilterOptions {
  famille_linguistique?: string;
  region?: string;
  statut?: string;
  ordre?: 'asc' | 'desc';
  tri_par?: 'nom' | 'population' | 'date_creation';
  limite?: number;
  page?: number;
}

export interface SearchParams {
  query: string;
  type: 'ethnie' | 'langue' | 'famille' | 'region' | 'patronyme' | 'dialecte' | 'all';
  filters?: FilterOptions;
}

// Types pour l'état de l'application
export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentPage: string;
  user?: User;
  isLoading: boolean;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  preferences: {
    theme: 'light' | 'dark';
    language: 'fr' | 'en';
  };
}

// Types pour les composants UI
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

// Types pour les hooks
export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<T> {
  mutate: (data: T) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// Types pour les contextes
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Types pour les événements
export interface CustomEvent<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

// Énumérations
export enum StatutLangue {
  PRINCIPALE = 'principale',
  SECONDAIRE = 'secondaire',
  VEHICULAIRE = 'vehiculaire',
  LITURGIQUE = 'liturgique'
}

export enum FrequencePatronyme {
  TRES_COURANT = 'très_courant',
  COURANT = 'courant',
  RARE = 'rare',
  TRES_RARE = 'très_rare'
}

export enum TypeRecherche {
  ETHNIE = 'ethnie',
  LANGUE = 'langue',
  FAMILLE = 'famille',
  REGION = 'region',
  PATRONYME = 'patronyme',
  DIALECTE = 'dialecte',
  ALL = 'all'
}

// Types pour les exports
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  type: 'ethnie' | 'langue' | 'famille' | 'region' | 'patronyme' | 'dialecte' | 'all';
  filters?: FilterOptions;
  include_stats?: boolean;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'owl';
  type: 'ethnie' | 'langue' | 'famille' | 'region' | 'patronyme' | 'dialecte';
  merge_strategy: 'replace' | 'merge' | 'skip';
  validate?: boolean;
} 