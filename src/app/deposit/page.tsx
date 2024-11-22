'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import type { Environment, MoonPayConfig, MoonPaySDK, SupportedCurrency } from '@/lib/types/moonpay';

// Declare global window type
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

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [moonPayInitialized, setMoonPayInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [networkError, setNetworkError] = useState(false);

  const loadMoonPayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${MOONPAY_SCRIPT_URL}"]`)) {
        setMoonPayInitialized(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = MOONPAY_SCRIPT_URL;
      script.async = true;
      
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
      const response = await fetch('/api/auth/login', {
        method: 'GET',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.session) {
        throw new Error(data.error || 'No session found');
      }
      
      setWalletAddress(data.session.walletAddress);

      try {
        // Mock balance for now
        setBalance('1.5');
        setNetworkError(false);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setNetworkError(true);
      }
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
        environment: "sandbox",  // Explicitly set to sandbox for testing
        variant: "overlay",
        params: {
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_PUBLIC_KEY || '',
          baseCurrencyCode: "usd",
          baseCurrencyAmount: "30",
          defaultCurrencyCode: "eth",
          walletAddress: walletAddress,
          showWalletAddressForm: false
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

      {networkError && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-600">
            Network connection issue. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

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

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm font-medium">Your Wallet Address</p>
              <code className="text-xs break-all">{walletAddress}</code>
            </div>
            
            <div>
              <p className="text-sm font-medium">Current Balance</p>
              <p className="text-lg font-bold">
                {networkError ? (
                  <span className="text-muted-foreground">Unable to fetch balance</span>
                ) : (
                  `${balance} ETH`
                )}
              </p>
            </div>
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
              <p>Minimum deposit: R500 ZAR equivalent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}