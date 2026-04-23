// Limites par plan
const PLAN_LIMITS = {
  free: {
    maxInvoices: 5,
    maxContracts: 2,
    payments: 'limited',
    ai: 'basic',
    support: 'email',
    retraits: false,
    api: false,
    maxUsers: 1
  },
  pro: {
    maxInvoices: Infinity,
    maxContracts: Infinity,
    payments: 'unlimited',
    ai: 'full',
    support: 'priority',
    retraits: true,
    api: false,
    maxUsers: 1
  },
  business: {
    maxInvoices: Infinity,
    maxContracts: Infinity,
    payments: 'unlimited',
    ai: 'full',
    support: 'dedicated',
    retraits: true,
    api: true,
    maxUsers: 5
  }
};

// Obtenir le plan actuel de l'utilisateur
export function getUserPlan(user) {
  return user?.subscription?.plan || 'free';
}

// Obtenir les limites du plan
export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// Vérifier si l'utilisateur peut créer une facture
export async function canCreateInvoice(user, currentCount) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  const count = currentCount || 0;
  
  if (count >= limits.maxInvoices) {
    return { 
      allowed: false, 
      message: `Limite de ${limits.maxInvoices} factures atteinte. Passez au plan Pro pour des factures illimitées.`,
      upgradeTo: 'pro'
    };
  }
  return { allowed: true };
}

// Vérifier si l'utilisateur peut créer un contrat
export async function canCreateContract(user, currentCount) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  const count = currentCount || 0;
  
  if (count >= limits.maxContracts) {
    return { 
      allowed: false, 
      message: `Limite de ${limits.maxContracts} contrats atteinte. Passez au plan Pro pour des contrats illimités.`,
      upgradeTo: 'pro'
    };
  }
  return { allowed: true };
}

// Vérifier si l'utilisateur peut utiliser les retraits
export function canWithdraw(user) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  return {
    allowed: limits.retraits,
    message: limits.retraits ? '' : 'Les retraits sont réservés aux plans Pro et Business.',
    upgradeTo: 'pro'
  };
}

// Vérifier si l'utilisateur peut utiliser l'API
export function canUseApi(user) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  return {
    allowed: limits.api,
    message: limits.api ? '' : 'L\'API est réservée au plan Business.',
    upgradeTo: 'business'
  };
}

// Vérifier si l'utilisateur peut utiliser l'IA complète
export function canUseFullAI(user) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  return {
    allowed: limits.ai === 'full' || limits.ai === 'full+',
    message: limits.ai === 'basic' ? 'L\'IA complète est réservée aux plans Pro et Business.' : '',
    level: limits.ai,
    upgradeTo: 'pro'
  };
}

// Vérifier si l'utilisateur peut utiliser les paiements illimités
export function canUseUnlimitedPayments(user) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  return {
    allowed: limits.payments === 'unlimited',
    message: limits.payments === 'limited' ? 'Paiements limités sur le plan Gratuit.' : '',
    upgradeTo: 'pro'
  };
}

// Obtenir toutes les restrictions actuelles
export function getUserRestrictions(user) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  
  return {
    plan,
    limits,
    canInvoice: limits.maxInvoices,
    canContract: limits.maxContracts,
    canWithdraw: limits.retraits,
    canUseApi: limits.api,
    canUseFullAI: limits.ai !== 'basic',
    aiLevel: limits.ai,
    paymentsType: limits.payments,
    supportType: limits.support,
    maxUsers: limits.maxUsers
  };
}