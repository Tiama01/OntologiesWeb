// Service API simplifié pour éviter les erreurs d'import
const API_BASE_URL = 'http://localhost:8000';

export const fetchApi = async (endpoint: string, timeout = 15000) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur API ${endpoint}:`, error);
    throw error;
  }
};

export default { fetchApi };
