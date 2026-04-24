const FEEXPAY_API_KEY = import.meta.env.VITE_FEEXPAY_TOKEN;
const FEEXPAY_SHOP_ID = import.meta.env.VITE_FEEXPAY_SHOP_ID;
const FEEXPAY_PAYOUT_URL = 'https://api.feexpay.me/api/payouts/public';
const FEEXPAY_STATUS_URL = 'https://api.feexpay.me/api/payouts/status/public';

const PAYOUT_CONFIG = {
  bj: {
    name: 'Bénin',
    networks: {
      mtn: { url: `${FEEXPAY_PAYOUT_URL}/transfer/global`, prefix: '229', prefixes: ['01','61','62','63','64','65','66','67','68','69'], network: 'MTN', minAmount: 50 },
      moov: { url: `${FEEXPAY_PAYOUT_URL}/transfer/global`, prefix: '229', prefixes: ['51','52','53','54','55','56','57','58','59'], network: 'MOOV', minAmount: 50 },
      celtiis: { url: `${FEEXPAY_PAYOUT_URL}/celtiis_bj`, prefix: '229', prefixes: ['41','42','43','44','45','46','47','48','49'], network: 'CELTIIS BJ', minAmount: 50 }
    }
  },
  ci: {
    name: 'Côte d\'Ivoire',
    networks: {
      mtn: { url: `${FEEXPAY_PAYOUT_URL}/mtn_ci`, prefix: '225', prefixes: ['05','06','07'], network: 'MTN CI', minAmount: 100 },
      orange: { url: `${FEEXPAY_PAYOUT_URL}/mtn_ci`, prefix: '225', prefixes: ['07','08','09'], network: 'ORANGE CI', minAmount: 100 },
      moov: { url: `${FEEXPAY_PAYOUT_URL}/mtn_ci`, prefix: '225', prefixes: ['01','02','03'], network: 'MOOV CI', minAmount: 100 },
      wave: { url: `${FEEXPAY_PAYOUT_URL}/mtn_ci`, prefix: '225', prefixes: ['04'], network: 'WAVE CI', minAmount: 100 }
    }
  },
  tg: {
    name: 'Togo',
    networks: {
      togocom: { url: `${FEEXPAY_PAYOUT_URL}/togo`, prefix: '228', prefixes: ['90','91','92','93','70'], network: 'TOGOCOM TG', minAmount: 100 },
      moov: { url: `${FEEXPAY_PAYOUT_URL}/togo`, prefix: '228', prefixes: ['96','97','98','99'], network: 'MOOV TG', minAmount: 100 }
    }
  },
  sn: {
    name: 'Sénégal',
    networks: {
      orange: { url: `${FEEXPAY_PAYOUT_URL}/orange_sn`, prefix: '221', prefixes: ['77','78'], network: 'ORANGE SN', minAmount: 100 },
      free: { url: `${FEEXPAY_PAYOUT_URL}/orange_sn`, prefix: '221', prefixes: ['76'], network: 'FREE SN', minAmount: 100 }
    }
  },
  cg: {
    name: 'Congo',
    networks: {
      mtn: { url: `${FEEXPAY_PAYOUT_URL}/mtn_cg`, prefix: '242', prefixes: ['06','05','04'], network: 'MTN CG', minAmount: 100 }
    }
  }
};

/**
 * Effectuer un payout vers un numéro Mobile Money
 */
export async function processPayout({ phoneNumber, amount, network, country, motif, email }) {
  if (!FEEXPAY_API_KEY) {
    return { success: false, error: 'Clé API FeexPay non configurée' };
  }

  const config = PAYOUT_CONFIG[country];
  if (!config) {
    return { success: false, error: `Pays "${country}" non supporté` };
  }

  // Trouver la config réseau
  let netConfig;
  const netKey = network?.toLowerCase().replace(/\s/g, '');
  if (config.networks) {
    netConfig = config.networks[netKey] || Object.values(config.networks)[0];
  }

  if (!netConfig) {
    return { success: false, error: `Réseau "${network}" non trouvé pour ${config.name}` };
  }

  const body = {
    shop: FEEXPAY_SHOP_ID,
    amount: Math.round(amount),
    phoneNumber: String(phoneNumber),
    motif: motif || 'Retrait Facture App'
  };

  // Ajouter network pour les pays qui le requièrent
  if (netConfig.network && ['bj', 'tg', 'cg'].includes(country)) {
    body.network = netConfig.network;
  }

  if (email) {
    body.email = email;
  }

  try {
    console.log('📤 Payout FeexPay:', { url: netConfig.url, body });
    
    const response = await fetch(netConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FEEXPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('📥 Réponse FeexPay:', data);

    if (!response.ok) {
      return { success: false, error: data.message || 'Erreur payout', data };
    }

    return {
      success: true,
      reference: data.reference,
      status: data.status,
      data
    };
  } catch (error) {
    console.error('Erreur payout FeexPay:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier le statut d'un payout
 */
export async function checkPayoutStatus(reference) {
  try {
    const response = await fetch(`${FEEXPAY_STATUS_URL}/${reference}`, {
      headers: { 'Authorization': `Bearer ${FEEXPAY_API_KEY}` }
    });
    const data = await response.json();
    return {
      success: true,
      reference: data.reference,
      status: data.status,
      reseau: data.reseau,
      amount: data.amount,
      description: data.description,
      date: data.date
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Déterminer le pays et le réseau à partir d'un numéro de téléphone
 */
export function detectCountryAndNetwork(phoneNumber) {
  const phone = String(phoneNumber).replace(/[^0-9]/g, '');
  
  // Bénin (229)
  if (phone.startsWith('229')) {
    const prefix = phone.substring(3, 5);
    // MTN BJ
    if (['01','61','62','63','64','65','66','67','68','69'].includes(prefix)) {
      return { country: 'bj', network: 'MTN', code: 'mtn' };
    }
    // MOOV BJ
    if (['51','52','53','54','55','56','57','58','59'].includes(prefix)) {
      return { country: 'bj', network: 'MOOV', code: 'moov' };
    }
    // CELTIIS BJ
    if (['41','42','43','44','45','46','47','48','49'].includes(prefix)) {
      return { country: 'bj', network: 'CELTIIS BJ', code: 'celtiis' };
    }
    return { country: 'bj', network: 'MTN', code: 'mtn' };
  }
  
  // Côte d'Ivoire (225)
  if (phone.startsWith('225')) {
    const prefix = phone.substring(3, 5);
    if (['05','06','07'].includes(prefix)) return { country: 'ci', network: 'MTN CI', code: 'mtn' };
    if (['07','08','09'].includes(prefix)) return { country: 'ci', network: 'ORANGE CI', code: 'orange' };
    if (['01','02','03'].includes(prefix)) return { country: 'ci', network: 'MOOV CI', code: 'moov' };
    if (['04'].includes(prefix)) return { country: 'ci', network: 'WAVE CI', code: 'wave' };
    return { country: 'ci', network: 'MTN CI', code: 'mtn' };
  }
  
  // Togo (228)
  if (phone.startsWith('228')) {
    const prefix = phone.substring(3, 5);
    if (['90','91','92','93','70'].includes(prefix)) return { country: 'tg', network: 'TOGOCOM TG', code: 'togocom' };
    if (['96','97','98','99'].includes(prefix)) return { country: 'tg', network: 'MOOV TG', code: 'moov' };
    return { country: 'tg', network: 'TOGOCOM TG', code: 'togocom' };
  }
  
  // Sénégal (221)
  if (phone.startsWith('221')) {
    const prefix = phone.substring(3, 5);
    if (['77','78'].includes(prefix)) return { country: 'sn', network: 'ORANGE SN', code: 'orange' };
    if (['76'].includes(prefix)) return { country: 'sn', network: 'FREE SN', code: 'free' };
    return { country: 'sn', network: 'ORANGE SN', code: 'orange' };
  }
  
  // Congo (242)
  if (phone.startsWith('242')) {
    return { country: 'cg', network: 'MTN CG', code: 'mtn' };
  }
  
  // Par défaut : Bénin MTN
  return { country: 'bj', network: 'MTN', code: 'mtn' };
}

/**
 * Obtenir la liste des réseaux disponibles par pays
 */
export function getNetworksByCountry(country) {
  const config = PAYOUT_CONFIG[country];
  if (!config?.networks) return [];
  return Object.entries(config.networks).map(([code, net]) => ({
    code,
    name: net.network || code.toUpperCase(),
    prefix: net.prefix,
    prefixes: net.prefixes,
    minAmount: net.minAmount
  }));
}

/**
 * Obtenir le nom d'un pays à partir de son code
 */
export function getCountryName(code) {
  const names = { bj: 'Bénin', ci: 'Côte d\'Ivoire', tg: 'Togo', sn: 'Sénégal', cg: 'Congo' };
  return names[code] || code;
}

export default {
  processPayout,
  checkPayoutStatus,
  detectCountryAndNetwork,
  getNetworksByCountry,
  getCountryName,
  PAYOUT_CONFIG
};