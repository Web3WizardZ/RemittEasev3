import { ethers } from 'ethers';

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    walletAddress: string;
  };
  wallet?: {
    address: string;
    balance: string;
  };
  error?: string;
}

export async function loginWithWallet(walletAddress: string, secretKey: string): Promise<LoginResult> {
  try {
    // Validate inputs using ethers v6 method
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!secretKey || secretKey.length < 12) {
      throw new Error('Invalid secret key');
    }

    // Normalize the wallet address
    const normalizedAddress = ethers.getAddress(walletAddress);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: normalizedAddress,
        secretKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}