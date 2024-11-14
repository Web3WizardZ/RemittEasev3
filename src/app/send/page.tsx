'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter, 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth-context';
import { validateAddress, estimateGas, formatAmount } from '@/lib/blockchain';

// Form Schema
const sendSchema = z.object({
  recipientAddress: z.string()
    .min(1, 'Recipient address is required')
    .refine(val => validateAddress(val), {
      message: 'Invalid Ethereum address',
    }),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
});

type SendForm = z.infer<typeof sendSchema>;

interface FeeEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedFee: string;
}

export default function SendPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const form = useForm<SendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      recipientAddress: '',
      amount: '',
    },
  });

  useEffect(() => {
    if (!user?.walletAddress) {
      router.push('/');
      return;
    }
    fetchBalance();
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/wallet/balance?address=${user?.walletAddress}`);
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const calculateFee = async (values: SendForm) => {
    try {
      if (!user?.walletAddress) return;

      const response = await fetch(`/api/wallet/send?from=${user.walletAddress}&to=${values.recipientAddress}&value=${values.amount}`);
      const data = await response.json();

      if (data.success) {
        setFeeEstimate(data.estimate);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to estimate transaction fee",
      });
    }
  };

  const onSubmit = async (values: SendForm) => {
    if (step === 1) {
      setIsLoading(true);
      await calculateFee(values);
      setIsLoading(false);
      setStep(2);
      return;
    }

    if (step === 2) {
      try {
        setIsConfirming(true);
        
        const response = await fetch('/api/wallet/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: user?.walletAddress,
            to: values.recipientAddress,
            value: values.amount,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setTxHash(data.transaction.hash);
        setStep(3);
        toast({
          title: "Transaction Sent",
          description: "Your transaction has been submitted successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : 'Transaction failed',
        });
      } finally {
        setIsConfirming(false);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
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
            <CardTitle>Send Money</CardTitle>
            <CardDescription>Transfer funds to another wallet</CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <Progress 
                value={(step / 3) * 100} 
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Amount</span>
                <span>Review</span>
                <span>Complete</span>
              </div>
            </div>

            {/* Step 1: Amount */}
            {step === 1 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="recipientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0x..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ETH)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              step="0.000001"
                              placeholder="0.00"
                              className="pr-16"
                            />
                            <div className="absolute right-3 top-2.5 text-sm text-gray-500">
                              ETH
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Available balance: {formatAmount(balance)} ETH
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating Fee...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && feeEstimate && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">
                      {form.getValues('amount')} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Network Fee</span>
                    <span className="font-medium">
                      {formatAmount(feeEstimate.estimatedFee)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {formatAmount(
                        (
                          Number(form.getValues('amount')) + 
                          Number(feeEstimate.estimatedFee)
                        ).toString()
                      )} ETH
                    </span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please verify all details before confirming the transaction
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Confirm & Send
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(1)}
                    disabled={isConfirming}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && txHash && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Transaction Sent!
                  </h3>
                  <p className="text-gray-500">
                    Your transaction has been submitted to the network
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">
                        Transaction Hash
                      </div>
                      <div className="font-mono text-sm break-all">
                        {txHash}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      form.reset();
                      setStep(1);
                      setFeeEstimate(null);
                      setTxHash(null);
                    }}
                  >
                    Send Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}