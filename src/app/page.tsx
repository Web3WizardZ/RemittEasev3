'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowRight, Wallet, Send, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createWallet, accessWallet, getWalletBalance } from "@/lib/wallet";
import { useToast } from "@/components/ui/use-toast";

// Types
interface WalletInfo {
  address: string;
  balance: string;
  seed: string;
}

interface Currency {
  code: string;
  name: string;
  flag: string;
  rate?: number;
}

// Form Schemas
const newUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currency: z.string().min(1, 'Please select a currency'),
});

const existingUserSchema = z.object({
  walletAddress: z.string().min(42, 'Invalid wallet address'),
  secretKey: z.string().min(12, 'Invalid secret key'),
});

type NewUserForm = z.infer<typeof newUserSchema>;
type ExistingUserForm = z.infer<typeof existingUserSchema>;

export default function RemittEaseApp() {
  const router = useRouter();
  const { toast } = useToast();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.5 },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1550 },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 130 },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 12.5 }
  ];

  const newUserForm = useForm<NewUserForm>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      currency: '',
    },
  });

  const existingUserForm = useForm<ExistingUserForm>({
    resolver: zodResolver(existingUserSchema),
    defaultValues: {
      walletAddress: '',
      secretKey: '',
    },
  });

  const handleCreateWallet = async (data: NewUserForm) => {
    try {
      setIsLoading(true);
      
      // Create new wallet
      const wallet = await createWallet();
      
      // Save user data to backend
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          currency: data.currency,
          walletAddress: wallet.address,
          walletSeed: wallet.mnemonic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      setWalletInfo({
        address: wallet.address,
        balance: '0.00',
        seed: wallet.mnemonic,
      });

      toast({
        title: "Success",
        description: "Your wallet has been created successfully!",
      });

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create wallet',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessWallet = async (data: ExistingUserForm) => {
    try {
      setIsLoading(true);
      
      // Access wallet
      const wallet = await accessWallet(data.secretKey);
      
      // Verify wallet address matches
      if (wallet.address.toLowerCase() !== data.walletAddress.toLowerCase()) {
        throw new Error('Invalid wallet credentials');
      }

      // Get wallet balance
      const balance = await getWalletBalance(wallet.address);
      
      setWalletInfo({
        address: wallet.address,
        balance,
        seed: data.secretKey,
      });

      toast({
        title: "Success",
        description: "Wallet accessed successfully!",
      });

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to access wallet',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
  <img 
    src="/remittease-logo.png"
    alt="RemittEase"
    className="h-16 w-auto"
    priority
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
                <Form {...newUserForm}>
                  <form onSubmit={newUserForm.handleSubmit(handleCreateWallet)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={newUserForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={newUserForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={newUserForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map(currency => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  <span>{currency.flag} {currency.name} ({currency.code})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="existing-user">
                <Form {...existingUserForm}>
                  <form onSubmit={existingUserForm.handleSubmit(handleAccessWallet)} className="space-y-6">
                    <FormField
                      control={existingUserForm.control}
                      name="walletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wallet Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your wallet address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={existingUserForm.control}
                      name="secretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret Key (Seed)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your secret key" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {isLoading ? 'Accessing Wallet...' : 'Access Wallet'}
                    </Button>
                  </form>
                </Form>
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
                      <Button 
                        className="flex-1"
                        onClick={() => router.push('/deposit')}
                        disabled={isLoading}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Deposit Funds
                      </Button>
                      <Button 
                        className="flex-1"
                        variant="outline"
                        onClick={() => router.push('/send')}
                        disabled={isLoading}
                      >
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
}