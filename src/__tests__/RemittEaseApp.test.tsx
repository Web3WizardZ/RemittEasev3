import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import RemittEaseApp from '@/app/page';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock ethers
jest.mock('ethers', () => ({
  Wallet: {
    createRandom: jest.fn(),
    fromPhrase: jest.fn()
  },
  JsonRpcProvider: jest.fn(),
  formatEther: jest.fn()
}));

describe('RemittEaseApp', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
  });

  describe('New User Registration', () => {
    const mockWallet = {
      address: '0x1234567890abcdef',
      mnemonic: { phrase: 'test test test test test test test test test test test test' },
    };

    beforeEach(() => {
      (ethers.Wallet.createRandom as jest.Mock).mockReturnValue(mockWallet);
    });

    it('renders the new user form correctly', () => {
      render(<RemittEaseApp />);
      
      expect(screen.getByText('New User')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByText('Select currency')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<RemittEaseApp />);
      
      const createButton = screen.getByText('Create Wallet');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        expect(screen.getByText('Please select a currency')).toBeInTheDocument();
      });
    });

    it('creates a wallet successfully', async () => {
      render(<RemittEaseApp />);
      
      // Fill in the form
      await userEvent.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'john@example.com');
      
      // Select currency
      const currencySelect = screen.getByText('Select currency');
      await userEvent.click(currencySelect);
      await userEvent.click(screen.getByText('US Dollar (USD)'));

      // Submit form
      const createButton = screen.getByText('Create Wallet');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(mockWallet.address)).toBeInTheDocument();
        expect(screen.getByText(mockWallet.mnemonic.phrase)).toBeInTheDocument();
      });
    });

    it('handles wallet creation errors', async () => {
      // Mock fetch to return error
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.reject(new Error('Failed to create wallet'))
      );

      render(<RemittEaseApp />);
      
      // Fill in the form
      await userEvent.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'john@example.com');
      
      // Select currency
      const currencySelect = screen.getByText('Select currency');
      await userEvent.click(currencySelect);
      await userEvent.click(screen.getByText('US Dollar (USD)'));

      // Submit form
      const createButton = screen.getByText('Create Wallet');
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Existing User Login', () => {
    const mockWallet = {
      address: '0x1234567890abcdef',
      getBalance: jest.fn().mockResolvedValue('1000000000000000000')
    };

    beforeEach(() => {
      (ethers.Wallet.fromPhrase as jest.Mock).mockReturnValue(mockWallet);
      (ethers.formatEther as jest.Mock).mockReturnValue('1.0');
    });

    it('renders the existing user form correctly', async () => {
      render(<RemittEaseApp />);
      
      const existingUserTab = screen.getByText('Existing User');
      await userEvent.click(existingUserTab);

      expect(screen.getByPlaceholderText('Enter your wallet address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your secret key')).toBeInTheDocument();
    });

    it('validates wallet credentials', async () => {
      render(<RemittEaseApp />);
      
      const existingUserTab = screen.getByText('Existing User');
      await userEvent.click(existingUserTab);

      const accessButton = screen.getByText('Access Wallet');
      await userEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid wallet address')).toBeInTheDocument();
        expect(screen.getByText('Invalid secret key')).toBeInTheDocument();
      });
    });

    it('logs in successfully', async () => {
      render(<RemittEaseApp />);
      
      const existingUserTab = screen.getByText('Existing User');
      await userEvent.click(existingUserTab);

      // Fill in credentials
      await userEvent.type(
        screen.getByPlaceholderText('Enter your wallet address'),
        '0x1234567890abcdef'
      );
      await userEvent.type(
        screen.getByPlaceholderText('Enter your secret key'),
        'test test test test test test test test test test test test'
      );

      // Submit form
      const accessButton = screen.getByText('Access Wallet');
      await userEvent.click(accessButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to deposit page', async () => {
      render(<RemittEaseApp />);
      
      // Create wallet first to show the deposit button
      const mockWallet = {
        address: '0x1234567890abcdef',
        mnemonic: { phrase: 'test test test test test test test test test test test test' },
      };
      (ethers.Wallet.createRandom as jest.Mock).mockReturnValue(mockWallet);

      // Fill and submit new user form
      await userEvent.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'john@example.com');
      
      const currencySelect = screen.getByText('Select currency');
      await userEvent.click(currencySelect);
      await userEvent.click(screen.getByText('US Dollar (USD)'));

      const createButton = screen.getByText('Create Wallet');
      await userEvent.click(createButton);

      // Click deposit button
      const depositButton = await screen.findByText('Deposit Funds');
      await userEvent.click(depositButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/deposit');
    });

    it('navigates to send page', async () => {
      // Similar to deposit test but for send button
      // ... Implementation here
    });
  });
});