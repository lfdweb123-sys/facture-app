const API_URL = import.meta.env.VITE_APP_URL || '';

// Récupérer un token d'accès (simulé - à remplacer par vrai auth)
function getAuthToken() {
  const user = JSON.parse(localStorage.getItem('authUser') || '{}');
  return user?.token || '';
}

// Helper pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

// ──────────────────────────────────────────────
// FACTURES
// ──────────────────────────────────────────────

export const invoicesApi = {
  // Créer une facture
  create: (data) => apiRequest('/v1/invoices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Lister les factures
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/v1/invoices${query ? `?${query}` : ''}`);
  },

  // Récupérer une facture
  get: (id) => apiRequest(`/v1/invoices/${id}`),

  // Mettre à jour le statut
  updateStatus: (id, status) => apiRequest(`/v1/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Supprimer une facture
  delete: (id) => apiRequest(`/v1/invoices/${id}`, {
    method: 'DELETE'
  })
};

// ──────────────────────────────────────────────
// CLIENTS
// ──────────────────────────────────────────────

export const clientsApi = {
  list: () => apiRequest('/v1/clients'),
  get: (id) => apiRequest(`/v1/clients/${id}`),
  create: (data) => apiRequest('/v1/clients', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ──────────────────────────────────────────────
// CONTRATS
// ──────────────────────────────────────────────

export const contractsApi = {
  create: (data) => apiRequest('/v1/contracts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  list: () => apiRequest('/v1/contracts'),
  get: (id) => apiRequest(`/v1/contracts/${id}`)
};

// ──────────────────────────────────────────────
// PAIEMENTS
// ──────────────────────────────────────────────

export const paymentsApi = {
  getHistory: () => apiRequest('/v1/payments'),
  getStatus: (id) => apiRequest(`/v1/payments/${id}`)
};

// ──────────────────────────────────────────────
// PORTERFEUILLE / RETRAITS
// ──────────────────────────────────────────────

export const walletApi = {
  getBalance: () => apiRequest('/v1/wallet/balance'),
  requestWithdrawal: (data) => apiRequest('/v1/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getTransactions: () => apiRequest('/v1/wallet/transactions')
};

// ──────────────────────────────────────────────
// WEBHOOKS
// ──────────────────────────────────────────────

export const webhooksApi = {
  register: (url, events) => apiRequest('/v1/webhooks', {
    method: 'POST',
    body: JSON.stringify({ url, events })
  }),
  list: () => apiRequest('/v1/webhooks'),
  delete: (id) => apiRequest(`/v1/webhooks/${id}`, {
    method: 'DELETE'
  })
};

export default {
  invoices: invoicesApi,
  clients: clientsApi,
  contracts: contractsApi,
  payments: paymentsApi,
  wallet: walletApi,
  webhooks: webhooksApi
};