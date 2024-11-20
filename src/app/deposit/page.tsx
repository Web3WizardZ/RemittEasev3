import DepositClient from './DepositClient';

export const metadata = {
  title: 'Deposit | RemittEase',
  description: 'Deposit funds to your RemittEase wallet using credit card, debit card, or bank transfer'
};

export default function DepositPage() {
  return <DepositClient />;
}