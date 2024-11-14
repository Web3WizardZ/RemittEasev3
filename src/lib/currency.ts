// src/lib/currency.ts
import { cache } from 'react';

interface ExchangeRates {
  [key: string]: number;
}

// Cache the fetch call for exchange rates
export const getExchangeRates = cache(async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/ETH'
    );
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
});

export const convertCurrency = async (
  amount: string,
  targetCurrency: string
): Promise<string> => {
  try {
    const rates = await getExchangeRates();
    const rate = rates[targetCurrency] || 1;
    const convertedAmount = parseFloat(amount) * rate;
    return convertedAmount.toFixed(2);
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    ETH: 'Ξ',
    // Add more currencies as needed
  };
  return symbols[currency] || currency;
};