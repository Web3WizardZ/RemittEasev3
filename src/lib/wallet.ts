import { ethers } from "ethers";

export const createWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic?.phrase || '',
    privateKey: wallet.privateKey,
  };
};

export const accessWallet = async (secretKey: string) => {
  try {
    // For mnemonic phrases
    if (secretKey.includes(' ')) {
      return ethers.Wallet.fromMnemonic(secretKey);
    }
    // For private keys
    return new ethers.Wallet(secretKey);
  } catch (error) {
    throw new Error('Invalid secret key');
  }
};

export const getWalletBalance = async (address: string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL
  );
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
};