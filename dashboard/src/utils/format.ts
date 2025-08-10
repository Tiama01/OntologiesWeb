/**
 * Formate un nombre pour l'affichage
 * @param num - Le nombre à formater
 * @returns Le nombre formaté avec des séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString('fr-FR');
};

/**
 * Formate un pourcentage
 * @param value - La valeur du pourcentage
 * @param total - Le total pour calculer le pourcentage
 * @returns Le pourcentage formaté
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

/**
 * Formate une date
 * @param date - La date à formater
 * @returns La date formatée en français
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
