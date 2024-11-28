"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowRight, Send, RefreshCw, AlertCircle, CheckCircle,
  Wallet, Building, Phone, Info, ArrowLeft, Loader2
} from 'lucide-react';

const bankDetailsSchema = z.object({
  recipientName: z.string().min(2, "Name must be at least 2 characters"),
  accountNumber: z.string().min(8, "Invalid account number"),
  sortCode: z.string().min(6, "Sort code must be 6 digits"),
  swiftCode: z.string().min(8, "SWIFT/BIC code must be 8-11 characters").max(11),
  iban: z.string().min(15, "Invalid IBAN"),
  reference: z.string().min(2, "Reference is required"),
  bankName: z.string().min(2, "Bank name is required")
});

type BankDetails = z.infer<typeof bankDetailsSchema>;

interface Country {
  code: string;
  name: string;
  flag: string;
  rate: number;
  methods: string[];
}

interface RecipientDetails {
  type: 'bank' | 'wallet' | 'mobile';
  bankDetails?: BankDetails;
  walletAddress?: string;
  mobileNumber?: string;
}

interface BankFormProps {
  onSubmit: (data: BankDetails) => void;
  toCountry: string;
  onBack: () => void;
}

const countries: Country[] = [
  { code: 'USD', name: 'United States', flag: '🇺🇸', rate: 1, methods: ['bank', 'card', 'wallet'] },
  { code: 'ZAR', name: 'South Africa', flag: '🇿🇦', rate: 18.5, methods: ['bank', 'wallet', 'mobile'] },
  { code: 'NGN', name: 'Nigeria', flag: '🇳🇬', rate: 1550, methods: ['bank', 'mobile'] },
  { code: 'KES', name: 'Kenya', flag: '🇰🇪', rate: 130, methods: ['mobile', 'wallet'] },
  { code: 'GHS', name: 'Ghana', flag: '🇬🇭', rate: 12.5, methods: ['mobile', 'bank'] }
];

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$', ZAR: 'R', NGN: '₦', KES: 'KSh', GHS: '₵'
  };
  return symbols[currency] || currency;
};

const formatAmount = (amount: string | number, currency: string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(num);
};

const BankDetailsForm: React.FC<BankFormProps> = ({ onSubmit, toCountry, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BankDetails>({
    resolver: zodResolver(bankDetailsSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient's Full Name</label>
          <Input
            {...register('recipientName')}
            className="h-12"
            placeholder="Enter full name"
          />
          {errors.recipientName && (
            <p className="text-sm text-red-500">{errors.recipientName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Bank Name</label>
          <Input
            {...register('bankName')}
            className="h-12"
            placeholder="Enter bank name"
          />
          {errors.bankName && (
            <p className="text-sm text-red-500">{errors.bankName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Account Number</label>
          <Input
            {...register('accountNumber')}
            className="h-12"
            placeholder="Enter account number"
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sort Code</label>
          <Input
            {...register('sortCode')}
            className="h-12"
            placeholder="XX-XX-XX"
          />
          {errors.sortCode && (
            <p className="text-sm text-red-500">{errors.sortCode.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">SWIFT/BIC Code</label>
        <Input
          {...register('swiftCode')}
          className="h-12"
          placeholder="Enter SWIFT/BIC code"
        />
        {errors.swiftCode && (
          <p className="text-sm text-red-500">{errors.swiftCode.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">IBAN</label>
        <Input
          {...register('iban')}
          className="h-12"
          placeholder="Enter IBAN"
        />
        {errors.iban && (
          <p className="text-sm text-red-500">{errors.iban.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Reference</label>
        <Input
          {...register('reference')}
          className="h-12"
          placeholder="Enter reference"
        />
        {errors.reference && (
          <p className="text-sm text-red-500">{errors.reference.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          <ArrowRight className="w-4 h-4 mr-2" />
          Continue
        </Button>
      </div>
    </form>
  );
};

export default function SendMoneyPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientType, setRecipientType] = useState<'bank' | 'wallet' | 'mobile' | ''>('');
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState({ network: 0, service: 0, total: 0 });

  useEffect(() => {
    if (amount && fromCountry && toCountry) {
      calculateFees();
    }
  }, [amount, fromCountry, toCountry]);

  const calculateFees = () => {
    if (!amount) return;
    const networkFee = parseFloat(amount) * 0.001;
    const serviceFee = parseFloat(amount) * 0.005;
    setFees({
      network: networkFee,
      service: serviceFee,
      total: networkFee + serviceFee
    });
  };

  const calculateRate = () => {
    if (!fromCountry || !toCountry || !amount) return null;
    const from = countries.find(c => c.code === fromCountry);
    const to = countries.find(c => c.code === toCountry);
    if (!from || !to) return null;
    
    const rate = to.rate / from.rate;
    const amountInFiat = parseFloat(amount);
    const convertedAmount = amountInFiat * rate;
    return {
      rate: rate.toFixed(4),
      convertedAmount: convertedAmount.toFixed(2),
      amountAfterFees: (convertedAmount - fees.total).toFixed(2)
    };
  };

  const handleBankDetailsSubmit = (data: BankDetails) => {
    setRecipientDetails({
      type: 'bank',
      bankDetails: data
    });
    setCurrentStep(3);
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 2000));
      toast({
        title: "Transfer Initiated",
        description: "Your money is on its way to the recipient"
      });
      setCurrentStep(1);
      setFromCountry('');
      setToCountry('');
      setAmount('');
      setRecipientType('');
      setRecipientDetails(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const conversion = calculateRate();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-violet-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  Send Money Globally
                </CardTitle>
                <CardDescription>
                  Fast, secure, and affordable cross-border transfers
                </CardDescription>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Step {currentStep} of 3</span>
                  <Progress value={(currentStep / 3) * 100} className="w-24 h-2" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentStep === 1 ? 'Enter amount' : 
                   currentStep === 2 ? 'Recipient details' : 
                   'Review and confirm'}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs 
              value={currentStep === 1 ? "amount" : 
                     currentStep === 2 ? "recipient" : 
                     "confirm"}
            >
              <TabsList className="grid grid-cols-3 h-16 mb-8">
                {['Amount', 'Recipient', 'Review'].map((step, idx) => (
                  <TabsTrigger
                    key={step}
                    value={step.toLowerCase()}
                    disabled={currentStep !== idx + 1}
                    className={`
                      data-[state=active]:bg-white
                      data-[state=active]:shadow-lg
                      transition-all
                      ${idx === 0 ? 'rounded-l-lg' : ''}
                      ${idx === 2 ? 'rounded-r-lg' : ''}
                      ${currentStep > idx + 1 ? 'text-green-600' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${currentStep > idx + 1 ? 'bg-green-100' :
                          currentStep === idx + 1 ? 'bg-primary text-white' :
                          'bg-muted'}
                      `}>
                        {currentStep > idx + 1 ? '✓' : idx + 1}
                      </div>
                      {step}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Amount Step */}
              {currentStep === 1 && (
                <motion.div {...fadeInUp} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <Select onValueChange={setFromCountry} value={fromCountry}>
                        <SelectTrigger className="h-14">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              className="h-14"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{country.flag}</span>
                                <div>
                                  <p className="font-medium">{country.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {country.code}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                      <Select onValueChange={setToCountry} value={toCountry}>
                        <SelectTrigger className="h-14">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              className="h-14"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{country.flag}</span>
                                <div>
                                  <p className="font-medium">{country.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {country.code}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-14 text-lg pl-12 pr-20"
                        placeholder="0.00"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <span className="text-lg text-muted-foreground">
                          {fromCountry ? getCurrencySymbol(fromCountry) : '$'}
                        </span>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="text-sm text-muted-foreground">
                          {fromCountry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {conversion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Exchange Rate</span>
                        <span className="font-medium">
                          {formatAmount(1, fromCountry)} = {formatAmount(parseFloat(conversion.rate), toCountry)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transfer Fee</span>
                        <span className="font-medium text-gray-900">
                          {formatAmount(fees.total, fromCountry)}
                        </span>
                      </div>
                      
                      <div className="pt-4 border-t flex justify-between items-center">
                        <span className="text-sm font-medium">Recipient Gets</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(parseFloat(conversion.amountAfterFees), toCountry)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!fromCountry || !toCountry || !amount}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Continue to Recipient Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* Recipient Step */}
              {currentStep === 2 && (
                <motion.div {...fadeInUp} className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { type: 'bank', icon: Building, label: 'Bank Account' },
                      { type: 'wallet', icon: Wallet, label: 'Crypto Wallet' },
                      { type: 'mobile', icon: Phone, label: 'Mobile Money' }
                    ].map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={recipientType === type ? 'default' : 'outline'}
                        className="h-24 flex flex-col items-center justify-center gap-2"
                        onClick={() => setRecipientType(type as any)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>

                  {recipientType === 'bank' && (
                    <BankDetailsForm
                      onSubmit={handleBankDetailsSubmit}
                      toCountry={toCountry}
                      onBack={() => setRecipientType('')}
                    />
                  )}

                  {recipientType === 'wallet' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Wallet Address</label>
                        <Input
                          className="h-12"
                          placeholder="Enter blockchain wallet address"
                          onChange={(e) => {
                            setRecipientDetails({
                              type: 'wallet',
                              walletAddress: e.target.value
                            });
                          }}
                        />
                      </div>
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        className="w-full h-12"
                      >
                        Continue
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {recipientType === 'mobile' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Number</label>
                        <Input
                          className="h-12"
                          placeholder="Enter mobile number"
                          onChange={(e) => {
                            setRecipientDetails({
                              type: 'mobile',
                              mobileNumber: e.target.value
                            });
                          }}
                        />
                      </div>
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        className="w-full h-12"
                      >
                        Continue
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 3 && (
                <motion.div {...fadeInUp} className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-6">Transfer Summary</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">You Send</span>
                        <span className="font-medium">
                          {formatAmount(parseFloat(amount), fromCountry)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transfer Fee</span>
                        <span className="font-medium">
                          {formatAmount(fees.total, fromCountry)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-medium">Recipient Gets</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(parseFloat(conversion?.amountAfterFees || '0'), toCountry)}
                        </span>
                      </div>

                      {recipientDetails && (
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="font-medium mb-4">Recipient Details</h4>
                          {recipientDetails.type === 'bank' && recipientDetails.bankDetails && (
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Name</span>
                                <span className="font-medium">
                                  {recipientDetails.bankDetails.recipientName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bank</span>
                                <span className="font-medium">
                                  {recipientDetails.bankDetails.bankName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Account</span>
                                <span className="font-medium">
                                  {recipientDetails.bankDetails.accountNumber}
                                </span>
                              </div>
                            </div>
                          )}
                          {recipientDetails.type === 'wallet' && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Wallet Address</span>
                              <span className="font-medium break-all">
                                {recipientDetails.walletAddress}
                              </span>
                            </div>
                          )}
                          {recipientDetails.type === 'mobile' && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Mobile Number</span>
                              <span className="font-medium">
                                {recipientDetails.mobileNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Please verify all details before confirming. This transaction cannot be undone.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Confirm & Send
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}