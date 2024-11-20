'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Background } from '@/components/ui/background';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  ArrowRight, 
  Wallet, 
  Send, 
  DollarSign,
  Copy,
  Download,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  User,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth-context';
import { loginWithWallet } from '@/lib/wallet';

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
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  currency: z.string().min(1, 'Please select a currency'),
});

const existingUserSchema = z.object({
  walletAddress: z.string()
    .min(42, 'Invalid wallet address')
    .max(42, 'Invalid wallet address'),
  secretKey: z.string()
    .min(12, 'Invalid secret key'),
});

type NewUserForm = z.infer<typeof newUserSchema>;
type ExistingUserForm = z.infer<typeof existingUserSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [hasCopiedSeed, setHasCopiedSeed] = useState(false);
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);
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

  const handleCopyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description,
        duration: 2000,
      });
      if (text === walletInfo?.seed) {
        setHasCopiedSeed(true);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const handleBackupDownload = () => {
    if (!walletInfo) return;

    const backupData = {
      walletAddress: walletInfo.address,
      seed: walletInfo.seed,
      createdAt: new Date().toISOString(),
      network: 'Ethereum',
      platform: 'RemittEase',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remittease-wallet-${walletInfo.address.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasDownloadedBackup(true);
    toast({
      title: "Backup Created",
      description: "Wallet backup has been downloaded. Store it securely!",
    });
  };

  const handleCreateWallet = async (data: NewUserForm) => {
    try {
      setIsLoading(true);
      setHasCopiedSeed(false);
      setHasDownloadedBackup(false);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          currency: data.currency,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create wallet');
      }
      
      setWalletInfo({
        address: result.wallet.address,
        balance: result.wallet.balance,
        seed: result.wallet.seed,
      });

      toast({
        title: "Wallet Created Successfully",
        description: "Please save your backup information securely!",
        duration: 5000,
      });

      // Smoothly scroll to the wallet info section
      const walletInfoSection = document.getElementById('wallet-info');
      if (walletInfoSection) {
        walletInfoSection.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (err) {
      console.error('Wallet creation error:', err);
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
      
      const result = await loginWithWallet(data.walletAddress, data.secretKey);

      if (!result.success || !result.user || !result.wallet) {
        throw new Error(result.error || 'Failed to access wallet');
      }

      setWalletInfo({
        address: result.wallet.address,
        balance: result.wallet.balance,
        seed: data.secretKey,
      });

      login({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        walletAddress: result.wallet.address,
      });

      toast({
        title: "Welcome Back!",
        description: "Logged in successfully.",
      });

      // Animated transition to dashboard
      const transitionOut = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation
        router.push('/dashboard');
      };

      transitionOut();

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

  return (<div className="min-h-screen bg-white relative overflow-hidden">
    <Background />
    
    {/* Decorative elements */}
    <div className="absolute top-40 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
    <div className="absolute bottom-20 -right-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl" />
    
    <div className="container mx-auto px-4 py-8 relative">
      {/* Hero Section with Animation */}
      <motion.div 
        className="flex flex-col items-center mb-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Image 
            src="/remittease-logo.png"
            alt="RemittEase"
            width={80}
            height={80}
            className="h-20 w-auto mb-8"
            priority
          />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight"
        >
          Global Money Transfer Simplified
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg text-gray-600 max-w-2xl mb-12"
        >
          Fast, secure, and affordable cross-border transfers powered by blockchain technology
        </motion.p>
        
        {/* Stats Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
        >
          <div className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">150+</div>
            <div className="text-sm text-gray-600">Countries Supported</div>
          </div>
          <div className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">2 min</div>
            <div className="text-sm text-gray-600">Average Transfer Time</div>
          </div>
          <div className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">1%</div>
            <div className="text-sm text-gray-600">Transaction Fee</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="max-w-4xl mx-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-sm bg-white/95">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-center md:text-left">
                  Get Started with RemittEase
                </CardTitle>
                <CardDescription className="text-center md:text-left">
                  Create or access your wallet to start sending money globally
                </CardDescription>
              </div>
              {/* Trust Indicators */}
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Secure & Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Non-Custodial</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="new-user" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full p-1 bg-gray-100 rounded-md">
                <TabsTrigger 
                  value="new-user" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 py-1">
                    <User className="w-4 h-4" />
                    New User
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="existing-user" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 py-1">
                    <Wallet className="w-4 h-4" />
                    Existing User
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new-user">
              <Form {...newUserForm}>
                    <form 
                      onSubmit={newUserForm.handleSubmit(handleCreateWallet)} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={newUserForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-black">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your full name" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="border-2 border-gray-200 focus:border-black transition-colors focus:ring-black"
                                />
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
                              <FormLabel className="text-black">Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="your@email.com" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="border-2 border-gray-200 focus:border-black transition-colors focus:ring-black"
                                />
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
                            <FormLabel className="text-black">Preferred Currency</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="border-2 border-gray-200 focus:border-black transition-colors">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map(currency => (
                                  <SelectItem 
                                    key={currency.code} 
                                    value={currency.code}
                                    className="focus:bg-black focus:text-white"
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <span>{currency.flag}</span>
                                      <span>{currency.name}</span>
                                      <span className="text-gray-500">
                                        ({currency.code})
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button 
                          type="submit"
                          className="w-full bg-black hover:bg-gray-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Creating Wallet...
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 mr-2" />
                              Create Wallet
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                          By creating a wallet, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="existing-user">
                  <Form {...existingUserForm}>
                    <form 
                      onSubmit={existingUserForm.handleSubmit(handleAccessWallet)} 
                      className="space-y-6"
                    >
                      <FormField
                        control={existingUserForm.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black">Wallet Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your wallet address" 
                                {...field}
                                disabled={isLoading}
                                className="border-2 border-gray-200 focus:border-black transition-colors focus:ring-black"
                              />
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
                            <FormLabel className="text-black">Secret Key (Seed)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showSeed ? "text" : "password"}
                                  placeholder="Enter your secret key" 
                                  {...field}
                                  disabled={isLoading}
                                  className="border-2 border-gray-200 focus:border-black transition-colors focus:ring-black pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-black"
                                  onClick={() => setShowSeed(!showSeed)}
                                >
                                  {showSeed ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button 
                          type="submit"
                          className="w-full bg-black hover:bg-gray-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Accessing Wallet...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Access Wallet
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                          Need help? Contact our support team
                        </p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        {/* Wallet Info Section */}
        {walletInfo && (
          <motion.div 
            className="mt-8 space-y-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="wallet-info"
          >
            <Alert className="border-2 border-black bg-gray-50 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-black" />
              <AlertDescription className="space-y-2">
                <p className="font-bold text-black">Important Security Information:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>Store your secret key in a secure location. It cannot be recovered if lost.</li>
                  <li>Never share your secret key with anyone.</li>
                  <li>Make sure to save or write down your seed phrase before leaving this page.</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Wallet Information</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackupDownload}
                    disabled={hasDownloadedBackup}
                    className="border-2 border-black hover:bg-black hover:text-white transition-colors duration-200"
                  >
                    {hasDownloadedBackup ? (
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Backup Saved
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download Backup
                      </span>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address Section */}
                <div className="bg-gray-50 rounded-md p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-black">Wallet Address</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(walletInfo.address, "Wallet address copied")}
                      className="hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <code className="block p-3 bg-white rounded-md break-all border-2 border-gray-200 text-sm">
                    {walletInfo.address}
                  </code>
                </div>

                {/* Balance Section */}
                <div className="bg-black rounded-md p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-300">Current Balance</p>
                      <p className="text-3xl font-bold mt-1">{walletInfo.balance} ETH</p>
                    </div>
                    <Wallet className="w-8 h-8" />
                  </div>
                </div>

                {/* Secret Key Section */}
                <div className="bg-gray-50 rounded-md p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-black">Secret Key (Seed)</label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSeed(!showSeed)}
                        className="hover:bg-black hover:text-white transition-colors duration-200"
                      >
                        {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(walletInfo.seed, "Secret key copied")}
                        className="hover:bg-black hover:text-white transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <code className="block p-3 bg-white rounded-md break-all border-2 border-gray-200 text-sm">
                      {showSeed ? walletInfo.seed : '• '.repeat(12)}
                    </code>
                  </div>
                </div>

                {/* Continue to Dashboard Button */}
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-black hover:bg-gray-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Section */}
        {!walletInfo && (
          <motion.div 
            className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
              <Shield className="w-8 h-8 text-black mb-4" />
              <h3 className="font-semibold mb-2 text-black">Secure Transactions</h3>
              <p className="text-sm text-gray-600">
                End-to-end encryption and blockchain security for your transfers
              </p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
              <Zap className="w-8 h-8 text-black mb-4" />
              <h3 className="font-semibold mb-2 text-black">Instant Transfers</h3>
              <p className="text-sm text-gray-600">
                Send money across borders in minutes, not days
              </p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
              <DollarSign className="w-8 h-8 text-black mb-4" />
              <h3 className="font-semibold mb-2 text-black">Low Fees</h3>
              <p className="text-sm text-gray-600">
                Competitive rates and minimal transaction fees
              </p>
            </div>
          </motion.div>
        )}
      </div>


    </div>
  );
}