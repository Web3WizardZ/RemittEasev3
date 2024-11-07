import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowRight, Wallet, Send, User, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const RemittEaseApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [walletInfo, setWalletInfo] = useState(null);
  
  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' }
  ];

  const handleCreateWallet = async () => {
    // Simulated wallet creation
    setWalletInfo({
      address: '0x1234...5678',
      balance: '0.00',
      seed: 'word1 word2 word3 ... word12'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/api/placeholder/200/60"
            alt="RemittEase Logo"
            className="h-12"
          />
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Global Money Transfer Simplified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="new-user" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="new-user">New User</TabsTrigger>
                <TabsTrigger value="existing-user">Existing User</TabsTrigger>
              </TabsList>

              <TabsContent value="new-user">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Currency</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span>{currency.flag} {currency.name} ({currency.code})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleCreateWallet}
                    className="w-full"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Create Wallet
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="existing-user">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Wallet Address</label>
                    <Input placeholder="Enter your wallet address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key (Seed)</label>
                    <Input type="password" placeholder="Enter your secret key" />
                  </div>
                  <Button className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Access Wallet
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {walletInfo && (
              <div className="mt-8 space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Store your secret key securely! It cannot be recovered if lost.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Wallet Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Wallet Address</label>
                      <code className="block p-3 bg-gray-50 rounded-lg">{walletInfo.address}</code>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Balance</label>
                      <div className="text-2xl font-bold">{walletInfo.balance}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secret Key (Seed)</label>
                      <code className="block p-3 bg-gray-50 rounded-lg break-all">
                        {walletInfo.seed}
                      </code>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button className="flex-1">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Deposit Funds
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Send Money
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemittEaseApp;
