'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer,
  PieChart, Pie, Cell,
  Legend
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import {
  Activity, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw,
  Send, Banknote, Download, Upload, CreditCard, AlertCircle,
  Landmark, TrendingUp, History, Settings, ChevronRight,
  Clock, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon,
  Zap, Shield, Bell
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  preferredCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [convertedBalance, setConvertedBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationCount, setNotificationCount] = useState(3);
  const [progress, setProgress] = useState(0);

  const pieData = [
    { name: 'Sent', value: 400 },
    { name: 'Received', value: 300 },
    { name: 'Pending', value: 100 },
    { name: 'Failed', value: 50 }
  ];

  const weeklyData = [
    { name: 'Mon', sent: 4, received: 2.4 },
    { name: 'Tue', sent: 3, received: 1.3 },
    { name: 'Wed', sent: 2, received: 9.5 },
    { name: 'Thu', sent: 2.7, received: 3.5 },
    { name: 'Fri', sent: 4.8, received: 5 },
    { name: 'Sat', sent: 3.1, received: 2.1 },
    { name: 'Sun', sent: 5.5, received: 3.2 }
  ];

  // Action handlers
  const handleDeposit = () => router.push('/deposit');
  const handleWithdraw = () => router.push('/withdraw');
  const handleSend = () => router.push('/send');
  const handleReceive = () => router.push('/receive');

  const fetchData = async () => {
    try {
      if (!profile?.walletAddress) return;
      setRefreshing(true);

      const providerUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL;
      if (!providerUrl) {
        throw new Error('Blockchain provider URL not configured');
      }

      const provider = new ethers.JsonRpcProvider(providerUrl);
      
      // Fetch balance
      const rawBalance = await provider.getBalance(profile.walletAddress);
      const formattedBalance = ethers.formatEther(rawBalance);
      setBalance(formattedBalance);

      // Simulate some progress
      simulateTransactionProgress();

      // Fetch recent transactions
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 10);
      const filter = {
        fromBlock,
        toBlock: 'latest',
        address: profile.walletAddress
      };

      const logs = await provider.getLogs(filter);
      const processedTxs: Transaction[] = [];

      for (const log of logs.slice(0, 5)) {
        const tx = await provider.getTransaction(log.transactionHash);
        if (!tx) continue;

        const receipt = await provider.getTransactionReceipt(log.transactionHash);
        
        processedTxs.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          timestamp: new Date().toISOString(),
          status: receipt?.status ? 'completed' : 'failed'
        });
      }

      setTransactions(processedTxs);

      // Update chart data
      const newChartData = processedTxs.map(tx => ({
        date: new Date(tx.timestamp).toLocaleDateString(),
        value: parseFloat(tx.value)
      }));
      setChartData(newChartData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setShowNetworkError(true);
    } finally {
      setRefreshing(false);
    }
  };

  const simulateTransactionProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        const userProfile = await response.json();
        setProfile(userProfile);
        await fetchData();
        simulateTransactionProgress();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <Skeleton className="h-4 w-[140px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[180px] mb-2" />
              <Skeleton className="h-4 w-[240px]" />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <Skeleton className="h-4 w-[140px]" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-12 w-[100px]" />
                <Skeleton className="h-12 w-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <Skeleton className="h-4 w-[140px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="animate-pulse flex justify-center mt-8">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            Mainnet
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="relative" onClick={() => setNotificationCount(0)}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Security</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedBalance} {profile?.preferredCurrency}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Price</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32 GWEI</div>
            <p className="text-xs text-muted-foreground">
              Average network fee
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          onClick={handleDeposit}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700"
        >
          <Upload className="w-6 h-6" />
          <span>Deposit</span>
        </Button>
        
        <Button
          onClick={handleWithdraw}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700"
        >
          <Download className="w-6 h-6" />
          <span>Withdraw</span>
        </Button>
        
        <Button
          onClick={handleSend}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
        >
          <Send className="w-6 h-6" />
          <span>Send</span>
        </Button>
        
        <Button
          onClick={handleReceive}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700"
        >
          <CreditCard className="w-6 h-6" />
          <span>Receive</span>
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Overview</CardTitle>
                <CardDescription>Your current wallet balance and value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold">{convertedBalance} {profile?.preferredCurrency}</p>
                    <p className="text-sm text-muted-foreground">{balance} ETH</p>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Overview of your transaction types</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your transaction activity over the past week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" />
                  <Bar dataKey="received" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your transaction history across all wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <History className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.hash}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            tx.from === profile?.walletAddress
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {tx.from === profile?.walletAddress ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.from === profile?.walletAddress ? 'Sent' : 'Received'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            tx.from === profile?.walletAddress
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {tx.from === profile?.walletAddress ? '-' : '+'}{tx.value} ETH
                          </p>
                          <Badge 
                            variant={tx.status === 'completed' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gas Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Gas Usage Analysis</CardTitle>
                <CardDescription>Track your gas spending over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>Transaction success analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Successful</span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>
                  <Progress value={98} className="bg-green-100" />
                  
                  <div className="flex justify-between items-center">
                    <span>Failed</span>
                    <span className="font-bold text-red-600">2%</span>
                  </div>
                  <Progress value={2} className="bg-red-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Network Error Dialog */}
      <AlertDialog open={showNetworkError} onOpenChange={setShowNetworkError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Network Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was a problem connecting to the network. This might be due to:
              <ul className="list-disc ml-6 mt-2">
                <li>Internet connection issues</li>
                <li>Blockchain network congestion</li>
                <li>Server maintenance</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowNetworkError(false);
              fetchData();
            }}>
              Try Again
            </AlertDialogAction>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={fetchData}
          disabled={refreshing}
          size="lg"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .hover-scale {
          transition: transform 0.2s ease-in-out;
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}