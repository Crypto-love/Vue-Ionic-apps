/**
 * just two symbol for now, performance reason
 * @param currency string
 * @returns string
 */
export const getCurrencySymbol = (currency: string): string => {
  return currency === 'SGD' ? 'S$' : 'RM';
};
