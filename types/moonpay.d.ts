declare interface MoonPayParams {
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
  }
  
  declare interface MoonPayConfig {
    flow: 'buy';
    environment: 'sandbox' | 'production';
    variant: 'overlay' | 'hosted';
    params: MoonPayParams;
  }
  
  declare interface MoonPaySDK {
    init: (config: MoonPayConfig) => {
      show: () => void;
    };
  }
  
  declare global {
    interface Window {
      MoonPayWebSdk: MoonPaySDK;
    }
  }
  
  export type { MoonPayConfig, MoonPayParams, MoonPaySDK };