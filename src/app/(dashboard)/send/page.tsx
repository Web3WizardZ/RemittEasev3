import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Send, AlertCircle, CheckCircle2, Timer } from 'lucide-react';

const TransactionFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sendAmount: '',
    sendCurrency: '',
    receiveCurrency: '',
    recipientAddress: '',
    recipientPhone: '',
    senderSeed: ''
  });
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.5 },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1550 },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 130 },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 12.5 }
  ];

  useEffect(() => {
    if (formData.sendCurrency && formData.receiveCurrency && formData.sendAmount) {
      const fromRate = currencies.find(c => c.code === formData.sendCurrency)?.rate || 1;
      const toRate = currencies.find(c => c.code === formData.receiveCurrency)?.rate || 1;
      setExchangeRate((toRate / fromRate).toFixed(4));
    }
  }, [formData.sendCurrency, formData.receiveCurrency, formData.sendAmount]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateFee = () => {
    return (parseFloat(formData.sendAmount || 0) * 0.01).toFixed(2); // 1% fee
  };

  const calculateReceiveAmount = () => {
    const amount = parseFloat(formData.sendAmount || 0);
    const fee = parseFloat(calculateFee());
    const rate = parseFloat(exchangeRate || 1);
    return ((amount - fee) * rate).toFixed(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setStep(4); // Move to success state
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Send From</label>
          <Select value={formData.sendCurrency} onValueChange={v => handleInputChange('sendCurrency', v)}>
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
        <div>
          <label className="block text-sm font-medium mb-2">Send To</label>
          <Select value={formData.receiveCurrency} onValueChange={v => handleInputChange('receiveCurrency', v)}>
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount to Send</label>
        <div className="relative">
          <Input 
            type="number"
            value={formData.sendAmount}
            onChange={e => handleInputChange('sendAmount', e.target.value)}
            placeholder="Enter amount"
            className="pr-16"
          />
          <span className="absolute right-3 top-2 text-gray-500">
            {formData.sendCurrency}
          </span>
        </div>
      </div>

      {exchangeRate && formData.sendAmount && (
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">You Send</div>
                <div className="text-lg font-bold">
                  {formData.sendAmount} {formData.sendCurrency}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Exchange Rate</div>
                <div className="text-lg font-bold">
                  1 {formData.sendCurrency} = {exchangeRate} {formData.receiveCurrency}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Recipient Gets</div>
                <div className="text-lg font-bold">
                  {calculateReceiveAmount()} {formData.receiveCurrency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Recipient's Wallet Address</label>
        <Input 
          value={formData.recipientAddress}
          onChange={e => handleInputChange('recipientAddress', e.target.value)}
          placeholder="Enter XRP wallet address"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Recipient's Phone Number</label>
        <Input 
          value={formData.recipientPhone}
          onChange={e => handleInputChange('recipientPhone', e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Your Wallet Secret Key</label>
        <Input 
          type="password"
          value={formData.senderSeed}
          onChange={e => handleInputChange('senderSeed', e.target.value)}
          placeholder="Enter your secret key"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">You Send</span>
              <span className="font-bold">{formData.sendAmount} {formData.sendCurrency}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Fee</span>
              <span className="font-bold">{calculateFee()} {formData.sendCurrency}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Exchange Rate</span>
              <span className="font-bold">1 {formData.sendCurrency} = {exchangeRate} {formData.receiveCurrency}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Recipient Gets</span>
              <span className="font-bold">{calculateReceiveAmount()} {formData.receiveCurrency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please verify all details before confirming the transaction.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Transfer Successful!</h3>
        <p className="text-gray-600">Your money is on its way to the recipient.</p>
      </div>
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono">TXN-{Math.random().toString(36).substr(2, 9)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Amount Sent</span>
              <span className="font-bold">{calculateReceiveAmount()} {formData.receiveCurrency}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Send Money</CardTitle>
          <CardDescription>
            Fast and secure cross-border transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step < 4 && (
            <div className="mb-8">
              <Progress value={(step / 3) * 100} className="mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Amount</span>
                <span>Recipient</span>
                <span>Confirm</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Timer className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div className="text-lg font-medium">Processing your transfer...</div>
            </div>
          ) : (
            <>
              {renderStepContent()}

              {step < 4 && (
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(s => s - 1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    className={step === 1 ? 'w-full' : 'ml-auto'}
                    onClick={() => step === 3 ? handleSubmit() : setStep(s => s + 1)}
                  >
                    {step === 3 ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Confirm & Send
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === 4 && (
                <Button 
                  className="w-full mt-6"
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      sendAmount: '',
                      sendCurrency: '',
                      receiveCurrency: '',
                      recipientAddress: '',
                      recipientPhone: '',
                      senderSeed: ''
                    });
                  }}
                >
                  Send Another Transfer
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionFlow;
