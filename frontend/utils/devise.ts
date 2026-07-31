export const DEVISES: Record<string, { code: string; symbole: string }> = {
  'Sénégal': { code: 'XOF', symbole: 'FCFA' },
  'Côte d\'Ivoire': { code: 'XOF', symbole: 'FCFA' },
  'Mali': { code: 'XOF', symbole: 'FCFA' },
  'Burkina Faso': { code: 'XOF', symbole: 'FCFA' },
  'Niger': { code: 'XOF', symbole: 'FCFA' },
  'Bénin': { code: 'XOF', symbole: 'FCFA' },
  'Togo': { code: 'XOF', symbole: 'FCFA' },
  'Guinée-Bissau': { code: 'XOF', symbole: 'FCFA' },
  'Guinée': { code: 'GNF', symbole: 'GNF' },
  'Mauritanie': { code: 'MRU', symbole: 'MRU' },
  'Cameroun': { code: 'XAF', symbole: 'FCFA' },
  'Congo': { code: 'XAF', symbole: 'FCFA' },
  'Gabon': { code: 'XAF', symbole: 'FCFA' },
  'Tchad': { code: 'XAF', symbole: 'FCFA' },
  'Centrafrique': { code: 'XAF', symbole: 'FCFA' },
  'Maroc': { code: 'MAD', symbole: 'DH' },
  'Tunisie': { code: 'TND', symbole: 'DT' },
  'Algérie': { code: 'DZD', symbole: 'DA' },
  'France': { code: 'EUR', symbole: '€' },
  'Belgique': { code: 'EUR', symbole: '€' },
  'Suisse': { code: 'CHF', symbole: 'CHF' },
  'Autre': { code: 'USD', symbole: '$' },
};

export const getDevise = (pays: string) => {
  return DEVISES[pays] || DEVISES['Sénégal'];
};

export const formaterMontant = (montant: number, pays: string) => {
  const devise = getDevise(pays);
  if (devise.code === 'EUR') {
    return `${montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
  }
  return `${montant.toLocaleString()} ${devise.symbole}`;
};

export const calculerPoints = (montant: number, pays: string) => {
  const devise = getDevise(pays);
  if (devise.code === 'EUR') return Math.floor(montant * 10);
  if (devise.code === 'MAD') return Math.floor(montant);
  return Math.floor(montant / 100);
};