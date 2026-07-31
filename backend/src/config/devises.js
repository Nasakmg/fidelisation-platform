const DEVISES = {
  // Afrique de l'Ouest (UEMOA)
  'Sénégal': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Côte d\'Ivoire': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Mali': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Burkina Faso': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Niger': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Bénin': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Togo': { code: 'XOF', symbole: 'FCFA', taux: 1 },
  'Guinée-Bissau': { code: 'XOF', symbole: 'FCFA', taux: 1 },

  // Afrique Centrale (CEMAC)
  'Cameroun': { code: 'XAF', symbole: 'FCFA', taux: 1 },
  'Congo': { code: 'XAF', symbole: 'FCFA', taux: 1 },
  'Gabon': { code: 'XAF', symbole: 'FCFA', taux: 1 },
  'Tchad': { code: 'XAF', symbole: 'FCFA', taux: 1 },
  'Centrafrique': { code: 'XAF', symbole: 'FCFA', taux: 1 },

  // Autres pays africains
  'Maroc': { code: 'MAD', symbole: 'DH', taux: 1 },
  'Tunisie': { code: 'TND', symbole: 'DT', taux: 1 },
  'Algérie': { code: 'DZD', symbole: 'DA', taux: 1 },
  'Guinée': { code: 'GNF', symbole: 'GNF', taux: 1 },
  'Mauritanie': { code: 'MRU', symbole: 'MRU', taux: 1 },

  // Europe
  'France': { code: 'EUR', symbole: '€', taux: 1 },
  'Belgique': { code: 'EUR', symbole: '€', taux: 1 },
  'Suisse': { code: 'CHF', symbole: 'CHF', taux: 1 },

  // Par défaut
  'Autre': { code: 'USD', symbole: '$', taux: 1 },
};

const getDevise = (pays) => {
  return DEVISES[pays] || DEVISES['Sénégal'];
};

module.exports = { DEVISES, getDevise };