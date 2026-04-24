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
    maxUsers: 1,
    maxAIMessages: 10 // messages IA par mois pour le plan gratuit
  },
  pro: {
    maxInvoices: Infinity,
    maxContracts: Infinity,
    payments: 'unlimited',
    ai: 'full',
    support: 'priority',
    retraits: true,
    api: false,
    maxUsers: 1,
    maxAIMessages: Infinity
  },
  business: {
    maxInvoices: Infinity,
    maxContracts: Infinity,
    payments: 'unlimited',
    ai: 'full',
    support: 'dedicated',
    retraits: true,
    api: true,
    maxUsers: 5,
    maxAIMessages: Infinity
  }
};

export function getUserPlan(user) {
  return user?.subscription?.plan || 'free';
}

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export async function canCreateInvoice(user, currentCount) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  if (currentCount >= limits.maxInvoices) {
    return { allowed: false, message: `Limite de ${limits.maxInvoices} factures atteinte. Passez au plan Pro.`, upgradeTo: 'pro' };
  }
  return { allowed: true };
}

export async function canCreateContract(user, currentCount) {
  const plan = getUserPlan(user);
  const limits = getPlanLimits(plan);
  if (currentCount >= limits.maxContracts) {
    return { allowed: false, message: `Limite de ${limits.maxContracts} contrats atteinte. Passez au plan Pro.`, upgradeTo: 'pro' };
  }
  return { allowed: true };
}

export function canWithdraw(user) {
  const limits = getPlanLimits(getUserPlan(user));
  return { allowed: limits.retraits, message: limits.retraits ? '' : 'Retraits réservés aux plans Pro et Business.', upgradeTo: 'pro' };
}

export function canUseApi(user) {
  const limits = getPlanLimits(getUserPlan(user));
  return { allowed: limits.api, message: limits.api ? '' : 'API réservée au plan Business.', upgradeTo: 'business' };
}

export function canUseFullAI(user) {
  const limits = getPlanLimits(getUserPlan(user));
  return {
    allowed: true, // L'IA est accessible à tous, mais limitée en nombre de messages pour le plan gratuit
    level: limits.ai,
    maxMessages: limits.maxAIMessages,
    message: limits.ai === 'basic' ? 'IA basique (10 messages/mois). Passez en Pro pour illimité.' : '',
    upgradeTo: 'pro'
  };
}

export function canUseUnlimitedPayments(user) {
  const limits = getPlanLimits(getUserPlan(user));
  return { allowed: limits.payments === 'unlimited', message: limits.payments === 'limited' ? 'Paiements limités sur le plan Gratuit.' : '', upgradeTo: 'pro' };
}

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
    aiMaxMessages: limits.maxAIMessages,
    paymentsType: limits.payments,
    supportType: limits.support,
    maxUsers: limits.maxUsers
  };
}