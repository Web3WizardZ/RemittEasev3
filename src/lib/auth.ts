import { ethers } from 'ethers';

interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    name?: string;
    email?: string;
    walletAddress: string;
  };
  error?: string;
}

interface AuthError {
  message: string;
}

export async function loginWithWallet(walletAddress: string, secretKey: string): Promise<LoginResult> {
  try {
    // Validate inputs using ethers v5 syntax
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!secretKey || secretKey.length < 12) {
      throw new Error('Invalid secret key');
    }

    // Normalize the wallet address using ethers v5 syntax
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
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/login', {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getSession(): Promise<LoginResult> {
  try {
    const response = await fetch('/api/auth/login');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get session');
    }

    return data;
  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session'
    };
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