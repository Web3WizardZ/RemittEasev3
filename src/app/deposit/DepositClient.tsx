'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Wallet, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface MoonPayConfig {
  flow: string;
  environment: string;
  variant: string;
  params: {
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
  };
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

const DepositClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [moonPayInitialized, setMoonPayInitialized] = useState(false);

  useEffect(() => {
    fetchUserWallet();
    initializeMoonPay();
  }, []);

  const fetchUserWallet = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
      });
      const data = await response.json();
      
      if (data.success && data.session?.walletAddress) {
        setWalletAddress(data.session.walletAddress);
      } else {
        setError('Unable to fetch wallet address. Please try again.');
      }
    } catch (err) {
      setError('Failed to load wallet information');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeMoonPay = async () => {
    try {
      // Check if script is already loaded
      if (document.querySelector('script[src*="moonpay-web-sdk"]')) {
        setMoonPayInitialized(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js';
      script.async = true;
      
      script.onload = () => {
        setMoonPayInitialized(true);
      };

      script.onerror = () => {
        setError('Failed to load payment system. Please refresh and try again.');
      };
      
      document.body.appendChild(script);
    } catch (err) {
      setError('Failed to initialize payment system');
      console.error('MoonPay initialization error:', err);
    }
  };

  const handleDeposit = async () => {
    if (!window.MoonPayWebSdk || !moonPayInitialized) {
      setError('Payment system not initialized. Please refresh and try again.');
      return;
    }

    try {
      const config: MoonPayConfig = {
        flow: "buy",
        environment: process.env.NEXT_PUBLIC_MOONPAY_ENV || "sandbox",
        variant: "overlay",
        params: {
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_PUBLIC_KEY || '',
          walletAddress: walletAddress,
          baseCurrencyCode: "usd",
          defaultCurrencyCode: "eth",
          showWalletAddressForm: false,
          colorCode: "#2563eb", // RemittEase blue
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
      setError('Failed to initialize deposit. Please try again.');
      console.error('MoonPay widget error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
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
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
              disabled={!moonPayInitialized || !walletAddress}
            >
              Deposit Now with MoonPay
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