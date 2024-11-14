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
    // Validate inputs
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!secretKey || secretKey.length < 12) {
      throw new Error('Invalid secret key');
    }

    // Validate the secret key format before making the API call
    try {
      let wallet;
      if (secretKey.includes(' ')) {
        wallet = ethers.Wallet.fromMnemonic(secretKey.trim());
      } else {
        wallet = new ethers.Wallet(secretKey);
      }

      if (wallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Wallet address does not match secret key');
      }
    } catch (error) {
      throw new Error('Invalid secret key format');
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress.toLowerCase(),
        secretKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}