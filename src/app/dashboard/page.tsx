'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  Copy,
  DollarSign,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react';

// Types
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

export default function Page() {
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

  const showNotification = (message: string, type: NotificationState['type'] = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchTransactions = async (walletAddress: string): Promise<Transaction[]> => {
    // Mock transactions for testing
    const mockTransactions: Transaction[] = [
      {
        id: '0x1234567890abcdef1',
        type: 'received',
        amount: '0.5',
        currency: 'ETH',
        from: '0x9876543210fedcba1',
        status: 'completed',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '0x1234567890abcdef2',
        type: 'sent',
        amount: '0.2',
        currency: 'ETH',
        to: '0x9876543210fedcba2',
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '0x1234567890abcdef3',
        type: 'received',
        amount: '1.0',
        currency: 'ETH',
        from: '0x9876543210fedcba3',
        status: 'completed',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return mockTransactions;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setErrorMessage(null);

      // Fetch session data
      const response = await fetch('/api/auth/login', {
        method: 'GET',
      });

      const data = await response.json();

      if (!data.success || !data.session) {
        throw new Error('Session not found');
      }

      const sessionData = data.session;

      setProfile({
        name: sessionData.name || 'User',
        email: sessionData.email || '',
        currency: sessionData.currency || 'USD',
        walletAddress: sessionData.walletAddress,
      });

      // Get blockchain data
      try {
        // Fetch balance (using mock data for now)
        setBalance('1.5');

        // Fetch transactions
        const recentTxs = await fetchTransactions(sessionData.walletAddress);
        setTransactions(recentTxs);
        setProviderError(false);
      } catch (err) {
        console.error('Blockchain data fetch error:', err);
        setProviderError(true);
        showNotification('Failed to fetch blockchain data', 'error');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load user data';
      setErrorMessage(errorMsg);
      showNotification('Please log in again to continue', 'error');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        showNotification('Failed to logout', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout', 'error');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
        <p className="text-gray-600">{errorMessage}</p>
        <Button 
          onClick={() => fetchUserData()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">Session Expired</h2>
        <p className="text-gray-600">Please log in again to access your dashboard</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="mt-4"
        >
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Network Status Alert */}
      {providerError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Unable to connect to blockchain network. Some features may be limited.
            </p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up z-50
          ${notification.type === 'success' ? 'bg-green-100 text-green-700' : ''}
          ${notification.type === 'error' ? 'bg-red-100 text-red-700' : ''}
          ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : ''}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {notification.message}
        </div>
      )}

      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Welcome, {profile.name}</h1>
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            {profile.currency}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => fetchUserData()}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Wallet Information */}
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Wallet
          </CardTitle>
          <CardDescription>Manage your RemittEase wallet and funds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Wallet Address</span>
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <code className="text-sm">{profile.walletAddress}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(profile.walletAddress, "Wallet address")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-2xl font-bold">{balance} ETH</div>
              <div className="text-sm text-muted-foreground">
                ≈ {(parseFloat(balance) * (profile.currency === 'USD' ? 3000 : 55000)).toFixed(2)} {profile.currency}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => window.location.href = '/send'}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
          disabled={providerError}
        >
          <Send className="w-6 h-6" />
          <span>Send Money</span>
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/receive'}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700"
        >
          <Download className="w-6 h-6" />
          <span>Receive</span>
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/deposit'}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700"
          disabled={providerError}
        >
          <Upload className="w-6 h-6" />
          <span>Deposit</span>
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/exchange'}
          className="flex-1 p-6 h-auto flex flex-col items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700"
        >
          <DollarSign className="w-6 h-6" />
          <span>Exchange</span>
        </Button>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest money transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {providerError ? 'Unable to load transactions' : 'No transactions yet'}
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'sent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {tx.type === 'sent' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type === 'sent' ? `Sent to ${tx.to}` : `Received from ${tx.from}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>Current blockchain network status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Connection Status</p>
                <p className="font-medium">
                  {providerError ? 'Disconnected' : 'Connected'}
                </p>
              </div>
              <div className={`h-3 w-3 rounded-full ${
                providerError ? 'bg-red-500' : 'bg-green-500'
              }`} />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="font-medium">
                  {process.env.NEXT_PUBLIC_ENV === 'production' 
                    ? 'Ethereum Mainnet' 
                    : 'Sepolia Testnet'}
                </p>
              </div>
              <Badge variant="outline">Live</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer with last update time */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </div>

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