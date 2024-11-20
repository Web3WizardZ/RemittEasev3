'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Wallet, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

// MoonPay Types
type Environment = 'sandbox' | 'production';
type Variant = 'overlay' | 'hosted';

interface MoonPayParams {
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

interface MoonPayConfig {
  flow: 'buy';
  environment: Environment;
  variant: Variant;
  params: MoonPayParams;
}

interface MoonPaySDK {
  init: (config: MoonPayConfig) => {
    show: () => void;
  };
}

declare global {
  interface Window {
    MoonPayWebSdk: MoonPaySDK;
  }
}

const MOONPAY_SCRIPT_URL = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js';
const SCRIPT_LOAD_TIMEOUT = 15000; // 15 seconds timeout

const DepositClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [moonPayInitialized, setMoonPayInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadMoonPayScript = () => {
    return new Promise<void>((resolve, reject) => {
      // If script is already loaded
      if (document.querySelector(`script[src="${MOONPAY_SCRIPT_URL}"]`)) {
        setMoonPayInitialized(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = MOONPAY_SCRIPT_URL;
      script.async = true;

      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('MoonPay script load timeout'));
      }, SCRIPT_LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeoutId);
        setMoonPayInitialized(true);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load MoonPay script'));
      };

      document.body.appendChild(script);
    });
  };

  const fetchUserWallet = async () => {
    try {
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.session?.walletAddress) {
        setWalletAddress(data.session.walletAddress);
      } else {
        throw new Error('No wallet address found in session');
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet information');
      throw err;
    }
  };

  const initializeMoonPay = async () => {
    try {
      setIsRetrying(true);
      await loadMoonPayScript();
      await fetchUserWallet();
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment system');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    initializeMoonPay();
  }, []);

  const handleDeposit = async () => {
    if (!window.MoonPayWebSdk || !moonPayInitialized) {
      setError('Payment system not initialized. Please try again.');
      return;
    }

    try {
      const config: MoonPayConfig = {
        flow: "buy",
        environment: (process.env.NEXT_PUBLIC_MOONPAY_ENV as Environment) || "sandbox",
        variant: "overlay",
        params: {
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_PUBLIC_KEY || '',
          walletAddress: walletAddress,
          baseCurrencyCode: "usd",
          defaultCurrencyCode: "eth",
          showWalletAddressForm: false,
          colorCode: "#2563eb",
          redirectUrl: `${window.location.origin}/dashboard`,
          showOnlyCurrencies: ['eth', 'usdt', 'usdc'],
          currencyCode: "eth",
          baseCurrencyAmount: "100",
          lockCurrencyCode: false,
          theme: "light",
          language: "en"
        }
      };

      const moonpaySdk = window.MoonPayWebSdk.init(config);
      moonpaySdk.show();
    } catch (err) {
      console.error('MoonPay widget error:', err);
      setError('Failed to initialize deposit. Please try again.');
    }
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    initializeMoonPay();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <RefreshCw className={`w-8 h-8 ${isRetrying ? 'animate-spin' : ''} text-blue-600`} />
        <p className="text-sm text-muted-foreground">
          {isRetrying ? 'Retrying initialization...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit Funds
          </CardTitle>
          <CardDescription>
            Instantly deposit funds to your RemittEase wallet using credit card, debit card, or bank transfer
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isRetrying}
              >
                Retry
              </Button>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Your Wallet Address</p>
            <code className="text-xs break-all">{walletAddress}</code>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleDeposit}
              className="w-full"
              size="lg"
              disabled={!moonPayInitialized || !walletAddress || isRetrying}
            >
              {isRetrying ? 'Initializing...' : 'Deposit Now with MoonPay'}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Supported Payment Methods</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Credit & Debit Cards</li>
                  <li>Bank Transfers (SEPA/ACH)</li>
                  <li>Apple Pay</li>
                  <li>Google Pay</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Key Features</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Instant deposits</li>
                  <li>Multiple currencies</li>
                  <li>Secure processing</li>
                  <li>24/7 support</li>
                </ul>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Powered by MoonPay - Secure and regulated payment processing
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositClient;