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

export interface WalletBalance {
  address: string;
  balance: string;
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

    // Normalize the wallet address
    const normalizedAddress = ethers.utils.getAddress(walletAddress);

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

export async function createWallet(): Promise<{
  address: string;
  privateKey: string;
  mnemonic: string;
}> {
  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || ''
  };
}

export async function getWalletBalance(address: string): Promise<WalletBalance> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL
    );
    
    const balance = await provider.getBalance(address);
    
    return {
      address,
      balance: ethers.utils.formatEther(balance)
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw new Error('Failed to fetch wallet balance');
  }
}

export function validateWalletAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

export function formatWalletAddress(address: string): string {
  try {
    if (!ethers.utils.isAddress(address)) {
      throw new Error('Invalid address');
    }
    
    const normalized = ethers.utils.getAddress(address);
    return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
  } catch {
    return address;
  }
}

export function validatePrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}