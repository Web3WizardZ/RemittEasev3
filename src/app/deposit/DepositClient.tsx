'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

// MoonPay Types
type Environment = 'sandbox' | 'production';
type Variant = 'overlay' | 'hosted';
type SupportedCurrency = 'eth' | 'usdt' | 'usdc';

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

// Constants
const MOONPAY_SCRIPT_URL = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js';
const SCRIPT_LOAD_TIMEOUT = 15000; // 15 seconds
const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['eth', 'usdt', 'usdc'];
const DEFAULT_AMOUNT = '100';

interface UserSession {
  walletAddress: string;
  name: string;
  email: string;
  currency: string;
}

interface SessionResponse {
  success: boolean;
  session?: UserSession;
  error?: string;
}

const DepositClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [moonPayInitialized, setMoonPayInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const loadMoonPayScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
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
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SessionResponse = await response.json();
      
      if (!data.success || !data.session) {
        throw new Error(data.error || 'No session found');
      }
      
      setWalletAddress(data.session.walletAddress);
    } catch (err) {
      console.error('Wallet fetch error:', err);
      if (err instanceof Error && (
        err.message.includes('401') || 
        err.message.includes('No session found')
      )) {
        router.push('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load wallet information');
      throw err;
    }
  };

  const initializeMoonPay = async () => {
    try {
      setIsRetrying(true);
      await Promise.all([loadMoonPayScript(), fetchUserWallet()]);
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
    return () => {
      setShowWidget(false);
    };
  }, []);

  const handleDeposit = async () => {
    if (!window.MoonPayWebSdk || !moonPayInitialized) {
      setError('Payment system not initialized. Please try again.');
      return;
    }

    try {
      setShowWidget(true);
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
          showOnlyCurrencies: [...SUPPORTED_CURRENCIES], // Create mutable copy
          currencyCode: "eth",
          baseCurrencyAmount: DEFAULT_AMOUNT,
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
      setShowWidget(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    setShowWidget(false);
    initializeMoonPay();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <RefreshCw className={`w-8 h-8 ${isRetrying ? 'animate-spin' : ''} text-blue-600`} />
        <p className="text-sm text-muted-foreground">
          {isRetrying ? 'Retrying initialization...' : 'Loading your deposit page...'}
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
                {isRetrying ? 'Retrying...' : 'Retry'}
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
              disabled={!moonPayInitialized || !walletAddress || isRetrying || showWidget}
            >
              {isRetrying ? (
                'Initializing...'
              ) : showWidget ? (
                'Widget Open'
              ) : (
                <>
                  <span>Deposit Now with MoonPay</span>
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
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
                <h4 className="font-medium">Supported Currencies</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Ethereum (ETH)</li>
                  <li>USD Tether (USDT)</li>
                  <li>USD Coin (USDC)</li>
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

              <div className="space-y-2">
                <h4 className="font-medium">Security</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Regulated service</li>
                  <li>ID verification</li>
                  <li>Fraud protection</li>
                  <li>Secure transactions</li>
                </ul>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Powered by MoonPay - Secure and regulated payment processing</p>
              <p>Minimum deposit: $30 USD equivalent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositClient;