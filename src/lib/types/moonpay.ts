export type Environment = 'sandbox' | 'production';
export type Variant = 'overlay' | 'hosted';
export type SupportedCurrency = 'eth' | 'usdt' | 'usdc';

export interface MoonPayParams {
  apiKey: string;
  walletAddress?: string;
  baseCurrencyCode?: string;
  defaultCurrencyCode?: string;
  baseCurrencyAmount?: string;
  showWalletAddressForm?: boolean;
  colorCode?: string;
  redirectUrl?: string;
  showOnlyCurrencies?: string[];
  currencyCode?: string;
  lockCurrencyCode?: boolean;
  theme?: string;
  language?: string;
  showAllCurrencies?: boolean;
  enableRecurringBuy?: boolean;
  defaultCountryCode?: string;
}

export interface MoonPayConfig {
  flow: 'buy';
  environment: Environment;
  variant: Variant;
  params: MoonPayParams;
}

export interface MoonPaySDK {
  init: (config: MoonPayConfig) => {
    show: () => void;
  };
}