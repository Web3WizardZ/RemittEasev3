"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send, ArrowUpRight, ArrowDownRight, RefreshCw, Wallet,
  Copy, DollarSign, Upload, Download, CheckCircle2,
  AlertTriangle, LogOut, LineChart, Settings, Bell
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfile {
  name: string;
  email: string;
  currency: string;
  walletAddress: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  to?: string;
  from?: string;
  status: 'pending' | 'completed';
  date: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const chartData = [
  { date: '2024-03-20', value: 2.4 },
  { date: '2024-03-21', value: 1.8 },
  { date: '2024-03-22', value: 3.2 },
  { date: '2024-03-23', value: 2.1 },
  { date: '2024-03-24', value: 4.5 },
  { date: '2024-03-25', value: 3.8 },
  { date: '2024-03-26', value: 2.9 },
];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });
  const [providerError, setProviderError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const showNotification = (message: string, type: NotificationState['type'] = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setErrorMessage(null);

      const response = await fetch('/api/auth/login', { method: 'GET' });
      const data = await response.json();

      if (!data.success || !data.session) throw new Error('Session not found');

      const sessionData = data.session;
      setProfile({
        name: sessionData.name || 'User',
        email: sessionData.email || '',
        currency: sessionData.currency || 'USD',
        walletAddress: sessionData.walletAddress,
      });

      // Mock data for demo
      setBalance('1.5');
      setTransactions([
        {
          id: '0x1234567890abcdef1',
          type: 'received',
          amount: '0.5',
          currency: 'ETH',
          from: '0x9876543210fedcba1',
          status: 'completed',
          date: new Date().toISOString()
        },
        {
          id: '0x1234567890abcdef2',
          type: 'sent',
          amount: '0.2',
          currency: 'ETH',
          to: '0x9876543210fedcba2',
          status: 'completed',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load user data';
      setErrorMessage(errorMsg);
      showNotification('Please log in again', 'error');
      setTimeout(() => window.location.href = '/', 2000);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/login', { method: 'DELETE' });
      if (response.ok) window.location.href = '/';
      else showNotification('Failed to logout', 'error');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout', 'error');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`${type} copied`);
    } catch (err) {
      showNotification('Failed to copy', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-[300px] h-[150px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
            <h2 className="text-xl font-semibold">{errorMessage || 'Session Expired'}</h2>
            <p className="text-gray-600 text-center">Please log in again to continue</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full mt-4"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-6">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <Badge variant="outline" className="ml-2">{profile.currency}</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  <div className="p-4 text-sm text-gray-500">No new notifications</div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100">Total Balance</p>
                    <h2 className="text-4xl font-bold mt-2">{balance} ETH</h2>
                    <p className="text-blue-100 mt-1">
                      ≈ ${(parseFloat(balance) * 3000).toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-blue-100"
                    onClick={fetchUserData}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Chart */}
                <div className="h-48 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#fff" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke="#fff" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString()} 
                      />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          color: '#1e40af',
                          borderRadius: '8px',
                          border: 'none'
                        }}
                      />
                      <Area 
                        type="monotone"
                        dataKey="value"
                        stroke="#fff"
                        fill="url(#gradientArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Send', color: 'bg-blue-50 text-blue-600' },
                { icon: Download, label: 'Receive', color: 'bg-green-50 text-green-600' },
                { icon: Upload, label: 'Deposit', color: 'bg-purple-50 text-purple-600' },
                { icon: DollarSign, label: 'Exchange', color: 'bg-orange-50 text-orange-600' }
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${action.color} hover:brightness-95`}
                  onClick={() => window.location.href = `/${action.label.toLowerCase()}`}
                >
                  <action.icon className="h-6 w-6" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest transfers</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'sent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {tx.type === 'sent' ? 
                              <ArrowUpRight className="h-4 w-4" /> : 
                              <ArrowDownRight className="h-4 w-4" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.type === 'sent' ? 
                                `Sent to ${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}` : 
                                `Received from ${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(tx.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.currency}
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
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Wallet Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm break-all">
                      {profile.walletAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(profile.walletAddress, "Address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Network</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_ENV === 'production' 
                        ? 'Ethereum Mainnet' 
                        : 'Sepolia Testnet'}
                    </p>
                    <Badge variant="outline">Live</Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {providerError ? 'Disconnected' : 'Connected'}
                    </p>
                    <div className={`h-3 w-3 rounded-full ${
                      providerError ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Transaction overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Total Sent', value: '2.5 ETH', change: '+12.5%' },
                  { label: 'Total Received', value: '4.0 ETH', change: '+8.2%' },
                  { label: 'Average Transaction', value: '0.8 ETH', change: '-2.1%' }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="font-medium">{stat.value}</p>
                    </div>
                    <Badge variant={stat.change.startsWith('+') ? 'default' : 'destructive'}>
                      {stat.change}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Network Status Alert */}
            {providerError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Network connection issues detected. Some features may be limited.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`
          fixed bottom-4 right-4 p-4 rounded-lg shadow-lg 
          flex items-center gap-2 animate-slide-up z-50
          ${notification.type === 'success' ? 'bg-green-100 text-green-700' : ''}
          ${notification.type === 'error' ? 'bg-red-100 text-red-700' : ''}
          ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : ''}
        `}>
          <CheckCircle2 className="h-4 w-4" />
          {notification.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;