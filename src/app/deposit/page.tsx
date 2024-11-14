'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, DollarSign, ExternalLink } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// MoonPay test API key - replace with your production key in .env
const MOONPAY_API_KEY = 'pk_test_8v5c0U65vmujfNeSrA1b3hQSgTd9iE2'; // Replace with your API key
const MOONPAY_BASE_URL = 'https://dashboard.moonpay.com/v2/transactions'; // Use https://buy.moonpay.com for production

interface UserWallet {
  address: string;
  currency: string;
}

export default function DepositPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user wallet info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { walletAddress } = JSON.parse(userInfo);
      setUserWallet({
        address: walletAddress,
        currency: 'ETH' // or get from user preferences
      });
    }
    setIsLoading(false);
  }, []);

  const generateMoonPayUrl = (walletAddress: string) => {
    const baseUrl = MOONPAY_BASE_URL;
    const params = new URLSearchParams({
      apiKey: MOONPAY_API_KEY,
      currencyCode: 'eth', // or specify the currency you want to support
      walletAddress: walletAddress,
      colorCode: '#4F46E5', // RemittEase theme color
      showWalletAddressForm: 'false',
      redirectURL: window.location.origin + '/dashboard'
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleMoonPayDeposit = () => {
    if (!userWallet?.address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet address not found. Please try again.",
      });
      return;
    }

    const moonPayUrl = generateMoonPayUrl(userWallet.address);
    window.open(moonPayUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No wallet found. Please create or import a wallet first.
              </AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add funds to your wallet using credit card or bank transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Your Wallet Address</div>
              <code className="block p-3 bg-white rounded-lg break-all">
                {userWallet.address}
              </code>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit/Debit Card</CardTitle>
                <CardDescription>
                  Instant deposit using MoonPay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h4 className="font-medium">Features:</h4>
                      <ul className="text-sm text-gray-600 list-disc pl-4 mt-2 space-y-1">
                        <li>Instant processing</li>
                        <li>Multiple payment methods</li>
                        <li>Secure transactions</li>
                        <li>24/7 support</li>
                      </ul>
                    </div>
                    <img 
                      src="/moonpay-logo.svg" 
                      alt="MoonPay" 
                      className="h-8 w-auto"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleMoonPayDeposit}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Deposit with Card
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Powered by MoonPay - Secure Payment Processing
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Deposits typically appear in your wallet within minutes after payment confirmation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}