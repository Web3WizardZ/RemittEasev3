"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard,
  History,
  Send,
  Plus,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const transactions = [
  {
    id: 1,
    type: 'sent',
    amount: '1,200.00',
    currency: 'USD',
    recipient: 'John Doe',
    date: '2024-03-07',
    status: 'completed'
  },
  {
    id: 2,
    type: 'received',
    amount: '850.00',
    currency: 'EUR',
    sender: 'Alice Smith',
    date: '2024-03-06',
    status: 'completed'
  },
  // Add more transactions as needed
];

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSendMoney = () => {
    router.push('/send');
  };

  const handleDeposit = () => {
    router.push('/deposit');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your transfers and wallet
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,850.00</div>
            <p className="text-xs text-muted-foreground">
              Available in your wallet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Sent
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">
              Total sent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Received
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850.00</div>
            <p className="text-xs text-muted-foreground">
              Total received this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button 
          className="flex-1" 
          size="lg"
          onClick={handleSendMoney}
        >
          <Send className="mr-2 h-4 w-4" /> Send Money
        </Button>
        <Button 
          className="flex-1" 
          variant="outline" 
          size="lg"
          onClick={handleDeposit}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest transfer activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {transaction.type === 'sent' ? (
                    <div className="p-2 bg-red-100 rounded-full">
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-100 rounded-full">
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                      {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'sent' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {transaction.type === 'sent' ? '-' : '+'}
                    {transaction.currency} {transaction.amount}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => router.push('/history')}
          >
            <History className="mr-2 h-4 w-4" />
            View All Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}