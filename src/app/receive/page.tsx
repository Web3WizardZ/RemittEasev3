"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ArrowLeft } from 'lucide-react';

interface QRCodeProps {
  text: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ text, size = 256 }) => {
  const generateMatrix = (input: string): boolean[][] => {
    const length = Math.ceil(Math.sqrt(input.length)) * 8;
    const matrix: boolean[][] = Array(length).fill(null).map(() => Array(length).fill(false));
    
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      const row = Math.floor(i / (length / 4));
      const col = i % (length / 4);
      
      if (row < length && col < length) {
        const value = charCode % 2 === 1;
        matrix[row * 2][col * 2] = value;
        matrix[row * 2 + 1][col * 2] = value;
        matrix[row * 2][col * 2 + 1] = value;
        matrix[row * 2 + 1][col * 2 + 1] = value;
      }
    }
    
    const addPositionPattern = (startRow: number, startCol: number): void => {
      const pattern = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ];

      pattern.forEach((row, i) => {
        row.forEach((value, j) => {
          if (startRow + i < matrix.length && startCol + j < matrix.length) {
            matrix[startRow + i][startCol + j] = value === 1;
          }
        });
      });
    };

    const padding = 4;
    addPositionPattern(padding, padding);
    addPositionPattern(padding, length - 7 - padding);
    addPositionPattern(length - 7 - padding, padding);

    for (let i = 8; i < length - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    return matrix;
  };

  const matrix = generateMatrix(text);
  const cellSize = size / matrix.length;

  return (
    <div className="bg-white p-4 rounded-lg">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'scale(0.9)' }}
      >
        <rect x="0" y="0" width={size} height={size} fill="white"/>
        {matrix.map((row, i) =>
          row.map((cell, j) =>
            cell ? (
              <rect
                key={`${i}-${j}`}
                x={j * cellSize}
                y={i * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

const ReceivePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showCopied, setShowCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/login', { method: 'GET' });
        const data = await response.json();

        if (!data.success || !data.session) {
          router.push('/');
          return;
        }

        setWalletAddress(data.session.walletAddress);
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto p-4 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Receive Funds</CardTitle>
          <CardDescription>Share your wallet address to receive funds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
            <QRCode text={walletAddress} size={240} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Wallet Address</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-gray-50 rounded-lg text-sm break-all">
                {walletAddress}
              </code>
              <Button 
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showCopied && (
            <Alert>
              <AlertDescription>
                Address copied to clipboard!
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertDescription className="text-sm">
              Only send Ethereum (ETH) or supported ERC-20 tokens to this address.
              Sending unsupported tokens may result in permanent loss.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivePage;