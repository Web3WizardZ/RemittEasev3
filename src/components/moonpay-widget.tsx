'use client';

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DollarSign } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    MoonPayWebSdk: {
      init: (config: any) => {
        show: () => void;
      };
    };
  }
}

interface MoonPayWidgetProps {
  walletAddress: string;
}

export function MoonPayWidget({ walletAddress }: MoonPayWidgetProps): JSX.Element {
  const { toast } = useToast();

  useEffect(() => {
    // Load MoonPay SDK Script
    const script = document.createElement('script');
    script.src = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js';
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleDeposit = () => {
    if (!window.MoonPayWebSdk) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment system is loading. Please try again in a moment.",
      });
      return;
    }

    const moonpaySdk = window.MoonPayWebSdk.init({
      flow: "buy",
      environment: "sandbox",
      variant: "overlay",
      params: {
        apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "pk_test_123",
        baseCurrencyCode: "usd",
        defaultCurrencyCode: "eth",
        walletAddress: walletAddress,
        colorCode: "#000000", // Updated to pure black
        theme: {
          palette: {
            primary: '#000000', // Pure black
            secondary: '#4B4B4B', // Dark gray
            textPrimary: '#000000',
            textSecondary: '#4B4B4B',
            divider: '#E5E5E5',
            background: {
              default: '#FFFFFF',
              paper: '#F5F5F5',
            },
          },
          shape: {
            borderRadius: 4,
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
        showWalletAddressForm: false,
        redirectURL: window.location.origin + '/dashboard'
      }
    });

    moonpaySdk.show();
  };

  return (
    <Button 
      onClick={handleDeposit}
      className="w-full bg-black hover:bg-primary-hover text-white shadow-sharp hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
    >
      <DollarSign className="w-4 h-4 mr-2" />
      Deposit with Card
    </Button>
  );
}