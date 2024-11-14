import { ethers } from 'ethers';

export interface Transaction {
  hash: string;
  from: string;
  to: string | null | undefined;  // Updated to include undefined
  value: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TransactionDetails {
  hash: string;
  from: string;
  to: string | null | undefined;  // Updated to include undefined
  value: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  gasPrice: string;
  gasUsed?: string;
  fee?: string;
}

let provider: ethers.providers.JsonRpcProvider | null = null;

export const getProvider = () => {
  if (!provider) {
    const providerUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER_URL;
    if (!providerUrl) {
      throw new Error('Blockchain provider URL not configured');
    }
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
  }
  return provider;
};

export const getBalance = async (address: string): Promise<string> => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0.00';
  }
};

export const getTransactionHistory = async (address: string): Promise<Transaction[]> => {
  try {
    const provider = getProvider();
    
    // Get the latest block number
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 10000); // Last 10000 blocks

    // Get transactions where the address is either sender or receiver
    const filter = {
      fromBlock,
      toBlock: 'latest',
      address: address
    };

    const logs = await provider.getLogs(filter);
    
    const processedTxs: Transaction[] = [];
    
    for (const log of logs) {
      const tx = await provider.getTransaction(log.transactionHash);
      if (!tx) continue;
      
      const block = await provider.getBlock(log.blockNumber);
      if (!block) continue;

      const receipt = await provider.getTransactionReceipt(log.transactionHash);
      
      processedTxs.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || null,  // Convert undefined to null
        value: ethers.utils.formatEther(tx.value),
        timestamp: new Date(block.timestamp * 1000).toISOString(),
        status: receipt?.status === 1 ? 'completed' : receipt ? 'failed' : 'pending'
      });
    }

    return processedTxs;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};

export const getTransactionDetails = async (txHash: string): Promise<TransactionDetails | null> => {
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return null;
    }

    const block = await provider.getBlock(tx.blockNumber || await provider.getBlockNumber());
    const receipt = await provider.getTransactionReceipt(txHash);

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || null,  // Convert undefined to null
      value: ethers.utils.formatEther(tx.value),
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      status: receipt?.status === 1 ? 'completed' : receipt ? 'failed' : 'pending',
      gasPrice: ethers.utils.formatUnits(tx.gasPrice || 0, 'gwei'),
      gasUsed: receipt ? receipt.gasUsed.toString() : undefined,
      fee: receipt ? ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice || 0)) : undefined
    };
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return null;
  }
};

export const estimateGas = async (
  from: string, 
  to: string, 
  value: string
): Promise<{ gasLimit: string; gasPrice: string; estimatedFee: string }> => {
  try {
    const provider = getProvider();
    const valueWei = ethers.utils.parseEther(value);
    
    const [gasLimit, gasPrice] = await Promise.all([
      provider.estimateGas({
        from,
        to,
        value: valueWei
      }),
      provider.getGasPrice()
    ]);

    const estimatedFee = gasLimit.mul(gasPrice);

    return {
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      estimatedFee: ethers.utils.formatEther(estimatedFee)
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error('Failed to estimate transaction fee');
  }
};

export const sendTransaction = async (
  from: string,
  to: string,
  value: string,
  privateKey: string
): Promise<{ hash: string }> => {
  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(value)
    });

    return { hash: tx.hash };
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction');
  }
};

export const validateAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

export const formatAmount = (amount: string, decimals: number = 6): string => {
  try {
    const formatted = parseFloat(amount).toFixed(decimals);
    return formatted.replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
};